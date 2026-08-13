# Refinamento solicitado (feedback do usuário + sugestões aceitas)

Solicitante enviou um parecer estruturado (arquivo /home/ubuntu/upload/pasted_content_2.txt) sobre a tela "Administração de dados" > aba "Lojas por período" (componente em /home/ubuntu/bi-richesse/client/src/pages/Admin.tsx, seção `aba === "lojas"`). Mudanças a implementar:

1. **Máscara de moeda nos inputs** de Vendas e Meta: exibir "R$ 7.800.000,00" enquanto digita, mantendo valor interno como número. Formatação ao sair do campo (onBlur) e no render inicial. lib existente: `parseMoeda` e `moedaParaTexto` em `client/src/lib/admin.ts` (moedaParaTexto devolve String(Math.round(v)) sem pontuação — alterar para usar `fmtMoeda(v)` que já formata BRL; atenção ao cursor ao editar: manter input "limpo" ao digitar e formatar apenas no blur, como hoje, mas com R$ e separadores).
2. **Cards de resumo no topo do período**: Realizado (soma vendas), Meta total, Atingimento consolidado, Falta para meta — antes da tabela "Desempenho por loja".
3. **Diferença → "Falta para meta" / "Acima da meta"**: quando abaixo, mostrar "Falta R$ X"; quando acima, "Acima R$ X"; caso sem dados, "—".
4. **Zeros tratados como sem dados**: lojas com vendas=0 E meta=0 exibir "—" no atingimento e status "Aguardando dados" (já existe parcialmente — confirmar que também meta=0 mostra —). LOJAS_PADRAO novas (ex.: Agosto) vêm com 0/0.
5. **Status por faixas** (proposta do usuário): 0–69% Crítico (vermelho), 70–89% Abaixo da meta (vermelho/laranja), 90–99% Próximo da meta (âmbar), 100–109% Meta atingida (verde), ≥110% Acima da meta (verde). Verificar `statusMeta` em `client/src/lib/data.ts` — ajustar faixas lá.
6. Manter "Realizado" como rótulo da coluna Vendas (mudar cabeçalho de "Vendas" para "Realizado").

Arquivos-chave:
- /home/ubuntu/bi-richesse/client/src/pages/Admin.tsx — aba "lojas" (linhas ~251-332)
- /home/ubuntu/bi-richesse/client/src/lib/admin.ts — parseMoeda, moedaParaTexto
- /home/ubuntu/bi-richesse/client/src/lib/data.ts — statusMeta (faixas), fmtMoeda, fmtPercentual
- /home/ubuntu/bi-richesse/client/src/components/bi/shared.tsx — StatusChip, KpiCard, corStatus

Estado do projeto: auto-publish ativo; domínio birichesse-jwptnsmt.manus.space. Último checkpoint: b05d1732 (sparkline corrigido).
