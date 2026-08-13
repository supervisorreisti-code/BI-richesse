# Teste visual pós-upgrade (11/08 19:26)

## Visão Geral (/)
- OK: KPIs Maio = R$ 3.820.000 / R$ 5.201.938 / 73,43% — conferem com dados oficiais do banco.
- OK: Evolução mensal por loja exibe Maio/Junho/Julho com sparklines e deltas. Richesse Eventos aparece só com Julho (correto, não existia antes).
- Problema MENOR: Richesse Eventos em 1º card (ordenada por nome/ating?). Ordem mudou mas não quebra nada.

## Resumo Executivo (/resumo)
- OK: KPIs Maio corretos, ranking das 8 lojas de Maio com status/faltas corretos.

## Admin (/admin)
- OK: período Maio, R$ 3.820.000, 73,43%, faltas corretas. Inputs com máscara BRL funcionando.
- Texto ainda diz "salvas neste navegador" — atualizar para mencionar banco.

## Pendências de teste
1. Testar salvar um valor no Admin e conferir persistência no banco (mutation).
2. Testar importação de relatório colado (Julho já importado; usar dados fictícios não é necessário — conferir se a UI funciona).
3. Rodar vitest (pnpm test).
4. Atualizar textos do Admin sobre banco.
5. Checkpoint + entrega.

## Erro observado no log (não crítico para o usuário)
- "[Auth] Missing session cookie" — esperado, usuário não logado; queries públicas funcionam.
