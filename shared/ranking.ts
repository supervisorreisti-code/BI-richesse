/**
 * Participação de um vendedor no faturamento mensal oficial da respectiva loja.
 * O retorno usa escala decimal: 0,188 representa 18,8% das vendas da loja.
 */
export function participacaoNasVendasDaLoja(vendasVendedor: number, vendasTotaisLoja: number): number {
  if (!Number.isFinite(vendasVendedor) || !Number.isFinite(vendasTotaisLoja) || vendasTotaisLoja <= 0) {
    return 0;
  }

  return vendasVendedor / vendasTotaisLoja;
}
