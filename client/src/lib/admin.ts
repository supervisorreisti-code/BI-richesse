/**
 * Estilo: Executive Ledger — utilitários do painel de administração.
 */

/** Converte texto de moeda brasileira (R$ 1.359.149,00 ou 1359149) em número. */
export function parseMoeda(valor: string): number | null {
  if (!valor) return null;
  let texto = valor.trim();
  if (texto.toLowerCase().startsWith("r$")) texto = texto.slice(2).trim();
  const negativo = texto.startsWith("-");
  if (negativo) texto = texto.slice(1).trim();
  texto = texto.replace(/\s/g, "").replace(/\./g, "");
  if (texto.includes(",")) {
    const [inteiro, decimal] = texto.split(",");
    if (decimal && decimal.length > 2) return null;
    texto = inteiro + "." + (decimal ?? "0");
  }
  if (!/^\d+(\.\d+)?$/.test(texto)) return null;
  const n = parseFloat(texto);
  return negativo ? -n : n;
}

/** Converte número em texto limpo para input (sem pontuação) */
export function moedaParaTexto(v: number): string {
  return String(Math.round(v));
}

/** Formata número como moeda brasileira "R$ 9.807.790,00" para exibição nos inputs */
export function moedaFormatada(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round(v));
}

/** Converte texto com máscara "R$ 9.807.790,00" em número (aplica máscara ao retornar o texto reformatado) */
export function aplicarMascaraMoeda(valor: string): string {
  const n = parseMoeda(valor);
  if (n === null) return valor;
  return moedaFormatada(n);
}
