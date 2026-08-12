# Formato padrão de relatório enviado pelo usuário

O usuário alimenta o BI com um relatório de texto ("RELATÓRIO DE VENDAS — RICHESSE") que ele mesmo copia e cola na conversa. A convenção confirmada:

- O texto deve conter o cabeçalho `Período: <MÊS>` (ex.: JUNHO, JULHO). O relatório de Junho enviado veio sem essa linha no cabeçalho, mas estava indicado antes do texto.
- Seções numeradas, uma por loja, no formato `N. RICHESSE <NOME DA LOJA>` seguido de `Meta: R$ ...` e `Total de vendas: R$ ...` e a lista `Top 8 garçons:` com itens `<nome> — R$ <valor>`.
- Valores de vendedores vêm arredondados em "mil" (ex.: R$ 101 mil) — exceto quando o relatório traz valor exato (Flavia, R$ 241,18).
- "RICHESSE SETOR OESTE" deve ser sempre padronizado para o nome "Richesse Oeste" no painel.

## Regras de ingestão
1. Manter metas e vendas totais exatamente como informados (fonte oficial).
2. Registrar nomes de vendedores conforme aparecem no relatório, sem inventar sobrenomes.
3. Valores em "mil" são multiplicados por 1.000; valores exatos são usados como estão.
4. Atingimento e diferença são calculados, nunca informados pelo usuário.
5. Quando o texto vier sem o cabeçalho de período explícito, confirmar com o usuário qual período o relatório se refere.

## Histórico de ingestões
| Período | Status |
| --- | --- |
| Maio | Carregado no padrão oficial (data.ts) |
| Junho | Carregado no padrão oficial (data.ts) — relatório do usuário confirmado idêntico |
