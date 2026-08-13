# Brainstorm de Design — BI Comercial Richesse

## Três abordagens candidatas

### 1. Executive Ledger (escolhida)
Estética inspirada em relatórios financeiros impressos premium: papel claro, tipografia serifada para títulos, linhas finas, azul-marinho profundo como cor de autoridade. Emocional: seriedade, confiança, precisão contábil.
**Probabilidade: 0.06**

### 2. Terminal de Trading
Fundo escuro carvão com acentos neon de semáforo (verde/âmbar/vermelho), monoespaçada em detalhes, densidade alta de dados. Emocional: urgência e monitoramento em tempo real.
**Probabilidade: 0.03**

### 3. Swiss Data Poster
Grid helvético branco puro com tipografia grotesca gigante, blocos de cor chapada e numerais tabulares enormes. Emocional: clareza editorial, estilo revista de dados.
**Probabilidade: 0.04**

---

## Abordagem escolhida: Executive Ledger

**Design Movement**: Financial Report Editorial — mistura de relatórios anuais de alta-end (tipo Annual Report suíço) com dashboard executivo moderno. Referência: publicações financeiras impressas com hierarquia tipográfica serifada + painéis de dados limpos.

**Core Principles**:
1. O número é o protagonista — hierarquia tipográfica subordina tudo aos KPIs.
2. Autoridade através do azul-marinho: cor institucional usada com parcimônia em títulos, cabeçalho e destaques.
3. Semáforo semáforo como linguagem de estado: verde/âmbar/vermelho estritamente conforme a regra de status de meta — nunca decorativo.
4. Papel e tinta: fundo claro quente, bordas finas, sombras suaves, nada de glassmorphism ou neon.

**Color Philosophy**: Fundo cinza-papel #F4F6F8 com cartões brancos; azul-marinho #17365D como cor de autoridade (header, títulos, texto de destaque); semáforo #2E7D32 / #F9A825 / #C62828 exclusivamente para status de meta. Intenção: transmitir controle e maturidade comercial — o tipo de dashboard que um diretor abre em reunião.

**Layout Paradigm**: Header full-width azul-marinho com navegação entre páginas como "abas de relatório". Conteúdo em colunas assimétricas: barra lateral esquerda estreita de filtros (segmentações como no Power BI) + área principal com KPIs em linha e depois grids 2 colunas para gráficos e tabela. Nada centralizado em coluna única.

**Signature Elements**:
1. Barra de progresso inline na coluna "Atingimento %" (data bars, como formatação condicional do Power BI).
2. Chips de status coloridos com rótulo textual ("Abaixo da meta", "Próximo da meta").
3. Números tabulares com sufixo de moeda em pesos visuais distintos (valor grande + rótulo pequeno em caps).

**Interaction Philosophy**: Segmentações (filtros) reagem instantaneamente como no Power BI — ao selecionar uma loja, todos os visuais convergem para ela. Tooltip discreto em pontos de dados. Nenhuma animação que atrase a leitura.

**Animation**: Entradas com fade+rise de 200ms ease-out, stagger de 40ms entre cartões KPI. Barras de progresso animam largura em 400ms. Sem loops, sem parallax.

**Typography System**: Títulos em "Source Serif 4" (serifada, autoridade editorial); dados e UI em "IBM Plex Sans" (numerais tabulares, clareza). Números de KPI em peso 600, rótulos em uppercase 11px tracking largo.

**Brand Essence**: Painel executivo de desempenho comercial da Richesse — para direção e gerência de lojas; diferente por tratar atingimento de meta como linguagem visual primária. Adjetivos: sóbrio, preciso, confiante.

**Brand Voice**: Direto e analítico, sem exaltação. Ex.: "Maio fechou 73,43% da meta consolidada."; CTA de filtro: "Mostrar todos os períodos".

**Wordmark & Logo**: Monograma "R." em serifada com ponto, dentro de um losango/retângulo azul-marinho minimalista; usado no header e favicon.

**Signature Brand Color**: Azul-marinho #17365D.

## Style Decisions
- Semáforo aplicado apenas em status de meta e barras de atingimento; gráficos de vendas/meta usam azul-marinho (vendas) e azul claro/cinza (meta) para não conflitar.
- Moeda sempre em formato brasileiro: R$ 694.000,00.
