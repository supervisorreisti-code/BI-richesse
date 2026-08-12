/**
 * Estilo: Executive Ledger — dados estruturados fielmente ao modelo Power BI
 * especificado (lojas_periodos + ranking_vendedores, chave composta loja|periodo).
 * Preparado para Junho e Julho: basta adicionar linhas com periodo = "Junho"/"Julho".
 * Valores oficiais conferidos — NÃO arredondar nem recalcular totais.
 */

// ---------------------------------------------------------------------------
// Tabela: lojas_periodos
// Colunas: periodo, loja, vendas_total, meta, atingimento_percentual, diferenca_meta
// Fonte oficial de vendas e metas.
// ---------------------------------------------------------------------------
export interface LojaPeriodo {
  periodo: string;
  loja: string;
  vendas_total: number;
  meta: number;
  /** Fração armazenada (ex.: 0.8528 para 85,28%) */
  atingimento_percentual: number;
  diferenca_meta: number;
}

// ---------------------------------------------------------------------------
// Tabela: ranking_vendedores
// Colunas: periodo, loja, posicao, vendedor, vendas
// Representa apenas o ranking informado no documento — NÃO somar para o total.
// ---------------------------------------------------------------------------
export interface RankingVendedor {
  periodo: string;
  loja: string;
  posicao: number;
  vendedor: string;
  vendas: number;
}

export const LOJAS_PADRAO = [
  "Richesse Flamboyant",
  "Richesse Oeste",
  "Richesse Prime",
  "Richesse Gelateria",
  "Richesse TOGO",
  "Richesse Marista",
  "Richesse Goiânia Shopping",
  "Richesse Park",
  "Richesse Eventos",
] as const;

export const lojasPeriodos: LojaPeriodo[] = [
  { periodo: "Maio", loja: "Richesse Flamboyant", vendas_total: 694000, meta: 813808, atingimento_percentual: 694000 / 813808, diferenca_meta: 694000 - 813808 },
  { periodo: "Maio", loja: "Richesse Oeste", vendas_total: 937000, meta: 1359149, atingimento_percentual: 937000 / 1359149, diferenca_meta: 937000 - 1359149 },
  { periodo: "Maio", loja: "Richesse Prime", vendas_total: 217000, meta: 293964, atingimento_percentual: 217000 / 293964, diferenca_meta: 217000 - 293964 },
  { periodo: "Maio", loja: "Richesse Gelateria", vendas_total: 166000, meta: 191000, atingimento_percentual: 166000 / 191000, diferenca_meta: 166000 - 191000 },
  { periodo: "Maio", loja: "Richesse TOGO", vendas_total: 428000, meta: 630455, atingimento_percentual: 428000 / 630455, diferenca_meta: 428000 - 630455 },
  { periodo: "Maio", loja: "Richesse Marista", vendas_total: 513000, meta: 670925, atingimento_percentual: 513000 / 670925, diferenca_meta: 513000 - 670925 },
  { periodo: "Maio", loja: "Richesse Goiânia Shopping", vendas_total: 515000, meta: 650176, atingimento_percentual: 515000 / 650176, diferenca_meta: 515000 - 650176 },
  { periodo: "Maio", loja: "Richesse Park", vendas_total: 350000, meta: 592461, atingimento_percentual: 350000 / 592461, diferenca_meta: 350000 - 592461 },

  // Junho — relatório oficial recebido (Richesse SETOR OESTE mapeado para "Richesse Oeste")
  { periodo: "Junho", loja: "Richesse Flamboyant", vendas_total: 707000, meta: 810690, atingimento_percentual: 707000 / 810690, diferenca_meta: 707000 - 810690 },
  { periodo: "Junho", loja: "Richesse Oeste", vendas_total: 931000, meta: 1258616, atingimento_percentual: 931000 / 1258616, diferenca_meta: 931000 - 1258616 },
  { periodo: "Junho", loja: "Richesse Prime", vendas_total: 191000, meta: 242154, atingimento_percentual: 191000 / 242154, diferenca_meta: 191000 - 242154 },
  { periodo: "Junho", loja: "Richesse Gelateria", vendas_total: 136000, meta: 182577, atingimento_percentual: 136000 / 182577, diferenca_meta: 136000 - 182577 },
  { periodo: "Junho", loja: "Richesse TOGO", vendas_total: 430000, meta: 565707, atingimento_percentual: 430000 / 565707, diferenca_meta: 430000 - 565707 },
  { periodo: "Junho", loja: "Richesse Marista", vendas_total: 479000, meta: 619622, atingimento_percentual: 479000 / 619622, diferenca_meta: 479000 - 619622 },
  { periodo: "Junho", loja: "Richesse Goiânia Shopping", vendas_total: 502000, meta: 676460, atingimento_percentual: 502000 / 676460, diferenca_meta: 502000 - 676460 },
  { periodo: "Junho", loja: "Richesse Park", vendas_total: 336000, meta: 546350, atingimento_percentual: 336000 / 546350, diferenca_meta: 336000 - 546350 },

  // Julho — relatório oficial recebido (9 unidades: nova Richesse Eventos; SETOR OESTE mapeado para "Richesse Oeste")
  { periodo: "Julho", loja: "Richesse Flamboyant", vendas_total: 787000, meta: 980779, atingimento_percentual: 787000 / 980779, diferenca_meta: 787000 - 980779 },
  { periodo: "Julho", loja: "Richesse Marista", vendas_total: 473000, meta: 695647, atingimento_percentual: 473000 / 695647, diferenca_meta: 473000 - 695647 },
  { periodo: "Julho", loja: "Richesse TOGO", vendas_total: 375000, meta: 624479, atingimento_percentual: 375000 / 624479, diferenca_meta: 375000 - 624479 },
  { periodo: "Julho", loja: "Richesse Gelateria", vendas_total: 177000, meta: 226954, atingimento_percentual: 177000 / 226954, diferenca_meta: 177000 - 226954 },
  { periodo: "Julho", loja: "Richesse Prime", vendas_total: 170000, meta: 315386, atingimento_percentual: 170000 / 315386, diferenca_meta: 170000 - 315386 },
  { periodo: "Julho", loja: "Richesse Park", vendas_total: 390000, meta: 581174, atingimento_percentual: 390000 / 581174, diferenca_meta: 390000 - 581174 },
  { periodo: "Julho", loja: "Richesse Goiânia Shopping", vendas_total: 527000, meta: 790397, atingimento_percentual: 527000 / 790397, diferenca_meta: 527000 - 790397 },
  { periodo: "Julho", loja: "Richesse Oeste", vendas_total: 876000, meta: 1516955, atingimento_percentual: 876000 / 1516955, diferenca_meta: 876000 - 1516955 },
  { periodo: "Julho", loja: "Richesse Eventos", vendas_total: 286000, meta: 350000, atingimento_percentual: 286000 / 350000, diferenca_meta: 286000 - 350000 },
];

export const rankingVendedores: RankingVendedor[] = [
  { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 1, vendedor: "Luciana Araujo Alves", vendas: 103000 },
  { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 2, vendedor: "Cintia Alzira", vendas: 87000 },
  { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 3, vendedor: "Keleme Lima", vendas: 71000 },
  { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 4, vendedor: "Helen Viana", vendas: 64000 },
  { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 5, vendedor: "Gabriel Felipe", vendas: 53000 },
  { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 6, vendedor: "Yara Rayanne", vendas: 45000 },
  { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 7, vendedor: "Steffany Cristina", vendas: 41000 },
  { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 8, vendedor: "Janis Lopes Lima", vendas: 38000 },

  { periodo: "Maio", loja: "Richesse Oeste", posicao: 1, vendedor: "Natia Cristina Saldanha", vendas: 108000 },
  { periodo: "Maio", loja: "Richesse Oeste", posicao: 2, vendedor: "Naiane Souza", vendas: 98000 },
  { periodo: "Maio", loja: "Richesse Oeste", posicao: 3, vendedor: "Karolyne de Sousa", vendas: 93000 },
  { periodo: "Maio", loja: "Richesse Oeste", posicao: 4, vendedor: "Maria Raimunda", vendas: 81000 },
  { periodo: "Maio", loja: "Richesse Oeste", posicao: 5, vendedor: "Denize dos Santos Silva", vendas: 78000 },
  { periodo: "Maio", loja: "Richesse Oeste", posicao: 6, vendedor: "Francisca Rodrigues", vendas: 68000 },
  { periodo: "Maio", loja: "Richesse Oeste", posicao: 7, vendedor: "Luciana de Kasssia", vendas: 67000 },
  { periodo: "Maio", loja: "Richesse Oeste", posicao: 8, vendedor: "Ireny Alves", vendas: 65000 },

  { periodo: "Maio", loja: "Richesse Prime", posicao: 1, vendedor: "Rayssa Lorrany", vendas: 58000 },
  { periodo: "Maio", loja: "Richesse Prime", posicao: 2, vendedor: "Eliana Miguel de Morais", vendas: 46000 },
  { periodo: "Maio", loja: "Richesse Prime", posicao: 3, vendedor: "Celismar Cunha Cavalcante", vendas: 44000 },
  { periodo: "Maio", loja: "Richesse Prime", posicao: 4, vendedor: "Michele Gomes Pereira", vendas: 33000 },
  { periodo: "Maio", loja: "Richesse Prime", posicao: 5, vendedor: "Daniela de Sousa", vendas: 15000 },
  { periodo: "Maio", loja: "Richesse Prime", posicao: 6, vendedor: "Jusimeire de Rocha", vendas: 5000 },

  { periodo: "Maio", loja: "Richesse Gelateria", posicao: 1, vendedor: "Luscineide", vendas: 88000 },
  { periodo: "Maio", loja: "Richesse Gelateria", posicao: 2, vendedor: "Jaqueline", vendas: 78000 },

  { periodo: "Maio", loja: "Richesse TOGO", posicao: 1, vendedor: "Maria Sthfanny dos Reis", vendas: 79000 },
  { periodo: "Maio", loja: "Richesse TOGO", posicao: 2, vendedor: "Bianca Vaz", vendas: 68000 },
  { periodo: "Maio", loja: "Richesse TOGO", posicao: 3, vendedor: "Caroline Sousa", vendas: 67000 },
  { periodo: "Maio", loja: "Richesse TOGO", posicao: 4, vendedor: "Diana Mendes", vendas: 60000 },
  { periodo: "Maio", loja: "Richesse TOGO", posicao: 5, vendedor: "Davi Mendes", vendas: 51000 },
  { periodo: "Maio", loja: "Richesse TOGO", posicao: 6, vendedor: "Estefane Lustosa", vendas: 27000 },
  { periodo: "Maio", loja: "Richesse TOGO", posicao: 7, vendedor: "Adelio Junio", vendas: 24000 },
  { periodo: "Maio", loja: "Richesse TOGO", posicao: 8, vendedor: "Kamille Jenifer", vendas: 17000 },

  { periodo: "Maio", loja: "Richesse Marista", posicao: 1, vendedor: "Mylena dos Santos", vendas: 125000 },
  { periodo: "Maio", loja: "Richesse Marista", posicao: 2, vendedor: "Joelma Cristina", vendas: 104000 },
  { periodo: "Maio", loja: "Richesse Marista", posicao: 3, vendedor: "Bruna Fernanda", vendas: 65000 },
  { periodo: "Maio", loja: "Richesse Marista", posicao: 4, vendedor: "Itamara Araujo", vendas: 65000 },
  { periodo: "Maio", loja: "Richesse Marista", posicao: 5, vendedor: "Daniel Silva", vendas: 57000 },
  { periodo: "Maio", loja: "Richesse Marista", posicao: 6, vendedor: "Nathalia Silva", vendas: 50000 },
  { periodo: "Maio", loja: "Richesse Marista", posicao: 7, vendedor: "Bianca dos Santos Luz", vendas: 18000 },

  { periodo: "Maio", loja: "Richesse Goiânia Shopping", posicao: 1, vendedor: "Alexander Machado de Almeida", vendas: 90000 },
  { periodo: "Maio", loja: "Richesse Goiânia Shopping", posicao: 2, vendedor: "Leticia Cordoval", vendas: 65000 },
  { periodo: "Maio", loja: "Richesse Goiânia Shopping", posicao: 3, vendedor: "Ana Paula Amaral", vendas: 65000 },
  { periodo: "Maio", loja: "Richesse Goiânia Shopping", posicao: 4, vendedor: "Cassiane Eva Pinto", vendas: 64000 },
  { periodo: "Maio", loja: "Richesse Goiânia Shopping", posicao: 5, vendedor: "Wellingyhon dos Santos", vendas: 62000 },
  { periodo: "Maio", loja: "Richesse Goiânia Shopping", posicao: 6, vendedor: "Karen Lainy Ferreira", vendas: 61000 },
  { periodo: "Maio", loja: "Richesse Goiânia Shopping", posicao: 7, vendedor: "Ana Tereza Freitas", vendas: 52000 },
  { periodo: "Maio", loja: "Richesse Goiânia Shopping", posicao: 8, vendedor: "Nathalia Medeiros", vendas: 16000 },

  { periodo: "Maio", loja: "Richesse Park", posicao: 1, vendedor: "Isabela de Jesus", vendas: 82000 },
  { periodo: "Maio", loja: "Richesse Park", posicao: 2, vendedor: "Jessica Yasmin Rodrigues", vendas: 80000 },
  { periodo: "Maio", loja: "Richesse Park", posicao: 3, vendedor: "Marcela Lorrany", vendas: 52000 },
  { periodo: "Maio", loja: "Richesse Park", posicao: 4, vendedor: "Nyckolas Alessandro", vendas: 46000 },
  { periodo: "Maio", loja: "Richesse Park", posicao: 5, vendedor: "Felipe de Sousa", vendas: 20000 },
  { periodo: "Maio", loja: "Richesse Park", posicao: 6, vendedor: "Paulo Ricardo", vendas: 15000 },
  { periodo: "Maio", loja: "Richesse Park", posicao: 7, vendedor: "Jaqueline Alves", vendas: 12000 },
  { periodo: "Maio", loja: "Richesse Park", posicao: 8, vendedor: "Ana Clara Carvalho", vendas: 12000 },

  // Junho — relatório oficial recebido; nomes conforme exibidos no relatório
  { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 1, vendedor: "Luciana", vendas: 101000 },
  { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 2, vendedor: "Cintia", vendas: 93000 },
  { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 3, vendedor: "Steffany", vendas: 68000 },
  { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 4, vendedor: "Gabriel", vendas: 57000 },
  { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 5, vendedor: "Helen", vendas: 55000 },
  { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 6, vendedor: "Lays", vendas: 48000 },
  { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 7, vendedor: "Micaelly", vendas: 47000 },
  { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 8, vendedor: "Elen", vendas: 40000 },

  { periodo: "Junho", loja: "Richesse Marista", posicao: 1, vendedor: "Milena", vendas: 110000 },
  { periodo: "Junho", loja: "Richesse Marista", posicao: 2, vendedor: "Daniela", vendas: 88000 },
  { periodo: "Junho", loja: "Richesse Marista", posicao: 3, vendedor: "Itamara", vendas: 68000 },
  { periodo: "Junho", loja: "Richesse Marista", posicao: 4, vendedor: "Bruna", vendas: 68000 },
  { periodo: "Junho", loja: "Richesse Marista", posicao: 5, vendedor: "Nathalia", vendas: 58000 },
  { periodo: "Junho", loja: "Richesse Marista", posicao: 6, vendedor: "Julia", vendas: 50000 },
  { periodo: "Junho", loja: "Richesse Marista", posicao: 7, vendedor: "Bianca", vendas: 18000 },
  { periodo: "Junho", loja: "Richesse Marista", posicao: 8, vendedor: "Joelma", vendas: 11000 },

  { periodo: "Junho", loja: "Richesse TOGO", posicao: 1, vendedor: "Caroline", vendas: 79000 },
  { periodo: "Junho", loja: "Richesse TOGO", posicao: 2, vendedor: "Diana", vendas: 70000 },
  { periodo: "Junho", loja: "Richesse TOGO", posicao: 3, vendedor: "Bianca", vendas: 65000 },
  { periodo: "Junho", loja: "Richesse TOGO", posicao: 4, vendedor: "Maria", vendas: 63000 },
  { periodo: "Junho", loja: "Richesse TOGO", posicao: 5, vendedor: "Kamille", vendas: 46000 },
  { periodo: "Junho", loja: "Richesse TOGO", posicao: 6, vendedor: "Davi", vendas: 36000 },
  { periodo: "Junho", loja: "Richesse TOGO", posicao: 7, vendedor: "Adelio", vendas: 35000 },
  { periodo: "Junho", loja: "Richesse TOGO", posicao: 8, vendedor: "Estefane", vendas: 19000 },

  { periodo: "Junho", loja: "Richesse Gelateria", posicao: 1, vendedor: "Lusineide", vendas: 69000 },
  { periodo: "Junho", loja: "Richesse Gelateria", posicao: 2, vendedor: "Jaqueline", vendas: 64000 },
  { periodo: "Junho", loja: "Richesse Gelateria", posicao: 3, vendedor: "Nikelly", vendas: 3000 },

  { periodo: "Junho", loja: "Richesse Prime", posicao: 1, vendedor: "Rayssa", vendas: 48000 },
  { periodo: "Junho", loja: "Richesse Prime", posicao: 2, vendedor: "Eliana", vendas: 44000 },
  { periodo: "Junho", loja: "Richesse Prime", posicao: 3, vendedor: "Celisnar", vendas: 40000 },
  { periodo: "Junho", loja: "Richesse Prime", posicao: 4, vendedor: "Michele", vendas: 34000 },
  { periodo: "Junho", loja: "Richesse Prime", posicao: 5, vendedor: "Daniela", vendas: 11000 },
  { periodo: "Junho", loja: "Richesse Prime", posicao: 6, vendedor: "Adriana", vendas: 8000 },
  { periodo: "Junho", loja: "Richesse Prime", posicao: 7, vendedor: "Jusimeire", vendas: 4000 },
  { periodo: "Junho", loja: "Richesse Prime", posicao: 8, vendedor: "Flavia", vendas: 241 },

  { periodo: "Junho", loja: "Richesse Park", posicao: 1, vendedor: "Isabela", vendas: 76000 },
  { periodo: "Junho", loja: "Richesse Park", posicao: 2, vendedor: "Marcela", vendas: 61000 },
  { periodo: "Junho", loja: "Richesse Park", posicao: 3, vendedor: "Jessica", vendas: 38000 },
  { periodo: "Junho", loja: "Richesse Park", posicao: 4, vendedor: "Nyckolas", vendas: 34000 },
  { periodo: "Junho", loja: "Richesse Park", posicao: 5, vendedor: "Jennifer", vendas: 30000 },
  { periodo: "Junho", loja: "Richesse Park", posicao: 6, vendedor: "Sabrina", vendas: 28000 },
  { periodo: "Junho", loja: "Richesse Park", posicao: 7, vendedor: "Jaqueline", vendas: 16000 },
  { periodo: "Junho", loja: "Richesse Park", posicao: 8, vendedor: "Waldir", vendas: 15000 },

  { periodo: "Junho", loja: "Richesse Goiânia Shopping", posicao: 1, vendedor: "Letícia", vendas: 63000 },
  { periodo: "Junho", loja: "Richesse Goiânia Shopping", posicao: 2, vendedor: "Ana", vendas: 61000 },
  { periodo: "Junho", loja: "Richesse Goiânia Shopping", posicao: 3, vendedor: "Karen", vendas: 59000 },
  { periodo: "Junho", loja: "Richesse Goiânia Shopping", posicao: 4, vendedor: "Cassiane", vendas: 59000 },
  { periodo: "Junho", loja: "Richesse Goiânia Shopping", posicao: 5, vendedor: "Wellington", vendas: 56000 },
  { periodo: "Junho", loja: "Richesse Goiânia Shopping", posicao: 6, vendedor: "Thyayla", vendas: 49000 },
  { periodo: "Junho", loja: "Richesse Goiânia Shopping", posicao: 7, vendedor: "Alexander", vendas: 48000 },
  { periodo: "Junho", loja: "Richesse Goiânia Shopping", posicao: 8, vendedor: "Ana", vendas: 47000 },

  { periodo: "Junho", loja: "Richesse Oeste", posicao: 1, vendedor: "Karolyne", vendas: 126000 },
  { periodo: "Junho", loja: "Richesse Oeste", posicao: 2, vendedor: "Naiane", vendas: 114000 },
  { periodo: "Junho", loja: "Richesse Oeste", posicao: 3, vendedor: "Natia", vendas: 95000 },
  { periodo: "Junho", loja: "Richesse Oeste", posicao: 4, vendedor: "Dayane", vendas: 78000 },
  { periodo: "Junho", loja: "Richesse Oeste", posicao: 5, vendedor: "Naykele", vendas: 73000 },
  { periodo: "Junho", loja: "Richesse Oeste", posicao: 6, vendedor: "Denize", vendas: 73000 },
  { periodo: "Junho", loja: "Richesse Oeste", posicao: 7, vendedor: "Naydes", vendas: 59000 },
  { periodo: "Junho", loja: "Richesse Oeste", posicao: 8, vendedor: "Davi", vendas: 56000 },

  // Julho — relatório oficial recebido; nomes conforme exibidos no relatório (mantidos os dois "Gabriel" da Flamboyant)
  { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 1, vendedor: "Luciana", vendas: 114000 },
  { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 2, vendedor: "Cintia", vendas: 92000 },
  { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 3, vendedor: "Steffany", vendas: 80000 },
  { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 4, vendedor: "Helen", vendas: 69000 },
  { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 5, vendedor: "Gabriel", vendas: 65000 },
  { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 6, vendedor: "Elen", vendas: 59000 },
  { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 7, vendedor: "Gabriel", vendas: 58000 },
  { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 8, vendedor: "Micaelly", vendas: 55000 },

  { periodo: "Julho", loja: "Richesse Marista", posicao: 1, vendedor: "Mylena", vendas: 77000 },
  { periodo: "Julho", loja: "Richesse Marista", posicao: 2, vendedor: "Daniel", vendas: 65000 },
  { periodo: "Julho", loja: "Richesse Marista", posicao: 3, vendedor: "Nathalia", vendas: 62000 },
  { periodo: "Julho", loja: "Richesse Marista", posicao: 4, vendedor: "Bruna", vendas: 58000 },
  { periodo: "Julho", loja: "Richesse Marista", posicao: 5, vendedor: "Joelma", vendas: 49000 },
  { periodo: "Julho", loja: "Richesse Marista", posicao: 6, vendedor: "Itamara", vendas: 48000 },
  { periodo: "Julho", loja: "Richesse Marista", posicao: 7, vendedor: "Jaina", vendas: 41000 },
  { periodo: "Julho", loja: "Richesse Marista", posicao: 8, vendedor: "Maria", vendas: 29000 },

  { periodo: "Julho", loja: "Richesse TOGO", posicao: 1, vendedor: "Kamille", vendas: 53000 },
  { periodo: "Julho", loja: "Richesse TOGO", posicao: 2, vendedor: "Elainny", vendas: 51000 },
  { periodo: "Julho", loja: "Richesse TOGO", posicao: 3, vendedor: "Caroline", vendas: 50000 },
  { periodo: "Julho", loja: "Richesse TOGO", posicao: 4, vendedor: "Diana", vendas: 41000 },
  { periodo: "Julho", loja: "Richesse TOGO", posicao: 5, vendedor: "Adriana", vendas: 37000 },
  { periodo: "Julho", loja: "Richesse TOGO", posicao: 6, vendedor: "Adelio", vendas: 35000 },
  { periodo: "Julho", loja: "Richesse TOGO", posicao: 7, vendedor: "Michelle", vendas: 21000 },
  { periodo: "Julho", loja: "Richesse TOGO", posicao: 8, vendedor: "Syang", vendas: 18000 },

  { periodo: "Julho", loja: "Richesse Gelateria", posicao: 1, vendedor: "Lusineide", vendas: 90000 },
  { periodo: "Julho", loja: "Richesse Gelateria", posicao: 2, vendedor: "Jaqueline", vendas: 87000 },

  { periodo: "Julho", loja: "Richesse Prime", posicao: 1, vendedor: "Eliana", vendas: 42000 },
  { periodo: "Julho", loja: "Richesse Prime", posicao: 2, vendedor: "Rayssa", vendas: 41000 },
  { periodo: "Julho", loja: "Richesse Prime", posicao: 3, vendedor: "Celisnar", vendas: 39000 },
  { periodo: "Julho", loja: "Richesse Prime", posicao: 4, vendedor: "Michele", vendas: 33000 },
  { periodo: "Julho", loja: "Richesse Prime", posicao: 5, vendedor: "Jusimeire", vendas: 4000 },
  { periodo: "Julho", loja: "Richesse Prime", posicao: 6, vendedor: "Juliana", vendas: 4000 },
  { periodo: "Julho", loja: "Richesse Prime", posicao: 7, vendedor: "Daniela", vendas: 3000 },
  { periodo: "Julho", loja: "Richesse Prime", posicao: 8, vendedor: "Adriana", vendas: 3000 },

  { periodo: "Julho", loja: "Richesse Park", posicao: 1, vendedor: "Isabela", vendas: 78000 },
  { periodo: "Julho", loja: "Richesse Park", posicao: 2, vendedor: "Marcela", vendas: 67000 },
  { periodo: "Julho", loja: "Richesse Park", posicao: 3, vendedor: "Jennifer", vendas: 55000 },
  { periodo: "Julho", loja: "Richesse Park", posicao: 4, vendedor: "Sabrina", vendas: 51000 },
  { periodo: "Julho", loja: "Richesse Park", posicao: 5, vendedor: "Nyckolas", vendas: 46000 },
  { periodo: "Julho", loja: "Richesse Park", posicao: 6, vendedor: "Stefane", vendas: 33000 },
  { periodo: "Julho", loja: "Richesse Park", posicao: 7, vendedor: "Ana", vendas: 18000 },
  { periodo: "Julho", loja: "Richesse Park", posicao: 8, vendedor: "Waldir", vendas: 12000 },

  { periodo: "Julho", loja: "Richesse Goiânia Shopping", posicao: 1, vendedor: "Alexander", vendas: 99000 },
  { periodo: "Julho", loja: "Richesse Goiânia Shopping", posicao: 2, vendedor: "Wellington", vendas: 66000 },
  { periodo: "Julho", loja: "Richesse Goiânia Shopping", posicao: 3, vendedor: "Letícia", vendas: 64000 },
  { periodo: "Julho", loja: "Richesse Goiânia Shopping", posicao: 4, vendedor: "Ana", vendas: 58000 },
  { periodo: "Julho", loja: "Richesse Goiânia Shopping", posicao: 5, vendedor: "Karen", vendas: 56000 },
  { periodo: "Julho", loja: "Richesse Goiânia Shopping", posicao: 6, vendedor: "Kemelli", vendas: 52000 },
  { periodo: "Julho", loja: "Richesse Goiânia Shopping", posicao: 7, vendedor: "Cassiane", vendas: 46000 },
  { periodo: "Julho", loja: "Richesse Goiânia Shopping", posicao: 8, vendedor: "Thyayla", vendas: 35000 },

  { periodo: "Julho", loja: "Richesse Oeste", posicao: 1, vendedor: "Karolyne", vendas: 128000 },
  { periodo: "Julho", loja: "Richesse Oeste", posicao: 2, vendedor: "Denize", vendas: 84000 },
  { periodo: "Julho", loja: "Richesse Oeste", posicao: 3, vendedor: "Natia", vendas: 78000 },
  { periodo: "Julho", loja: "Richesse Oeste", posicao: 4, vendedor: "Dayane", vendas: 70000 },
  { periodo: "Julho", loja: "Richesse Oeste", posicao: 5, vendedor: "Naykele", vendas: 60000 },
  { periodo: "Julho", loja: "Richesse Oeste", posicao: 6, vendedor: "Naydes", vendas: 49000 },
  { periodo: "Julho", loja: "Richesse Oeste", posicao: 7, vendedor: "Sabrina", vendas: 48000 },
  { periodo: "Julho", loja: "Richesse Oeste", posicao: 8, vendedor: "Naiane", vendas: 47000 },

  { periodo: "Julho", loja: "Richesse Eventos", posicao: 1, vendedor: "Ludmila", vendas: 286000 },
];

// ---------------------------------------------------------------------------
// Chave composta: loja + "|" + periodo (equivale à coluna DAX)
// ---------------------------------------------------------------------------
export const chaveComposta = (loja: string, periodo: string) => `${loja}|${periodo}`;

// ---------------------------------------------------------------------------
// Medidas DAX equivalentes
// ---------------------------------------------------------------------------

/** Total Vendas = SUM(lojas_periodos[vendas_total]) */
export function totalVendas(registros: LojaPeriodo[]): number {
  return registros.reduce((s, r) => s + r.vendas_total, 0);
}

/** Total Meta = SUM(lojas_periodos[meta]) */
export function totalMeta(registros: LojaPeriodo[]): number {
  return registros.reduce((s, r) => s + r.meta, 0);
}

/** Atingimento % = DIVIDE([Total Vendas], [Total Meta], 0) */
export function atingimentoPercentual(registros: LojaPeriodo[]): number {
  const vendas = totalVendas(registros);
  const meta = totalMeta(registros);
  return meta === 0 ? 0 : vendas / meta;
}

/** Diferença Meta = [Total Vendas] - [Total Meta] */
export function diferencaMeta(registros: LojaPeriodo[]): number {
  return totalVendas(registros) - totalMeta(registros);
}

/** Status Meta — faixas por percentual: 0–69% Crítico, 70–89% Abaixo, 90–99% Próximo, 100–109% Meta atingida, ≥110% Acima */
export type StatusMeta = "Crítico" | "Abaixo da meta" | "Próximo da meta" | "Meta atingida" | "Acima da meta";

export function statusMeta(atingimento: number): StatusMeta {
  const pct = atingimento * 100;
  if (pct >= 110) return "Acima da meta";
  if (pct >= 100) return "Meta atingida";
  if (pct >= 90) return "Próximo da meta";
  if (pct >= 70) return "Abaixo da meta";
  return "Crítico";
}

/** Vendas Vendedores Informados = SUM(ranking_vendedores[vendas]) */
export function vendasVendedoresInformados(ranking: RankingVendedor[]): number {
  return ranking.reduce((s, r) => s + r.vendas, 0);
}

/** Melhor Vendedor = TOPN(1, ... DESC) */
export function melhorVendedor(ranking: RankingVendedor[]): { vendedor: string; vendas: number } | null {
  if (ranking.length === 0) return null;
  return ranking.reduce((best, r) => (r.vendas > best.vendas ? r : best), ranking[0]);
}

// ---------------------------------------------------------------------------
// Filtragem por chave composta (segmentações de loja e período)
// ---------------------------------------------------------------------------
export interface Filtros {
  loja?: string;
  periodo?: string;
}

export function filtrarLojasPeriodos(f: Filtros): LojaPeriodo[] {
  return lojasPeriodos.filter(
    (r) => (!f.loja || r.loja === f.loja) && (!f.periodo || r.periodo === f.periodo),
  );
}

export function filtrarRanking(f: Filtros): RankingVendedor[] {
  return rankingVendedores
    .filter(
      (r) => (!f.loja || r.loja === f.loja) && (!f.periodo || r.periodo === f.periodo),
    )
    .sort((a, b) => a.posicao - b.posicao);
}

export function periodosDisponiveis(): string[] {
  return Array.from(new Set(lojasPeriodos.map((r) => r.periodo)));
}

export function lojasDisponiveis(): string[] {
  return Array.from(new Set(lojasPeriodos.map((r) => r.loja)));
}

// ---------------------------------------------------------------------------
// Formatação brasileira
// ---------------------------------------------------------------------------
const fmtBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fmtBRL2 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function fmtMoeda(v: number): string {
  return fmtBRL.format(v);
}

export function fmtMoeda2(v: number): string {
  return fmtBRL2.format(v);
}

export function fmtPercentual(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtNumero(v: number): string {
  return v.toLocaleString("pt-BR");
}

/**
 * Formato compacto para KPIs: R$ 937 mil, R$ 1,36 milhão, R$ 15 mil etc.
 * Mantém a precisão sem ambiguidade visual.
 */
export function fmtMil(v: number): string {
  const abs = Math.abs(v);
  const sinal = v < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const milhao = abs / 1_000_000;
    const inteiro = Math.floor(milhao);
    const decimal = Math.round((milhao - inteiro) * 10);
    return `${sinal}R$ ${inteiro}${decimal > 0 ? `,${decimal}` : ""} milh${milhao >= 2 ? "ões" : "ão"}`;
  }
  const mil = Math.round(abs / 1000);
  return `${sinal}R$ ${mil.toLocaleString("pt-BR")} mil`;
}
