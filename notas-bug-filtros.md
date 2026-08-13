# Bug encontrado e correção necessária

## Problema
`FiltrosDashboard` (shared.tsx, linhas 99-131) usa as constantes ESTÁTICAS
`periodosDisponiveis()` e `lojasDisponiveis` de `@/lib/data`, que retornam
apenas ["Maio"] e as lojas fixas. Após o usuário adicionar o período "Junho"
no Admin (persistido em localStorage), o select de Período na Visão Geral e
no Detalhe da Loja NÃO mostra Junho. Teste em / mostrou select com só "Maio".

## Correção necessária
- shared.tsx: `FiltrosDashboard` deve receber `periodos` e `lojas` como props
  (ou usar useDataStore diretamente).
- VisaoGeral.tsx e DetalheLoja.tsx já têm `store.lojasDoPeriodo` e
  `usePeriodosDisponiveis` do dataStore — passar essas listas para o
  componente de filtros:
  `<FiltrosDashboard filtros setFiltros compact periodos={periodosVivos} lojas={...} />`
- Atenção: no Admin, o seletor de período usa botões próprios (não usa
  FiltrosDashboard), então só as duas páginas de dashboard precisam mudar.

## Teste já feito (fluxo Admin OK)
- Adicionar período "Junho" → criou 8 lojas com 0, OK, toast OK.
- Editar vendas 720000 e meta 850000 da Flamboyant em Junho → atingimento
  recalculado 84,71% e status "Próximo da meta", OK.
- Falta: after corrigir os filtros, testar select Junho em /, teste de
  Ranking de vendedores (aba), teste de Restaurar padrão, checkpoint.

## Estado atual
- VisaoGeral.tsx e DetalheLoja.tsx já usam useFiltrar (dados vivos).
- Falta só repassar as listas vivas ao FiltrosDashboard.
## STATUS (atualizado após correção)
- CORRIGIDO: FiltrosDashboard agora recebe props `periodos` e `lojas` (listas vivas do store).
- VisaoGeral.tsx passa periodosVivos + store.lojasDoPeriodo(filtrosValidos.periodo).
- DetalheLoja.tsx passa periodosVivos + store.lojasDoPeriodo(...). TypeScript OK.
- TESTADO no browser: filtro Período agora mostra Maio e Junho; ao selecionar
  Junho, título virou "Junho", KPIs = R$ 720 mil / 850 mil / 84,71% / -130 mil
  (dados de exemplo da Flamboyant que preenchi no teste). Fluxo OK.

## Teste de dados de exemplo usado no browser (localStorage do sandbox)
- Junho: Flamboyant vendas=720000 meta=850000. TODAS as demais lojas Junho = 0.
- IMPORTANTE: antes de entregar, RESTAURAR os dados oficiais (botão "Restaurar
  padrão oficial" no Admin) para não entregar dados de teste poluídos.
- Depois de restaurar: validar Maio intacto (937k Oeste etc.), checkpoint final, entrega.

## Falta ainda testar (pode ser verificado por visual se necessário)
- Aba "Ranking de vendedores" no Admin (edição de vendedores).
- Depois restaurar padrão e entregar com resultado.
## PROBLEMA ENCONTRADO (17:16)
Cliquei em "Restaurar padrão oficial" (toast: "Dados restaurados ao padrão
oficial de Maio") MAS o ranking da Richesse Oeste continua mostrando o
vendedor de teste "Teste Adicionado | 200000" — o localStorage NÃO foi
limpo pelo botão. Ou seja, restaurarPadrao() no dataStore não está
reagindo (a versao mudou mas o storage talvez salvo em chave diferente,
ou o botão chama função errada/estado stale).
Próximos passos: ler Admin.tsx (handler do botão) e dataStore.tsx
(restaurarPadrao + DataProvider) para encontrar divergência.

Também observado: ranking mostrou "3 vendedor(es)" após adicionar 1 —
parecia certo? Na verdade mostrou 1 vendedor depois do add. OK.
## RESULTADO FINAL (17:17)
Após a correção (dispararRecarga + evento window "bi-richesse:recarregar"),
o botão "Restaurar padrão oficial" funcionou: o localStorage foi limpo, o
período Junho de teste sumiu (aba agora só mostra Maio) e o ranking voltou
aos 8 vendedores oficiais de cada loja (Flamboyant e Oeste conferidos).
Todos os fluxos do Admin testados com sucesso:
1. Adicionar período → cria lojas com 0 no período novo ✓
2. Editar vendas/meta → atingimento/diferença recalculados ✓
3. Adicionar vendedor → adiciona e reordena ranking ✓
4. Restaurar padrão oficial → limpa tudo e volta aos dados oficiais ✓
5. Filtro de período na Visão Geral reflete dados adicionados ✓
Pronto para checkpoint e entrega.
