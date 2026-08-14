export const ORDEM_LOJAS_APRESENTACAO = [
  "Richesse Eventos",
  "Richesse Flamboyant",
  "Richesse Gelateria",
  "Richesse Goiânia Shopping",
  "Richesse Marista",
  "Richesse Oeste",
  "Richesse Park",
  "Richesse Prime",
  "Richesse TOGO",
] as const;

const ORDEM_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function ordenarLojasParaApresentacao(lojas: string[]) {
  const indice = new Map(ORDEM_LOJAS_APRESENTACAO.map((loja, posicao) => [loja.toLowerCase(), posicao]));
  return [...lojas].sort((a, b) => {
    const ordemA = indice.get(a.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const ordemB = indice.get(b.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    return ordemA === ordemB ? a.localeCompare(b, "pt-BR") : ordemA - ordemB;
  });
}

export function ordenarPeriodosParaApresentacao(periodos: string[]) {
  return [...periodos].sort((a, b) => {
    const ordemA = ORDEM_MESES.findIndex((mes) => mes.toLowerCase() === a.toLowerCase());
    const ordemB = ORDEM_MESES.findIndex((mes) => mes.toLowerCase() === b.toLowerCase());
    return (ordemA < 0 ? Number.MAX_SAFE_INTEGER : ordemA) - (ordemB < 0 ? Number.MAX_SAFE_INTEGER : ordemB);
  });
}
