/**
 * Estilo: Executive Ledger — hook que une o DataStore às filtragens usadas
 * pelas páginas do dashboard. As regras de filtro são idênticas às funções
 * estáticas de data.ts, mas operam sobre os dados vivos (editáveis).
 */
import { useDataStore } from "./dataStore";
import {
  Filtros,
  LojaPeriodo,
  RankingVendedor,
  totalVendas,
  totalMeta,
  atingimentoPercentual,
  diferencaMeta,
  melhorVendedor,
  vendasVendedoresInformados,
} from "./data";

export function useFiltrar(f: Filtros) {
  const { lojasPeriodos, rankingVendedores } = useDataStore();

  const registros: LojaPeriodo[] = lojasPeriodos.filter(
    (r) => (!f.loja || r.loja === f.loja) && (!f.periodo || r.periodo === f.periodo),
  );

  const ranking: RankingVendedor[] = rankingVendedores
    .filter((r) => (!f.loja || r.loja === f.loja) && (!f.periodo || r.periodo === f.periodo))
    .sort((a, b) => a.posicao - b.posicao);

  return {
    registros,
    ranking,
    vendas: totalVendas(registros),
    meta: totalMeta(registros),
    ating: atingimentoPercentual(registros),
    dif: diferencaMeta(registros),
    melhor: melhorVendedor(ranking),
    vendasVendedores: vendasVendedoresInformados(ranking),
  };
}
