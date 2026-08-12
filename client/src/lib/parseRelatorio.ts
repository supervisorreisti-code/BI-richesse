/**
 * Estilo: Executive Ledger — parser do relatório de texto colado pelo usuário.
 * Extrai do texto "RELATÓRIO DE VENDAS — RICHESSE" as lojas, metas, vendas e
 * rankings de vendedores, retornando uma prévia para confirmação antes de
 * importar para o DataStore.
 *
 * Formato esperado (calibrado com o relatório de Junho):
 *   PERIODO: <MÊS>            (opcional — se ausente, o usuário escolhe)
 *   N. RICHESSE <NOME DA LOJA>
 *   Meta: R$ ...              (valor brasileiro completo)
 *   Total de vendas: R$ ...   (valor brasileiro completo)
 *   Top 8 garçons: / Garçons:
 *     N. <nome> — R$ <valor>  (valor em "mil" ou exato, ex.: 241,18)
 *
 * Regras: metas/vendas totais mantidas como informadas (oficiais); valores
 * em "mil" ×1000; "SETOR OESTE" → "Richesse Oeste".
 */
import { LojaPeriodo, RankingVendedor } from "./data";

export interface LojaExtraida {
  lojaOficial: string;
  nomeNoRelatorio: string;
  meta: number;
  vendas: number;
  vendedores: { vendedor: string; vendas: number }[];
  reconhecida: boolean;
}

export interface RelatorioExtraido {
  periodoDetectado: string | null;
  lojas: LojaExtraida[];
  avisos: string[];
  /** total de vendedores extraídos (somente para prévia) */
  totalVendedores: number;
}

/** Normaliza acentos e caixa para facilitar o casamento de nomes de loja. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Mapeia o nome da loja no relatório para o nome oficial padrão. */
export function mapearLoja(nomeRelatorio: string): { oficial: string; reconhecida: boolean } {
  const n = normalizar(nomeRelatorio);
  if (n.includes("flamboyant")) return { oficial: "Richesse Flamboyant", reconhecida: true };
  if (n.includes("marista")) return { oficial: "Richesse Marista", reconhecida: true };
  if (n.includes("togo") || n.includes("to go") || n.includes("tô go"))
    return { oficial: "Richesse TOGO", reconhecida: true };
  if (n.includes("gelateria")) return { oficial: "Richesse Gelateria", reconhecida: true };
  if (n.includes("prime")) return { oficial: "Richesse Prime", reconhecida: true };
  if (n.includes("park")) return { oficial: "Richesse Park", reconhecida: true };
  if (n.includes("goiania") || n.includes("goiânia")) return { oficial: "Richesse Goiânia Shopping", reconhecida: true };
  if (n.includes("oeste") || n.includes("setor oeste")) return { oficial: "Richesse Oeste", reconhecida: true };
  return { oficial: nomeRelatorio.trim(), reconhecida: false };
}

const MESES = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** Detecta o período mencionado no texto do relatório. */
export function detectarPeriodo(texto: string): string | null {
  for (const linha of texto.split("\n")) {
    const n = normalizar(linha);
    if (n.includes("periodo") && n.includes(":")) {
      const valor = n.split(":")[1];
      for (const mes of MESES) {
        if (valor.includes(mes)) return mes.charAt(0).toUpperCase() + mes.slice(1);
      }
    }
  }
  return null;
}

/** Converte um número brasileiro textual em número. Aceita:
 *  "1.258.616,00" → 1258616 | "101 mil" → 101000 | "241,18" → 241.18 */
export function parsearValor(raw: string): number | null {
  const t = raw
    .replace(/R\$/g, "")
    .replace(/\./g, "§") // separador de milhar temporário
    .replace(/,/g, ".")
    .replace(/§/g, "")
    .trim();
  const semMil = t.replace(/\s*mil\b/i, "").trim();
  const num = Number(semMil);
  if (Number.isNaN(num)) return null;
  const contemMil = /mil/i.test(t);
  return contemMil ? num * 1000 : num;
}

// Seção de loja: "N. RICHESSE <NOME>" — nunca contém travessão nem "R$"
const SECAO_LOJA = /^\s*\d+\.\s*(?:RICHESSE\s+)?([A-ZÀ-Ú][A-ZÀ-Ú0-9\s\-']+?)\s*$/;
const LINHA_META = /^\s*Meta\s*:\s*(.+)$/i;
const LINHA_VENDAS = /^\s*Total de vendas\s*:\s*(.+)$/i;
// Linha de vendedor: "N. <nome> — R$ <valor>" — requer o padrão monetário R$
const LINHA_VENDEDOR = /^\s*\d+\.\s*([A-Za-zÀ-ú][A-Za-zÀ-ú0-9\s\-\.']{1,50}?)\s*[—\-]\s*(R\$\s*.+)$/;

export function extrairRelatorio(texto: string): RelatorioExtraido {
  const linhas = texto.split("\n");
  const lojas: LojaExtraida[] = [];
  const avisos: string[] = [];
  let atual: LojaExtraida | null = null;
  const periodoDetectado = detectarPeriodo(texto);

  let dentroDeListaVendedores = false;

  for (const linha of linhas) {
    const limpa = linha.trim();
    if (!limpa || limpa === "---" || limpa.startsWith("=")) continue;

    if (/^RELATÓRIO DE VENDAS/i.test(limpa) || /TOTAL DE LOJAS/i.test(limpa) || /^Observação/i.test(limpa)) {
      if (atual) lojas.push(atual);
      atual = null;
      dentroDeListaVendedores = false;
      continue;
    }

    const sec = limpa.match(SECAO_LOJA);
    if (sec) {
      // Fecha a loja anterior (se houver) antes de abrir uma nova
      if (atual) lojas.push(atual);
      const nome = sec[1];
      const { oficial, reconhecida } = mapearLoja(nome);
      if (!reconhecida) avisos.push(`Loja não reconhecida automaticamente: "${nome}" — será criada como "${oficial}".`);
      atual = { lojaOficial: oficial, nomeNoRelatorio: nome, meta: 0, vendas: 0, vendedores: [], reconhecida };
      dentroDeListaVendedores = false;
      continue;
    }

    if (atual) {
      const meta = limpa.match(LINHA_META);
      const vendas = limpa.match(LINHA_VENDAS);
      const vend = limpa.match(LINHA_VENDEDOR);

      if (meta) {
        const v = parsearValor(meta[1]);
        if (v === null) avisos.push(`Não foi possível ler a meta de ${atual.nomeNoRelatorio}: "${meta[1]}".`);
        else atual.meta = v;
        dentroDeListaVendedores = false;
      } else if (vendas) {
        const v = parsearValor(vendas[1]);
        if (v === null) avisos.push(`Não foi possível ler as vendas de ${atual.nomeNoRelatorio}: "${vendas[1]}".`);
        else atual.vendas = v;
        dentroDeListaVendedores = false;
      } else if (/(Top\s+\d+\s+gar[çc]ons|gar[çc]ons\s*:\s*)/i.test(limpa)) {
        dentroDeListaVendedores = true;
      } else if (dentroDeListaVendedores && vend) {
        const v = parsearValor(vend[2]);
        if (v === null) {
          avisos.push(`Não foi possível ler as vendas de ${vend[1]} (${atual.nomeNoRelatorio}): "${vend[2]}".`);
        } else {
          atual.vendedores.push({ vendedor: vend[1].trim(), vendas: v });
        }
      }
    }
  }

  // Fecha a última loja e valida os totais informados (regra oficial)
  if (atual) lojas.push(atual);
  for (const l of lojas) {
    if (l.meta === 0 && l.vendas === 0) {
      avisos.push(`${l.nomeNoRelatorio} não possui meta/vendas informadas no texto.`);
    }
  }

  return {
    periodoDetectado,
    lojas,
    avisos,
    totalVendedores: lojas.reduce((s, l) => s + l.vendedores.length, 0),
  };
}

export function extrairParaRegistros(
  extraido: RelatorioExtraido,
  periodo: string,
): { lojas: LojaPeriodo[]; ranking: RankingVendedor[] } {
  const lojas: LojaPeriodo[] = [];
  const ranking: RankingVendedor[] = [];
  for (const l of extraido.lojas) {
    lojas.push({
      periodo,
      loja: l.lojaOficial,
      vendas_total: l.vendas,
      meta: l.meta,
      atingimento_percentual: l.meta === 0 ? 0 : l.vendas / l.meta,
      diferenca_meta: l.vendas - l.meta,
    });
    l.vendedores.forEach((v, i) => {
      ranking.push({ periodo, loja: l.lojaOficial, posicao: i + 1, vendedor: v.vendedor, vendas: v.vendas });
    });
  }
  return { lojas, ranking };
}
