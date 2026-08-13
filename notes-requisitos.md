# Notas do BI Richesse — Maio (v1)

## Fontes
- Especificação completa: /home/ubuntu/upload/pasted_content.txt
- Confirmação do usuário (2ª mensagem): dados de MAIO, 7 lojas detalhadas + Flamboyant no doc

## Modelagem (equivale ao modelo DAX especificado)
- Tabela `lojas_periodos`: periodo, loja, vendas_total, meta, atingimento_percentual, diferenca_meta
- Tabela `ranking_vendedores`: periodo, loja, posicao, vendedor, vendas
- Chave composta: loja + "|" + periodo (relacionamento 1:N)
- Medidas: Total Vendas, Total Meta, Atingimento %, Diferença Meta, Vendas Vendedores Informados, Qtd Vendedores, Melhor Vendedor, Vendas do Melhor Vendedor, Status Meta
- Fonte oficial de vendas/meta: lojas_periodos (NUNCA somar ranking)

## Dados oficiais MAIO (8 lojas)
Consolidado: vendas 3.820.000 | meta 5.201.938 | atingimento 73,43% | diferença -1.381.938

| Loja | Vendas | Meta | Atingimento | Diferença |
|---|---|---|---|---|
| Richesse Flamboyant | 694000 | 813808 | 85,28% | -119808 |
| Richesse Oeste | 937000 | 1359149 | 68,94% | -422149 |
| Richesse Prime | 217000 | 293964 | 73,82% | -76964 |
| Richesse Gelateria | 166000 | 191000 | 86,91% | -25000 |
| Richesse TOGO | 428000 | 630455 | 67,89% | -202455 |
| Richesse Marista | 513000 | 670925 | 76,46% | -157925 |
| Richesse Goiânia Shopping | 515000 | 650176 | 79,21% | -135176 |
| Richesse Park | 350000 | 592461 | 59,08% | -242461 |

## Vendedores por loja (ranking MAIO)
- Flamboyant: Luciana Araujo Alves 103k, Cintia Alzira 87k, Keleme Lima 71k, Helen Viana 64k, Gabriel Felipe 53k, Yara Rayanne 45k, Steffany Cristina 41k, Janis Lopes Lima 38k
- Oeste: Natia Cristina Saldanha 108k, Naiane Souza 98k, Karolyne de Sousa 93k, Maria Raimunda 81k, Denize dos Santos Silva 78k, Francisca Rodrigues 68k, Luciana de Kasssia 67k, Ireny Alves 65k
- Prime: Rayssa Lorrany 58k, Eliana Miguel de Morais 46k, Celismar Cunha Cavalcante 44k, Michele Gomes Pereira 33k, Daniela de Sousa 15k, Jusimeire de Rocha 5k
- Gelateria: Luscineide 88k, Jaqueline 78k
- TOGO: Maria Sthfanny dos Reis 79k, Bianca Vaz 68k, Caroline Sousa 67k, Diana Mendes 60k, Davi Mendes 51k, Estefane Lustosa 27k, Adelio Junio 24k, Kamille Jenifer 17k
- Marista: Mylena dos Santos 125k, Joelma Cristina 104k, Bruna Fernanda 65k, Itamara Araujo 65k, Daniel Silva 57k, Nathalia Silva 50k, Bianca dos Santos Luz 18k
- Goiânia Shopping: Alexander Machado de Almeida 90k, Leticia Cordoval 65k, Ana Paula Amaral 65k, Cassiane Eva Pinto 64k, Wellingyhon dos Santos 62k, Karen Lainy Ferreira 61k, Ana Tereza Freitas 52k, Nathalia Medeiros 16k
- Park: Isabela de Jesus 82k, Jessica Yasmin Rodrigues 80k, Marcela Lorrany 52k, Nyckolas Alessandro 46k, Felipe de Sousa 20k, Paulo Ricardo 15k, Jaqueline Alves 12k, Ana Clara Carvalho 12k

## Regras
- Nomes padronizados (não criar "Setor Oeste")
- Status: >=100% verde "Meta atingida", >=80% amarelo "Próximo da meta", <80% vermelho "Abaixo da meta"
- Cores: Verde #2E7D32, Amarelo #F9A825, Vermelho #C62828, Azul escuro #17365D, Cinza claro #F4F6F8
- Moeda brasileira R$ #.##0,00; percentual 2 casas "73,43%"
- Preparado para Junho e Julho (mesmas tabelas, campo periodo)

## Páginas
1. Visão Geral: título "BI Comercial Richesse — Maio", 4 cartões KPI, tabela por loja (com status e barra de atingimento), gráfico de barras atingimento, colunas agrupadas vendas vs meta, filtros periodo + loja
2. Detalhe da Loja: filtros loja + periodo, 6 cartões (incluindo melhor vendedor), tabela ranking por posição, barras horizontais vendas por vendedor, colunas vendas vs meta por periodo
