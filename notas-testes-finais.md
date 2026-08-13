# Testes finais — fases 15/16

## Screenshots verificados
- /admin: abas "Lojas por período / Ranking de vendedores / Importar relatório" aparecem. Admin funciona (dados Maio/Junho presentes).
- /resumo com Maio: KPIs ok, ranking ok, SEM coluna Variação (correto, Maio é o 1º mês — periodoAnterior = undefined).
- Falta verificar: (1) aba "Importar relatório" com colar do texto de Junho → Analisar → prévia → Importar; (2) /resumo com Junho: KPI atingimento deve mostrar delta +2,29 p.p. ↑ e tabela coluna "Variação vs Maio" com setas.

## Próximos passos (fase 17)
1. Testar importação via browser: admin → aba Importar relatório → colar relatório Junho completo → Analisar → ver prévia → Importar → conferir toast.
2. Ver /resumo?periodo=Junho (via select no header).
3. Depois: checkpoint, entrega (fase 18).
4. TypeScript já OK (0 erros). Devserver reiniciado (cache limpo).
