/**
 * Estilo: Executive Ledger — DataStore do BI.
 * Mantém os dados OFICIAIS embutidos como base e permite que o usuário edite/
 * adicione registros pelo painel de administração. As edições ficam salvas no
 * localStorage do navegador (chave "bi-richesse:dados") e são preferidas sobre
 * os dados oficiais quando existem. Inclui importação/exportação JSON para
 * backup e transferência entre dispositivos.
 * Regras do negócio continuam valendo: nomes padronizados, atingimento e
 * diferença recalculados a partir de vendas/meta.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { trpc } from "./trpc";
import {
  lojasPeriodos as OFICIAIS_LOJAS,
  rankingVendedores as OFICIAIS_RANKING,
  LOJAS_PADRAO,
  LojaPeriodo,
  RankingVendedor,
} from "./data";

const STORAGE_KEY = "bi-richesse:dados:v1";

/** Contador global compartilhado entre chamadas diretas (ex.: restaurarPadrao)
 *  e o DataProvider, para forçar re-render após alterações no localStorage. */
let versaoGlobal = 0;
export function dispararRecarga() {
  versaoGlobal += 1;
  window.dispatchEvent(new CustomEvent("bi-richesse:recarregar", { detail: versaoGlobal }));
}

interface DadosSalvos {
  lojasPeriodos: LojaPeriodo[];
  rankingVendedores: RankingVendedor[];
  salvoEm: string;
  sincronizado?: boolean;
}

/** Recalcula atingimento e diferença a partir de vendas e meta (regra oficial). */
export function recalcular(r: LojaPeriodo): LojaPeriodo {
  return {
    ...r,
    atingimento_percentual: r.meta === 0 ? 0 : r.vendas_total / r.meta,
    diferenca_meta: r.vendas_total - r.meta,
  };
}

function recalcularRanking(ranking: RankingVendedor[]): RankingVendedor[] {
  return [...ranking].sort((a, b) => b.vendas - a.vendas).map((r, i) => ({ ...r, posicao: i + 1 }));
}

function carregarDadosSalvos(): DadosSalvos | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DadosSalvos;
    if (
      Array.isArray(parsed.lojasPeriodos) &&
      Array.isArray(parsed.rankingVendedores) &&
      parsed.lojasPeriodos.length > 0
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function exportarJSON(): string {
  const salvo = carregarDadosSalvos();
  const payload: DadosSalvos = salvo
    ? { ...salvo, salvoEm: new Date().toISOString() }
    : {
        lojasPeriodos: OFICIAIS_LOJAS,
        rankingVendedores: OFICIAIS_RANKING,
        salvoEm: new Date().toISOString(),
      };
  return JSON.stringify(payload, null, 2);
}

export function importarJSON(texto: string): { ok: boolean; mensagem: string } {
  try {
    const parsed = JSON.parse(texto) as DadosSalvos;
    if (!Array.isArray(parsed.lojasPeriodos) || !Array.isArray(parsed.rankingVendedores)) {
      return { ok: false, mensagem: "Arquivo JSON inválido: estrutura inesperada." };
    }
    // Validação básica de campos
    for (const r of parsed.lojasPeriodos) {
      if (!r.loja || !r.periodo || typeof r.vendas_total !== "number" || typeof r.meta !== "number") {
        return { ok: false, mensagem: "Registro de loja com campos faltando ou inválidos." };
      }
    }
    for (const r of parsed.rankingVendedores) {
      if (!r.loja || !r.periodo || !r.vendedor || typeof r.vendas !== "number") {
        return { ok: false, mensagem: "Registro de vendedor com campos faltando ou inválidos." };
      }
    }
    const lojasCalculadas = parsed.lojasPeriodos.map(recalcular);
    const rankingCalculado = recalcularRanking(parsed.rankingVendedores);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lojasPeriodos: lojasCalculadas,
        rankingVendedores: rankingCalculado,
        sincronizado: true,
        salvoEm: new Date().toISOString(),
      }),
    );
    window.dispatchEvent(
      new CustomEvent("bi-richesse:importar-json", {
        detail: { lojas: lojasCalculadas, ranking: rankingCalculado },
      }),
    );
    return { ok: true, mensagem: "Dados importados com sucesso." };
  } catch {
    return { ok: false, mensagem: "Não foi possível ler o arquivo JSON." };
  }
}

export function restaurarPadrao() {
  localStorage.removeItem(STORAGE_KEY);
  // Apaga o cache do React Query para forçar recarregar do banco
  try {
    (window as unknown as { trpcUtilsReset?: () => void }).trpcUtilsReset?.();
  } catch {
    // não crítico
  }
  window.dispatchEvent(new CustomEvent("bi-richesse:restaurar-padrao"));
  dispararRecarga();
}

interface DataContextValue {
  lojasPeriodos: LojaPeriodo[];
  rankingVendedores: RankingVendedor[];
  /** Todas as lojas conhecidas (oficiais) */
  lojasDisponiveis: readonly string[];
  periodosDisponiveis: () => string[];
  lojasDisponiveisPorPeriodo: (periodo: string) => LojaPeriodo[];
  lojasDoPeriodo: (periodo: string) => string[];
  /** Atualiza um registro de loja/periodo (edição ou criação) */
  salvarLojaPeriodo: (registro: LojaPeriodo) => void;
  removerLojaPeriodo: (loja: string, periodo: string) => void;
  /** Atualiza um vendedor (edição ou criação) */
  salvarVendedor: (registro: RankingVendedor) => void;
  removerVendedor: (loja: string, periodo: string, vendedor: string) => void;
  /** Recalcula posições do ranking de um período (usado após exclusões) */
  reordenarRanking: (loja: string, periodo: string) => void;
  addPeriodo: (periodo: string) => void;
  temEdicoes: boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const utils = trpc.useUtils();
  const lojasQuery = trpc.bi.listLojas.useQuery(undefined, {
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
  const rankingQuery = trpc.bi.listRankings.useQuery(undefined, {
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

  const salvarLojaMut = trpc.bi.salvarLoja.useMutation({
    onSuccess: () => utils.bi.listLojas.invalidate(),
  });
  const salvarRankingMut = trpc.bi.substituirRanking.useMutation({
    onSuccess: () => utils.bi.listRankings.invalidate(),
  });
  const inserirRankingsEmLoteMut = trpc.bi.inserirRankingsEmLote.useMutation({
    onSuccess: () => utils.bi.listRankings.invalidate(),
  });
  const removerVendedorMut = trpc.bi.removerVendedor.useMutation({
    onSuccess: () => utils.bi.listRankings.invalidate(),
  });
  const adicionarPeriodoMut = trpc.bi.adicionarPeriodo.useMutation({
    onSuccess: () => utils.bi.listLojas.invalidate(),
  });
  const removerPeriodoMut = trpc.bi.removerPeriodo.useMutation({
    onSuccess: () => {
      utils.bi.listLojas.invalidate();
      utils.bi.listRankings.invalidate();
    },
  });
  const importarLoteMut = trpc.bi.importarLote.useMutation({
    onSuccess: () => {
      utils.bi.listLojas.invalidate();
      utils.bi.listRankings.invalidate();
    },
  });
  const resetarBancoMut = trpc.bi.resetarBanco.useMutation({
    onSuccess: () => {
      utils.bi.listLojas.invalidate();
      utils.bi.listRankings.invalidate();
    },
  });

  const [versao, setVersao] = useState(0);
  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  // Reagir também a alterações feitas por funções diretas (ex.: restaurarPadrao, importarJSON).
  useEffect(() => {
    const onRecarga = () => recarregar();
    window.addEventListener("bi-richesse:recarregar", onRecarga);

    // Importar JSON: persiste o conteúdo do arquivo no banco em lote (uma chamada, auditoria única).
    const onImportarJson = (e: Event) => {
      const detail = (e as CustomEvent<{ lojas: LojaPeriodo[]; ranking: RankingVendedor[] }>).detail;
      if (!detail || !Array.isArray(detail.lojas)) return;
      importarLoteMut.mutate({
        lojas: detail.lojas.map((l) => ({
          periodo: l.periodo,
          loja: l.loja,
          vendasTotal: l.vendas_total,
          meta: l.meta,
        })),
        rankings: detail.ranking.map((r) => ({
          periodo: r.periodo,
          loja: r.loja,
          vendedores: recalcularRanking(detail.ranking.filter((x) => x.loja === r.loja && x.periodo === r.periodo)).map((v) => ({
            vendedor: v.vendedor,
            vendas: v.vendas,
          })),
        })),
      });
    };
    window.addEventListener("bi-richesse:importar-json", onImportarJson);

    // Restaurar padrão: reescreve o banco com os dados oficiais embutidos.
    const onRestaurarPadrao = () => {
      resetarBancoMut.mutate({});
    };
    window.addEventListener("bi-richesse:restaurar-padrao", onRestaurarPadrao);

    return () => {
      window.removeEventListener("bi-richesse:recarregar", onRecarga);
      window.removeEventListener("bi-richesse:importar-json", onImportarJson);
      window.removeEventListener("bi-richesse:restaurar-padrao", onRestaurarPadrao);
    };
  }, [recarregar, importarLoteMut, resetarBancoMut]);

  const dados = useMemo(() => {
    // Banco disponível e carregado → fonte da verdade.
    if (lojasQuery.data && rankingQuery.data) {
      return {
        lojasPeriodos: lojasQuery.data.map((r) =>
          recalcular({
            periodo: r.periodo,
            loja: r.loja,
            vendas_total: r.vendasTotal,
            meta: r.meta,
            atingimento_percentual: 0,
            diferenca_meta: 0,
          }),
        ),
        rankingVendedores: rankingQuery.data,
      };
    }
    // Fallback: cache local sincronizado anteriormente.
    const salvo = carregarDadosSalvos();
    if (salvo?.sincronizado && Array.isArray(salvo.lojasPeriodos) && salvo.lojasPeriodos.length > 0) {
      return {
        lojasPeriodos: salvo.lojasPeriodos,
        rankingVendedores: salvo.rankingVendedores,
      };
    }
    // Fallback final: dados oficiais embutidos (antes de qualquer banco/cache).
    return {
      lojasPeriodos: salvo?.lojasPeriodos ?? OFICIAIS_LOJAS,
      rankingVendedores: salvo?.rankingVendedores ?? OFICIAIS_RANKING,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versao, lojasQuery.data, rankingQuery.data]);

  const periodosDisponiveis = useCallback(
    () => Array.from(new Set(dados.lojasPeriodos.map((r) => r.periodo))),
    [dados.lojasPeriodos],
  );

  const lojasDoPeriodo = useCallback(
    (periodo: string) =>
      dados.lojasPeriodos
        .filter((r) => r.periodo === periodo)
        .map((r) => r.loja)
        .sort((a, b) => a.localeCompare(b)),
    [dados.lojasPeriodos],
  );

  const lojasDisponiveisPorPeriodo = useCallback(
    (periodo: string) => dados.lojasPeriodos.filter((r) => r.periodo === periodo),
    [dados.lojasPeriodos],
  );

  const salvarLojaPeriodo = useCallback(
    (registro: LojaPeriodo) => {
      const calculado = recalcular(registro);
      // Grava no banco (fonte da verdade)
      salvarLojaMut.mutate({
        periodo: calculado.periodo,
        loja: calculado.loja,
        vendasTotal: calculado.vendas_total,
        meta: calculado.meta,
      });
      // Atualiza o cache local imediatamente (feedback instantâneo + fallback offline)
      const salvo = carregarDadosSalvos() ?? { lojasPeriodos: [...OFICIAIS_LOJAS], rankingVendedores: [...OFICIAIS_RANKING], salvoEm: new Date().toISOString() };
      const idx = salvo.lojasPeriodos.findIndex((r) => r.loja === calculado.loja && r.periodo === calculado.periodo);
      if (idx >= 0) salvo.lojasPeriodos[idx] = calculado;
      else salvo.lojasPeriodos.push(calculado);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salvo));
      recarregar();
      dispararRecarga();
    },
    [recarregar, salvarLojaMut],
  );

  const removerLojaPeriodo = useCallback(
    (loja: string, periodo: string) => {
      removerPeriodoMut.mutate({ periodo });
      const salvo = carregarDadosSalvos() ?? { lojasPeriodos: [...OFICIAIS_LOJAS], rankingVendedores: [...OFICIAIS_RANKING], salvoEm: new Date().toISOString() };
      salvo.lojasPeriodos = salvo.lojasPeriodos.filter((r) => !(r.loja === loja && r.periodo === periodo));
      salvo.rankingVendedores = salvo.rankingVendedores.filter((r) => !(r.loja === loja && r.periodo === periodo));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salvo));
      recarregar();
      dispararRecarga();
    },
    [recarregar, removerPeriodoMut],
  );

  const salvarVendedor = useCallback(
    (registro: RankingVendedor) => {
      // O ranking é enviado inteiro (substituição) para o banco garantir posições corretas
      const salvo = carregarDadosSalvos() ?? { lojasPeriodos: [...OFICIAIS_LOJAS], rankingVendedores: [...OFICIAIS_RANKING], salvoEm: new Date().toISOString() };
      const idx = salvo.rankingVendedores.findIndex(
        (r) => r.loja === registro.loja && r.periodo === registro.periodo && r.vendedor === registro.vendedor,
      );
      if (idx >= 0) salvo.rankingVendedores[idx] = registro;
      else salvo.rankingVendedores.push(registro);
      const relacionados = (r: RankingVendedor) => r.loja === registro.loja && r.periodo === registro.periodo;
      const renumerado = recalcularRanking(salvo.rankingVendedores.filter(relacionados));
      salvo.rankingVendedores = [...salvo.rankingVendedores.filter((r) => !relacionados(r)), ...renumerado];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salvo));
      salvarRankingMut.mutate({
        periodo: registro.periodo,
        loja: registro.loja,
        vendedores: renumerado.map((r) => ({ vendedor: r.vendedor, vendas: r.vendas })),
      });
      recarregar();
      dispararRecarga();
    },
    [recarregar, salvarRankingMut],
  );

  const removerVendedor = useCallback(
    (loja: string, periodo: string, vendedor: string) => {
      const salvo = carregarDadosSalvos() ?? { lojasPeriodos: [...OFICIAIS_LOJAS], rankingVendedores: [...OFICIAIS_RANKING], salvoEm: new Date().toISOString() };
      const alvo = salvo.rankingVendedores.find(
        (r) => r.loja === loja && r.periodo === periodo && r.vendedor === vendedor,
      );
      salvo.rankingVendedores = salvo.rankingVendedores.filter(
        (r) => !(r.loja === loja && r.periodo === periodo && r.vendedor === vendedor),
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salvo));
      // Soft-delete no banco (UPDATE is_deleted=1, nunca DELETE físico)
      if (alvo && typeof (alvo as RankingVendedor & { id?: number }).id === "number") {
        removerVendedorMut.mutate({ id: (alvo as RankingVendedor & { id?: number }).id! });
      }
      recarregar();
      dispararRecarga();
    },
    [recarregar, removerVendedorMut],
  );

  const reordenarRanking = useCallback(
    (loja: string, periodo: string) => {
      const salvo = carregarDadosSalvos() ?? { lojasPeriodos: [...OFICIAIS_LOJAS], rankingVendedores: [...OFICIAIS_RANKING], salvoEm: new Date().toISOString() };
      const relacionados = (r: RankingVendedor) => r.loja === loja && r.periodo === periodo;
      const outros = salvo.rankingVendedores.filter((r) => !relacionados(r));
      const alvo = recalcularRanking(salvo.rankingVendedores.filter(relacionados));
      salvo.rankingVendedores = [...outros, ...alvo];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salvo));
      salvarRankingMut.mutate({
        periodo,
        loja,
        vendedores: alvo.map((r) => ({ vendedor: r.vendedor, vendas: r.vendas })),
      });
      recarregar();
      dispararRecarga();
    },
    [recarregar, salvarRankingMut],
  );

  const addPeriodo = useCallback(
    (periodo: string) => {
      const salvo = carregarDadosSalvos() ?? { lojasPeriodos: [...OFICIAIS_LOJAS], rankingVendedores: [...OFICIAIS_RANKING], salvoEm: new Date().toISOString() };
      const existentes = new Set(salvo.lojasPeriodos.filter((r) => r.periodo === periodo).map((r) => r.loja));
      const novos = LOJAS_PADRAO.filter((l) => !existentes.has(l)).map((loja) =>
        recalcular({ periodo, loja, vendas_total: 0, meta: 0, atingimento_percentual: 0, diferenca_meta: 0 }),
      );
      if (novos.length > 0) {
        // Grava cada loja do novo período no banco e atualiza o cache local
        novos.forEach((novo) =>
          salvarLojaMut.mutate({
            periodo: novo.periodo,
            loja: novo.loja,
            vendasTotal: novo.vendas_total,
            meta: novo.meta,
          }),
        );
        salvo.lojasPeriodos.push(...novos);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(salvo));
        recarregar();
      }
    },
    [recarregar, salvarLojaMut],
  );

  const temEdicoes = localStorage.getItem(STORAGE_KEY) !== null;

  const value: DataContextValue = {
    ...dados,
    lojasDisponiveis: [...LOJAS_PADRAO],
    periodosDisponiveis,
    lojasDisponiveisPorPeriodo,
    lojasDoPeriodo,
    salvarLojaPeriodo,
    removerLojaPeriodo,
    salvarVendedor,
    removerVendedor,
    reordenarRanking,
    addPeriodo,
    temEdicoes,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataStore(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useDataStore deve ser usado dentro de DataProvider");
  return ctx;
}

// Atalhos que as páginas usam no lugar das constantes estáticas
export function useLojasDisponiveis() {
  const { lojasDisponiveis } = useDataStore();
  return lojasDisponiveis;
}

export function usePeriodosDisponiveis() {
  const { periodosDisponiveis } = useDataStore();
  return periodosDisponiveis();
}
