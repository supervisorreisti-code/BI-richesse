# Diagnóstico — Modal Apresentação (fundo branco dos cards)

## Sintoma
- No modal em tela cheia ("Evolução mensal por loja"), os cards ficam com fundo branco
  e texto praticamente invisível (h3 "Richesse Flamboyant" em branco sobre branco).
- O overlay do modal usa `bg-[#102a4d]` e FUNCIONA.
- Os cards usam `bg-[#16355f]` e NÃO aplicam.

## Confirmações técnicas
- A regra `.bg-\[\#16355f\] { background-color: #16355f; }` existe no CSS gerado
  (confirmado via curl do index.css e via JS no browser).
- Aplicar `card.style.backgroundColor='#16355f'` inline funciona (visual fica correto).
- `bg-[#102a4d]` no mesmo overlay funciona.
- `getComputedStyle(card).backgroundColor` = rgba(0,0,0,0) → a classe não está aplicando.

## Hipótese mais provável
- O CSS gerado pelo Vite coloca `.bg-\[\#102a4d\]` ANTES de `.bg-card` e
  `.bg-\[\#16355f\]` DEPOIS de `.bg-card` no mesmo arquivo? NÃO — a ordem de
  geração é pelo aparecimento no código-fonte.
- MAIS PROVÁVEL: ambos foram usados na mesma string template literal? Não.
- REAL CAUSA: no CSS de Tailwind v4, classes arbitrárias geradas vêm no final do
  bundle de utilities; `bg-card` aparece ANTES. Ambas deveriam se aplicar.
- NOVA HIPÓTESE: `bg-card` vem no final (utilities são geradas em ordem de uso) —
  se `bg-card` aparece na classe string ANTES de `bg-[#16355f]` na ordem de
  geração... na verdade Tailwind v4 ordena utilities por "importância", depois
  por ordem de uso. bg-card é utility core usada antes → vem primeiro.
  bg-[#16355f] arbitrária gerada depois → vem DEPOIS → deveria VENCER.
- FALSO — a cascata do bundle: utilities arbitrárias vêm no MESMO layer que as
  core utilities. Ordem de uso decide. bg-card usada primeiro em muitos arquivos
  → definida antes. bg-[#16355f] depois → definida depois → aplicada por último.
  MAS no browser o computed fica rgba(0,0,0,0)...
- POSSIBILIDADE REAL: o estilo tag injetado pelo Vite HMR contém a regra, mas o
  navegador aplicou um CSS mais antigo (hmr update do index.css ocorreu mas o
  style tag do tailwind não foi atualizado). Já foi feito restart do vite:
  mesmo assim ainda rgba(0,0,0,0).
- TESTE A FAZER: renomear para classe não arbitrária, ex. `bg-[#102a4d]` no card
  (igual ao overlay, que funciona) — se funcionar, confirma que o problema é
  especificamente com o valor #16355f ou com a posição. MELHOR: usar bg-[#102a4d]
  nos cards para evitar a dúvida.

## Arquivos
- client/src/components/bi/EvolucaoLojas.tsx linha ~120: classe do card
- client/src/components/bi/ModalApresentacao.tsx: overlay do modal
- URL preview: https://3000-i3k3axswg4c9xui75hfh4-fda61887.us2.manus.computer/

## Estado visual correto (quando inline funciona)
- Cards azul #16355f, título branco grande, sparkline colorido, tabela mês a mês
  com vendas, atingimento % e deltas (verde ↑ / vermelho ↓ p.p.).
