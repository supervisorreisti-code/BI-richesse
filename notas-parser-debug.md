# Debug do parseRelatorio.ts — estado atual

## Contexto
Fase: implementação da importação de relatório colado (fase 15). Parser criado em
client/src/lib/parseRelatorio.ts, testes em /home/ubuntu/teste_parser.ts (relatório
completo de Junho) e /home/ubuntu/teste_solo.ts (uma loja). Rodar com:
cd /home/ubuntu/bi-richesse && npx tsx /home/ubuntu/teste_parser.ts

## Resultado atual do teste completo (Junho)
Período detectado: Junho ✓
Lojas: 7 (falta Richesse Oeste/SETOR OESTE) | Vendedores: 51 (faltam 8) | Avisos: 0
As 7 primeiras lojas batem 100% com os oficiais (vendas, meta, contagem de vendedores).
Flavia R$ 241,18 ainda undefined porque OESTE não entra no array.

## Observações do debug
- Regex SECAO_LOJA casa "8. RICHESSE SETOR OESTE" perfeitamente (teste solo PASSA: loja
  Richesse Oeste com Karolyne/Naiane corretos quando o texto começa direto nela).
- "8. Ana — R$ 47 mil" NÃO casa com SECAO_LOJA (contém "—" minúsculo? na verdade o
  teste node respondeu false, ok).
- HIPÓTESE: no relatório completo, a linha "8. Ana — R$ 47 mil" casa com
  LINHA_VENDEDOR mas... vendedores somam 51 = 7 lojas completas. A seção OESTE vem
  DEPOIS da linha "TOTAL DE LOJAS ANALISADAS: 8"?? Não — ela vem antes (linha 129 do
  teste_parser.ts). VERIFICAR: talvez a regex garçons "gar[çc]ons" não case com
  "Top 8 garçons:" da seção OESTE por causa do "ç" — mas GOIÂNIA funcionou...
- Próximos passos: adicionar console.log dentro do loop do parser para ver qual linha
  cria cada loja no texto completo; provavelmente a seção OESTE casa com SECAO_LOJA
  porém o push dela só ocorre quando outra seção vem depois — e depois dela vêm
  "TOTAL DE LOJAS..." que não é seção; mas o fim do loop tem `if (atual) lojas.push(atual)`.
  Estranho. Possível causa: SECAO_LOJA com lazy quantifier `.+?` — em "8. RICHESSE SETOR
  OESTE" captura "SETOR OESTE" (ok no teste). ALTERNATIVA: a linha "8. RICHESSE SETOR OESTE"
  no teste_parser.ts pode ter um caractere invisível diferente (o texto foi digitado pelo
  usuário). VERIFICAR bytes reais dessa linha no teste.

## Estrutura do parser (arquivo parseRelatorio.ts, funções exportadas)
- extrairRelatorio(texto): RelatorioExtraido { periodoDetectado, lojas[], avisos[], totalVendedores }
- extrairParaRegistros(extraido, periodo): { lojas: LojaPeriodo[], ranking: RankingVendedor[] }
- mapearLoja(nome): { oficial, reconhecida } (SETOR OESTE → Richesse Oeste ✓)
- detectarPeriodo(texto) (linha "Período: JUNHO" ✓)
- parsearValor(raw) ("R$ 1.258.616,00"→1258616; "101 mil"→101000; "241,18"→241.18 ✓)
- LojaExtraida { lojaOficial, nomeNoRelatorio, meta, vendas, vendedores[], reconhecida }

## Faltam na fase 15/16
- [x] Parser com push correto das lojas (corrigido: fechar loja anterior ao abrir nova + última)
- [ ] Descobrir por que OESTE não aparece no relatório completo (falta o log de linha a linha)
- [ ] Componente React de importação no Admin.tsx: textarea, preview, seleção de período
  (detectado ou manual), botão confirmar que chama salvarLojaPeriodo/salvarVendedor do
  DataStore (useDataStore), com toast de sucesso (sonner)
- [ ] Adicionar método store para importar lote (ou chamar salvarLojaPeriodo em loop)
- [ ] Resumo Executivo: delta vs mês anterior — coluna "Variação" no ranking das lojas
  (p.p. vs mês anterior, seta ↑ verde / ↓ vermelho) e KPI atingimento com delta
- [ ] TypeScript check, screenshots, checkpoint e entrega
## RESOLVIDO (bugs encontrados e corrigidos no parser)
1. `atual` era zerado por "TOTAL DE LOJAS..." e "Observação:" SEM salvar a loja anterior → a última loja (SETOR OESTE) sumia. Corrigido: salvar antes de zerar (mesma lógica ao abrir nova seção).
2. LINHA_VENDEDOR não tinha ancoragem R$ → qualquer "N. X — Y" casava; corrigido com `R\$` obrigatório.
3. SECAO_LOJA casava com linhas de vendedor sem R$ (após ajuste #2, ok).
4. Bug no TESTE (não no parser): Flavia está na Prime, teste buscava na Flamboyant.
Resultado final: 8 lojas, 59 vendedores, 100% bate com oficiais de Junho. PASSOU.

## Próximo: componente React de importação no Admin
- Admin.tsx já tem abas (lojas por período + ranking). Adicionar aba "Importar relatório".
- Estado local: texto colado, extraído (RelatorioExtraido), períodoEscolhido (detectado ou manual).
- Preview: lista de lojas com meta/vendas/vendedores; avisos; lojas não reconhecidas.
- Confirmar: extrairParaRegistros → salvarLojaPeriodo x N + salvarVendedor x N + addPeriodo se novo.
- Sonner toast sucesso/erro.
- Depois: deltas no Resumo Executivo (variação p.p. vs mês anterior + setas).
## Estado da fase 15 (componente importação no Admin)
FEITO no Admin.tsx (parcial — falta UI da aba "importar"):
- Imports adicionados: extrairRelatorio, extrairParaRegistros, RelatorioExtraido de @/lib/parseRelatorio
- Type Aba = "lojas" | "vendedores" | "importar"
- Estados: textoRelatorio, extraido, periodoImportacao
- Derivados: periodoImportacaoValido, lojasJaImportadas (useMemo sobre store.lojasPeriodos)
- Handlers: handleAnalisarRelatorio (valida, extrai, seta período detectado), handleConfirmarImportacao (addPeriodo se novo, salva lojas + vendedores via store, limpa estados, toast)
FALTA:
1. Adicionar botão da aba "Importar relatório" na barra de abas (linha ~200 do Admin.tsx, as const [["lojas","Lojas por período"],["vendedores","Ranking de vendedores"]] — incluir ["importar","Importar relatório"])
2. Adicionar bloco `{aba === "importar" && (...)}`: textarea (h-40, placeholder com exemplo), botão "Analisar relatório", preview com período (input), lista de lojas com meta/vendas/vendedores, avisos (extraido.avisos), lojas não reconhecidas (reconhecida:false), aviso de sobreposição (lojasJaImportadas), botão "Importar para o painel" (habilitado só com periodoImportacaoValido)
3. Depois fase 16: deltas no ResumoExecutivo.tsx — ver como é renderizado o ranking (usa lojasDoPeriodo do store ordenado por atingimento) e KPIs. Adicionar mês anterior via periodosDisponiveis ordenados (Maio/Junho/Julho ordem natural; criar helper de ordem: array MESES). Coluna "Variação vs mês anterior": delta de atingimento em p.p. com seta ↑ verde / ↓ vermelho; no KPI de atingimento consolidado, mostrar delta.
4. TypeScript check, telas admin/importar + resumo com deltas, checkpoint, entrega.
Parser: TESTE COMPLETO PASSOU (8 lojas, 59 vendedores, 100% oficiais Junho).
Parser pronto em client/src/lib/parseRelatorio.ts (API: extrairRelatorio, extrairParaRegistros, mapearLoja, detectarPeriodo, parsearValor).
