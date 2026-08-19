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

/**
 * Atualiza uma linha do ranking sem duplicá-la quando o nome do vendedor muda.
 * O nome anterior identifica o registro já existente; sem ele, a operação é uma
 * atualização comum ou a inclusão de um novo vendedor.
 */
export function atualizarRegistroDoRanking<
  T extends { loja: string; periodo: string; vendedor: string },
>(registros: T[], registro: T, nomeAnterior = registro.vendedor): T[] {
  const indice = registros.findIndex(
    (atual) =>
      atual.loja === registro.loja &&
      atual.periodo === registro.periodo &&
      atual.vendedor === nomeAnterior,
  );

  if (indice < 0) return [...registros, registro];

  return registros.map((atual, indiceAtual) =>
    indiceAtual === indice ? { ...atual, ...registro } : atual,
  );
}
