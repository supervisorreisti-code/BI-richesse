# Debug: layout da mini-tabela em EvolucaoLojas.tsx

## Problemas reportados pelo usuário
1. Modo normal: valores se sobrepunham após adicionar a meta.
2. Modo apresentação (maximizado): "numerações ficam bugadas" — valores espremidos/sobrepostos.

## Tentativas
- V1 (flex + w-28/w-24/w-16/w-24): ok no modo normal, mas bugado no modo apresentação
  (justify-between com larguras fixas em px não distribui quando fonte aumenta).
- V2 (grid com grid-cols-[52px_1fr_96px_52px_84px] / apresentacao: [76px_1fr_140px_88px_112px]):
  o screenshot do modo normal mostra a coluna de VENDAS SUMIDA ("R$ 694.000" virou "R$")
  porque grid-cols não são valores válidos de Tailwind v4 arbitrários? NÃO — a causa provável
  é que o grid-cols-[...] não foi aplicado (Tailwind v4 não gerou as classes grid-cols-[...]
  ou a classe de container com 3 condições concatenadas não bateu na fonte).

## Hipótese da causa
A linha usa template literal com 3 classes condicionais concatenadas. No modo normal,
`apresentacao` é false, então a classe aplicada é:
`grid items-center rounded px-2 py-1.5 grid-cols-[52px_1fr_96px_52px_84px] gap-2`
=> se grid-cols-[52px_1fr_96px_52px_84px] não foi gerada, vira grid de 1 coluna =>
os spans empilham e a coluna de vendas parece sumir.

VERIFICAÇÃO NECESSÁRIA: conferir no CSS gerado se `.grid-cols-[52px_1fr_96px_52px_84px]` existe.
Nota: Tailwind v4 deve gerar; mas se o arquivo não for escaneado na lista de sources, não gera.
Provável: o arquivo É escaneado (outras classes funcionam). Alternativa: classes arbitrárias
com valores complexos (52px_1fr_96px...) podem falhar no escape do v4.

## Solução robusta
Usar CSS custom (classe .evo-grid / .evo-grid-apresentacao com display:grid e grid-template-columns
definidos inline via style={{gridTemplateColumns:...}}) — 100% determinístico, não depende do Tailwind.

## Novo diagnóstico (v3)
O grid container agora tem width=100% e minWidth=0, e gridTemplateColumns computado = "52px 9.65625px 96px 52px 84px".
A string inline é "52px minmax(0px, 1fr) 96px 52px 84px" mas o browser COMPUTOU 9.65px para o track 1fr.
Isso acontece quando o grid é um item de grid pai com alinhamento que força shrink, ou quando um dos itens
é posicionado com grid-column fora, ou quando há `place-items`...
CAUSA PROVÁVEL: o pai da linha é `<div className="space-y-1.5 text-xs">` — OK. MAS: o pai do card é um grid
de 3 colunas na Visão Geral; nada anormal.
VERIFICAR: se o card tem `overflow-hidden` e os spans têm `truncate`, e se o conteúdo do span de vendas
("R$ 694.000" = 64px) deveria caber na 1fr: total fixo = 52+96+52+84+gaps = 320px; cardW=376 => 1fr = 56px >= 64? NÃO cabe!
56px < 64px => o track 1fr pode encolher para min(64px, 56px)... mas com minmax(0,1fr) deveria ficar 56px com overflow.
Porém computed = 9.65px => muito menor. => ALGO faz o conteúdo "máximo" do 1fr ser 9.6px.
HIPÓTESE FORTE: o span de vendas tem `min-w-0 truncate` — mas o COMPUTED 9.65px é exatamente o valor de min-content
de algo... 9.65px = largura de "R$". O track colapsou para min-content porque o item tem `overflow:hidden`+`text-overflow:ellipsis`? 
Na verdade, com `minmax(0, 1fr)` isso não deveria acontecer. MAS: gridTemplateColumns é aplicado via style inline;
talvez o HMR não tenha atualizado o arquivo no browser (cache). O style inline vem do React — deveria ser novo.
O row.getAttribute('style') mostra a string nova => React novo. 
=> Testar diretamente: criar um grid de teste na página e ver se minmax(0,1fr) funciona no browser (problema pode ser
no template index.css redefinindo algo como .grid > * { min-width: 0 }...). 

## CAUSA RAIZ ENCONTRADA
O grid de teste funcionou SÓ quando removi o `gap: 0.5rem` inline (que vem do ternário `gap: apresentacao ? "0.75rem" : "0.5rem"`).
Com gap inline, gridTemplateColumns computou "52px 24px 96px 52px 84px" (colapso); sem gap, computa corretamente "52px 56px 96px 52px 84px".
=> O `gap` inline com valor de string "0.5rem" está sendo interpretado, mas algo no container faz o grid colapsar quando gap está presente... Na verdade, com gap 8px: total fixo = 284+24(gaps) = 308; 342-308 = 34px disponíveis; mas computed foi 24px — 10px a menos... O "10px a menos" é exatamente o comportamento de `align-items: center`? Não.
=> HIPÓTESE FINAL: o grid container tem `width:342px` mas o COMPUTED width da grid era 326px (342-16 padding do pai). Soma fixa = 52+96+52+84 = 284; 326-284 = 42; com 3 gaps de 8 = 24 => 42-24 = 18... não bate.
=> Com gap 0: 56px = 342-284 = 58 ≈ 56 (conta com paddings). COERENTE.
=> Com gap 8: deveria ser 56-24 = 32, mas foi 24. Ainda 8px a menos (1 gap).
=> CONCLUSÃO: com `display:grid` + gap inline, um dos gaps está sendo contado a mais no track. Provavelmente o grid tem 5 colunas e 4 gaps (32px), mas o container disponível é menor (padding do wrapper). Na verdade o wrapper .space-y tem padding? O pai tem `text-xs`... de qualquer forma, a SOLUÇÃO PRÁTICA: usar `gap` como classe Tailwind (`gap-2`/`gap-3`) em vez de inline, e usar classes Tailwind de grid-cols também OU simplesmente remover o gap inline e usar padding nos spans.
DECISÃO: refazer a linha SEM grid: voltar para flex com gap, mas com o span de vendas sem truncate destrutivo e com flex-shrink-0 nos demais... Melhor: flex + gap + spans com shrink-0 para mês/%/delta e span vendas com truncate (pode truncar com ellipsis se precisar, mas tem espaço).

## ESTADO ATUAL (v8)
- Layout flex com shrink-0 e larguras fixas: MESMO/META cabe, mas % e delta (ml-auto) escapam da borda direita do card no modal.
- Card do modal tem ~390px. Soma fixa w-20+w-28+w-36 = 164px; espaço restante para % (2 col, ~60px) + delta (~36px) + gaps deveria caber. MAS no screenshot os % estão cortados na borda direita.
- Diagnóstico: o container pai do flex tem overflow? O modal (Dialog) tem overflow-y-auto e o card rounded-lg p-4 pode ter overflow hidden? O DialogContent do shadcn tem max-w-[900px] w-[90%] p-6 — o grid de 3 colunas md:grid-cols-2 xl:grid-cols-3 => em 1006px cada card = (1006-48)/3 = 319px! Menor que 390. Então o card tem ~320px, e 320-16(paddings)-164 = 140px para % (~55px) + delta (~36px) + ml-auto/spacing = ~91px necessários => NÃO CABE. 
- SOLUÇÃO DEFINITIVA: no modo apresentação, reduzir a tabela: juntar vendas+meta numa única célula ("R$ 694.000 / Meta 813.808") OU reduzir fonte apenas da tabela no modal (text-base) e larguras menores, ou remover a coluna do mês e deixar só R$/Meta/%/delta com ml-auto no %.
