# Todo — Área de administração de dados

## Fase 6 — Implementação
- [x] Camada de estado: `DataStore` com persistência em localStorage (dados editados pelo usuário) + dados oficiais embutidos como fallback; exportar API reativa (hook `useDataStore`)
- [x] Nova rota `/admin` com aba no header
- [x] Seção "Lojas por período": editar vendas/meta de cada loja; adicionar novo período (Junho/Julho) com todas as lojas
- [x] Seção "Ranking de vendedores": editar/criar/excluir vendedores por loja+período, com recálculo automático de posição
- [x] Botões "Salvar" e "Restaurar padrão (oficial)" + confirmação
- [x] Validações: nomes padronizados, valores numéricos, não permitir lojas vazias, recalcular atingimento/diferença automaticamente
- [x] Avisar que dados editados ficam no navegador (localStorage) e oferecer exportar/importar JSON

## Fase 7 — Testes
- [x] Adicionar período Junho, preencher valores e verificar visuais com filtro
- [x] Editar/criar/excluir vendedores e verificar ranking e KPI melhor vendedor
- [x] Restaurar padrão e confirmar retorno aos valores oficiais
- [x] TypeScript sem erros + screenshot final

## Fase 8 — Entrega
- [x] Checkpoint + mensagem final ao usuário
# Todo — Mini-timeline + Resumo Executivo

- [x] Visão Geral: gráfico de evolução do atingimento consolidado por período
- [x] Visão Geral: mini-timeline do atingimento por loja entre períodos (só com 2+ períodos)
- [x] Criar página /resumo: tela única para vídeo-chamadas (sem scroll, tudo visível)
- [x] Link "Resumo Executivo" no header e modo de apresentação
- [x] Testar visualmente e validar
- [x] Checkpoint e entrega
# Fase atual: carregar Junho (nova fase 12-14)
- Dados oficiais Junho recebidos (mensagem do usuário, 8 lojas). Pendências:
  1. Adicionar registros Junho em lojasPeriodos e rankingVendedores no data.ts (metas/vendas exatas do relatório; vendedores em milhares).
  2. Nomes abreviados Junho — registrar como recebidos, sem inventar sobrenomes.
  3. "Richesse SETOR OESTE" → nome padrão "Richesse Oeste".
  4. Vendedores Junho: Flamboyant (Luciana 101k, Cintia 93k, Steffany 68k, Gabriel 57k, Helen 55k, Lays 48k, Micaelly 47k, Elen 40k); Marista (Milena 110k, Daniela 88k, Itamara 68k, Bruna 68k, Nathalia 58k, Julia 50k, Bianca 18k, Joelma 11k); TOGO (Caroline 79k, Diana 70k, Bianca 65k, Maria 63k, Kamille 46k, Davi 36k, Adelio 35k, Estefane 19k); Gelateria (Lusineide 69k, Jaqueline 64k, Nikelly 3k); Prime (Rayssa 48k, Eliana 44k, Celisnar 40k, Michele 34k, Daniela 11k, Adriana 8k, Jusimeire 4k, Flavia 241,18); Park (Isabela 76k, Marcela 61k, Jessica 38k, Nyckolas 34k, Jennifer 30k, Sabrina 28k, Jaqueline 16k, Waldir 15k); Goiânia Shopping (Letícia 63k, Ana 61k, Karen 59k, Cassiane 59k, Wellington 56k, Thyayla 49k, Alexander 48k, Ana 47k); Oeste (Karolyne 126k, Naiane 114k, Natia 95k, Dayane 78k, Naykele 73k, Denize 73k, Naydes 59k, Davi 56k).
  5. Metas/Vendas Junho: Flamboyant 810.690/707.000; Marista 619.622/479.000; TOGO 565.707/430.000; Gelateria 182.577/136.000; Prime 242.154/191.000; Park 546.350/336.000; Goiânia Shopping 676.460/502.000; Oeste 1.258.616/931.000.
  6. Validar: Visão Geral (filtros Maio/Junho, gráficos de evolução), Detalhe Loja, Resumo Executivo.
  7. Checkpoint + entrega.
## Validação numérica Junho (calculada)
- Consolidado Junho: vendas R$ 3.712.000 | meta R$ 4.902.176 | atingimento 75,72% | diferença -R$ 1.190.176
- Por loja (% | dif): Flamboyant 87,21 | -103.690; Oeste 73,97 | -327.616; Prime 78,88 | -51.154; Gelateria 74,49 | -46.577; TOGO 76,01 | -135.707; Marista 77,31 | -140.622; Goiânia 74,21 | -174.460; Park 61,50 | -210.350
- Conferência na UI: KPIs Visão Geral filtro Junho devem bater com esses números; Maio: vendas 3.820.000 / meta 5.201.938 / 73,43% (manter igual).
## Validação concluída (fase 13)
A Visão Geral com filtro Junho exibe exatamente os valores calculados (vendas R$ 3.712.000, meta R$ 4.902.176, atingimento 75,72%, diferença -R$ 1.190.176) e a tabela por loja bate loja a loja (Flamboyant 87,21%, Park 61,50% etc.). O Detalhe da Loja em Junho mostra corretamente Karolyne (R$ 126.000) como melhor vendedora do Oeste com ranking completo, e o Resumo Executivo com Junho exibe Flamboyant como melhor loja e todos os KPIs corretos. Maio permanece íntegro nos dois períodos. Restam: checkpoint e entrega (fase 14).
# Fase atual: importar relatório colado + variações no Resumo Executivo

- [x] Criar parser de relatório (client/src/lib/parseRelatorio.ts): extrai período (opcional, pedir confirmação), seções de loja (número + nome), meta, total de vendas, lista de vendedores (nome — valor em "mil" ou exato), padroniza "SETOR OESTE" → "Richesse Oeste", mapeia nomes do relatório para as lojas existentes do store (ex.: "FLAMBOYANT"→Richesse Flamboyant), detecta período do texto se presente
- [x] Testar o parser com o relatório de Junho colado (benchmark: 8 lojas com valores oficiais já validados: Flamboyant 707.000/810.690, Park 336.000/546.350, Flavia 241,18 exato)
- [x] Adicionar aba "Importar relatório" no Admin com textarea, botão Importar, preview do que será importado, opção de período novo ou existente, e relatório de conflitos (lojas não reconhecidas)
- [x] Resumo Executivo: no ranking das lojas, coluna extra de variação vs mês anterior (ex.: +2,29 p.p. ↑ verde / -1,5 p.p. ↓ vermelho) e KPIs de atingimento com delta (75,72% vs 73,43% = +2,29 p.p.)
- [x] Testar visualmente ambas as páginas e checkpoint
# Fase atual: carregar Julho (9 unidades)

- [x] Adicionar período "Julho" no data.ts (lojasPeriodos: 9 unidades incl. Richesse Eventos)
- [x] Adicionar rankings de vendedores de Julho no data.ts
- [x] Validar consolidado Julho: vendas, meta, atingimento, diferença
- [x] Nome padrão: "Richesse Eventos" (nova), "Richesse Oeste" (Setor Oeste)
- [x] Testar visualmente: visão geral, detalhe loja, resumo executivo, admin
- [x] Checkpoint + entrega

## Dados Julho (oficiais)
Vendas/Meta: Flamboyant 787.000/980.779; Marista 473.000/695.647; TOGO 375.000/624.479; Gelateria 177.000/226.954; Prime 170.000/315.386; Park 390.000/581.174; Goiânia Shopping 527.000/790.397; Oeste 876.000/1.516.955; Eventos 286.000/350.000.

Rankings Julho: Flamboyant (Luciana 114k, Cintia 92k, Steffany 80k, Helen 69k, Gabriel 65k, Elen 59k, Gabriel 58k, Micaelly 55k — dois "Gabriel" mantidos); Marista (Mylena 77k, Daniel 65k, Nathalia 62k, Bruna 58k, Joelma 49k, Itamara 48k, Jaina 41k, Maria 29k); TOGO (Kamille 53k, Elainny 51k, Caroline 50k, Diana 41k, Adriana 37k, Adelio 35k, Michelle 21k, Syang 18k); Gelateria (Lusineide 90k, Jaqueline 87k); Prime (Eliana 42k, Rayssa 41k, Celisnar 39k, Michele 33k, Jusimeire 4k, Juliana 4k, Daniela 3k, Adriana 3k); Park (Isabela 78k, Marcela 67k, Jennifer 55k, Sabrina 51k, Nyckolas 46k, Stefane 33k, Ana 18k, Waldir 12k); Goiânia Shopping (Alexander 99k, Wellington 66k, Letícia 64k, Ana 58k, Karen 56k, Kemelli 52k, Cassiane 46k, Thyayla 35k); Oeste (Karolyne 128k, Denize 84k, Natia 78k, Dayane 70k, Naykele 60k, Naydes 49k, Sabrina 48k, Naiane 47k); Eventos (Ludmila 286k).
## Validação concluída (Julho)
O Admin mostra o período Julho com as 9 unidades corretas (Flamboyant 80,24%, Marista 67,99%, TOGO 60,05%, Gelateria 77,99%, Prime 53,90%, Park 67,11%, Goiânia Shopping 66,68%, Oeste 57,75%, Eventos 81,71%). A Visão Geral exibe os três períodos nos filtros, no gráfico consolidado (73/76/67%) e na timeline por loja (9 linhas incluindo Eventos). O Resumo Executivo em Julho mostra vendas R$ 4.061.000, meta R$ 6.081.771, atingimento 66,77% com delta -9 p.p. vs Junho, melhor loja Richesse Eventos (81,71%), melhor vendedora Ludmila (R$ 286.000) e a coluna "Variação vs Junho" com deltas por loja. O Detalhe da Loja em Julho na Richesse Oeste confere: R$ 876.000, meta R$ 1.516.955, 57,75%, melhor vendedora Karolyne (R$ 128.000), ranking completo com 8 posições. Maio e Junho permanecem íntegros. Restam checkpoint e entrega.
# Fase atual: evolução mensal visível por loja (pedido final do usuário)

- [x] Reler VisaoGeral.tsx e a seção atual de evolução
- [x] Criar seção destacada "Evolução mensal por loja" com minisparklines + tabela Maio/Junho/Julho + setas coloridas (verde ↑ melhora, vermelho ↓ queda)
- [x] Respeitar filtro de período e de loja selecionados
- [x] Verificar TypeScript e testar visualmente
- [x] Checkpoint e entrega

## Validação concluída (Julho)

# Fase atual: modo apresentação tela cheia da evolução mensal

- [x] Adicionar parâmetro de modo apresentação ao EvolucaoLojas (cards grandes, tipografia ampliada, sparklines maiores)
- [x] Botão "Maximizar" no Panel da seção + atalho F / ESC, fundo escuro navy para vídeo-chamadas
- [x] Verificar TypeScript e testar visualmente
- [x] Checkpoint e entrega

## Estado do modo apresentação (fase atual)
O componente EvolucaoLojas.tsx (client/src/components/bi/EvolucaoLojas.tsx) já está pronto e usado na VisaoGeral.tsx dentro de um Panel "Evolução mensal por loja" (linha ~170). Estrutura interna do card: título da loja, badge do último atingimento, sparkline SVG (viewBox 152x48, pontos com labels 8px), mini-tabela com linhas {periodo, vendas fmtMoeda, atingimento fmtPct, SetaDelta (verde/text-success ↑ +N p.p., vermelho/text-danger ↓ -N p.p., cinza Minus quando sem dados)}. Helpers: deltaEntreMeses e SetaDelta são exportados/definidos no arquivo; corStatus e fmtPct vêm de shared; fmtMoeda de lib/data. Prop do componente: { lojasFiltro?: string }. Planos: adicionar prop `apresentacao?: boolean` que amplia tudo (texto lg-2xl, sparkline h-40, tabela py-4); criar diálogo/overlay fullscreen no EvolucaoLojas com botão "Maximizar" no Panel, fundo navy escuro (#17365D), atalho F/ESC. Depois checkpoint e entrega.

# Fase atual: conectar ao Supabase (implantação do PRD aprovado) — CONCLUÍDA

- [x] Verificar projetos Supabase disponíveis via MCP (list_projects)
- [x] Upgradar projeto webdev para full-stack (web-db-user) — backend + DB + auth
- [x] Criar esquema: lojas_periodos, ranking_vendedores, users, audit_log (soft-delete via API; TiDB não suporta triggers)
- [x] Migrar dados oficiais Maio/Junho/Julho para o banco (25 lojas + 173 rankings via seed)
- [x] Adaptar DataStore/painel para ler e gravar no banco via tRPC (localStorage como cache/fallback)
- [x] Procedures importarLote e resetarBanco no router bi + helpers no db.ts
- [x] Testar: visão geral, detalhe, resumo executivo, admin (edição, importação, novo período); vitest 6 testes
- [x] Textos do Admin atualizados para mencionar persistência na nuvem e auditoria
- [x] Usuário revogou a publishable key do Supabase externo; decidiu usar o banco integrado (não conectar Supabase externo)
- [x] Screenshot final: Visão Geral, Detalhe da Loja, Resumo Executivo (/resumo), Admin — tudo OK

# Lacunas de teste detectadas (pós-migração)
- [x] Testar importação de relatório no Admin com banco conectado: procedures importarLote/resetarBanco adicionadas; teste via API tRPC executado com sucesso; importação JSON e restauração padrão agora persistem no banco via eventos do provider
- [x] Testar criação de novo período (Agosto) no banco: validado via API real e screenshot da Visão Geral com banco conectado; correção do rótulo solto da Richesse Eventos no sparkline

# Fase atual: evolução super BI (agosto — todas as skills)

## Infraestrutura
- [x] Backend de backup: tabela backup_snapshots criada, snapshotCompleto/listarBackups/insereBackup em db.ts, procedures criarBackup/listarBackups no router, teste vitest passando
- [x] Backend de auditoria: listarAuditoria em db.ts + procedure bi.listarAuditoria, teste vitest passando
- [x] Snapshots persistem via storagePut (S3 backups/bi-richesse-{stamp}.json) + tabela backup_snapshots com metadados

## Análises novas
- [x] Ranking consolidado de vendedores: card Top Geral (top 3 entre lojas) no Resumo Executivo
- [x] Link compartilhável de período (?periodo=X&loja=X) abrindo Visão Geral já filtrada + botão Compartilhar no cabeçalho
- [x] Insights automáticos: 4 cards dinâmicos (mais próximo da meta, menor atingimento, maior queda vs anterior, maior venda individual) na Visão Geral

## Qualidade
- [x] Testes vitest para backup/auditoria (server/bi.backup-auditoria.test.ts, 3 testes)
- [x] TypeScript sem erros + screenshots validados
- [x] Checkpoint + entrega (auto-publish) — version 7ecd47c4
- [x] GitHub atualizado (commit 6fc7b60 na branch main)

# Fase atual: remover coluna de deltas das mini-tabelas da Evolução mensal (pedido do usuário)

- [x] Remover SetaDelta/p.p. das linhas da mini-tabela no EvolucaoLojas (modo normal e apresentação), mantendo Mês | Vendas | Meta | Atingimento
- [x] Atualizar subtítulo da seção (remover menção a deltas)
- [x] TypeScript sem erros + screenshot validado + checkpoint (auto-publish)

# Fase atual: deploy externo do BI (Vercel ou alternativa)

- [x] Mapear a migração do banco integrado para um banco externo compatível com MySQL/TiDB, preservando os dados oficiais e backups.
- [x] Substituir dependências específicas da hospedagem atual, incluindo autenticação, por alternativas compatíveis com deploy externo.
- [x] Configurar e validar um deploy piloto no provedor externo escolhido, sem interromper o endereço atual.
- [x] Documentar as variáveis de ambiente, processo de publicação e recuperação do ambiente externo.

# Fase atual: migração completa para Vercel confirmada pelo usuário

- [x] Confirmar a conta Vercel conectada ao GitHub e criar o projeto externo a partir da branch main.
- [x] Enviar a versão adaptada para o GitHub (commit `303f753` na branch `main`).
- [x] Criar um cluster TiDB Cloud externo, aplicar o schema MySQL e migrar lojas, rankings, usuários, auditoria e metadados de backup (origem 0 → externo 0).
- [x] Criar banco de aplicação dedicado `richesse_bi` e aplicar o schema completo no TiDB Cloud.
- [x] Restaurar os 25 registros oficiais de lojas e 173 rankings da fonte versionada, excluindo os dados de teste de agosto (validação: 25 lojas, 173 rankings, 1 usuário, 26 auditorias).
- [x] Restaurar os mesmos dados oficiais na base integrada atual para remover os 9 registros de teste de agosto que afetavam os backups e testes (consulta final: 25 lojas e 173 rankings; 16 testes passando).
- [x] Criar e ativar o cluster externo `Richesse-bi-prod` na região São Paulo (TiDB Cloud Starter).
- [x] Validar a conexão TLS ao TiDB Cloud externo com teste automatizado (`EXTERNAL_DATABASE_URL`).
- [x] Corrigir o destino da migração para o banco dedicado `richesse_bi` (o schema `sys` do TiDB é restrito a metadados do sistema).
- [x] Adaptar o backend Express/tRPC para Vercel Functions, sem listener de porta e sem o runtime específico da hospedagem atual.
- [x] Configurar conexão TLS explícita no `db.ts` para o endpoint público do TiDB Cloud em produção.
- [x] Substituir Manus OAuth por autenticação externa de administrador e proteger a área de Administração.
- [x] Aplicar guarda de rota no frontend: `/admin` redireciona visitantes sem sessão externa para `/login`.
- [x] Validar a versão externa: TypeScript sem erros e 17 testes automatizados passando.
- [x] Criar login externo com sessão JWT de 12 horas, credenciais administrativas em variáveis de ambiente e rota `/login`.
- [x] Criar função serverless `api/[...path].ts`, configuração `vercel.json` e contrato de variáveis em `.env.vercel.example`.
- [x] Substituir o storage de backups específico da hospedagem atual por armazenamento externo compatível com a Vercel (a vinculação do Blob será feita no projeto Vercel).
- [x] Implementar Vercel Blob para os snapshots externos, preservando o storage atual quando em ambiente interno.
- [x] Adicionar URLs temporárias de 10 minutos para o download de backups privados, sem expor o token de escrita no navegador.
- [ ] Configurar as variáveis de ambiente na Vercel, testar importação, auditoria, backup, apresentação e a leitura de todos os períodos.
- [x] Publicar o endereço Vercel e registrar o procedimento de rollback/continuidade.
- [x] Documentar arquitetura, variáveis, validação, rollback e rotina operacional em `docs/vercel-operacao.md`.
- [x] Corrigir a configuração de saída e roteamento da Vercel para servir a SPA em `/` e preservar a função tRPC em `/api/trpc`.
- [x] Corrigir a guarda de `/admin` no modo externo: visitantes sem sessão devem ser direcionados para `/login` antes de visualizar ou editar dados.
- [x] Corrigir a publicação da função tRPC em `/api/trpc`: a rota não pode retornar 404 na Vercel, pois isso impede login, persistência, auditoria e backups externos.
- [x] Impedir que o contexto externo inicialize OAuth Manus: rotas públicas na Vercel devem operar com `AUTH_MODE=external` sem exigir `OAUTH_SERVER_URL`.
- [ ] Validar com sessão administrativa real a aba Backups na Vercel: criar snapshot, confirmar registro no histórico e testar download por URL temporária.
- [ ] Registrar no diagnóstico o resultado da validação real de backup externo após o teste no Admin.
- [ ] Validar com a sessão administrativa real o login, a importação de relatório, o histórico de auditoria e a criação/download de backup.
- [x] Corrigir e validar a detecção do ambiente externo de storage: backups na Vercel selecionam exclusivamente o Vercel Blob, sem tentar usar credenciais internas.
- [x] Validar o modo Apresentar em tela cheia na implantação Vercel e registrar a continuidade operacional do endereço externo.
- [x] Substituir a grade do modo Apresentar por slides sequenciais de loja, navegáveis por setas e teclado, com período, faturamento, meta e atingimento em hierarquia visual clara.
- [x] Dar destaque independente à meta em cada slide, com comparação mensal organizada e controles de avanço, retorno, contador e saída da apresentação.
- [x] Aplicar, para todos os vendedores, lojas e períodos, o cálculo vendas do vendedor ÷ vendas totais mensais da loja e substituir o rótulo “% do 1º” por “% das vendas da loja”.
- [ ] Identificar, com base no relatório financeiro, a fórmula oficial do percentual por vendedor antes de substituir globalmente o indicador atual do ranking.
- [ ] Substituir Ludmilla — incluindo variações de grafia já cadastradas — por Cristina em todos os registros de Richesse Eventos, sem alterar valores, posições ou períodos.
- [ ] Impedir que a confirmação de uma edição de vendedor no Admin gere registros duplicados.
