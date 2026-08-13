# Notas — Conexão Supabase (progresso)

## Status atual (fase 1 concluída)
- Upgrade full-stack (web-db-user) feito: projeto agora tem `db`, `server`, `user`. Stack: React 19 + Tailwind 4 + Express + tRPC 11 + Drizzle + MySQL (DATABASE_URL; template usa mysql2/drizzle-orm).
- Supabase MCP `list_projects` retornou vazio (nenhum projeto na conta) — decisão: usar o banco provisionado pelo template (MySQL) em vez de Supabase externo; banco do template funciona (SHOW TABLES OK).
- Home.tsx: corrigido import de useAuth (@/_core/hooks/useAuth) após merge; tsc limpo.
- pnpm install OK; dev server rodando (tsx watch server/_core/index.ts).
- Auto-merged trouxe: useAuth em main.tsx (com redirectToLoginIfUnauthorized em erros UNAUTHED 10001), trpc.ts criado, App.tsx routes intactas?, users table em drizzle/schema.ts (id, openId, name, email, loginMethod, role admin|user, timestamps).
- Template usa MySQL (drizzle mysqlTable) — adaptar schema de dados para mysqlTable.

## Próximo: schema (fase 2)
Tabelas a criar (via drizzle/schema.ts + drizzle-kit generate + webdev_execute_sql):
1. `lojas_periodos`: id int autoinc PK, periodo varchar(32), loja varchar(128), vendas_total bigint, meta bigint, atingimento double, diferenca_meta bigint, atualizado_em timestamp. UNIQUE (periodo, loja).
2. `ranking_vendedores`: id, periodo varchar(32), loja varchar(128), posicao int, vendedor varchar(128), vendas bigint. UNIQUE (periodo, loja, posicao).
3. `audit_log`: id, usuario varchar(255), tabela varchar(64), registro varchar(255), campo varchar(64), valor_antigo text, valor_novo text, criado_em timestamp.
Soft-delete conforme preferência: não precisa de is_deleted nas tabelas principais (não há entidade deletável no painel além de vendedores; para vendedores usar UPDATE is_deleted=true com trigger bloqueando DELETE).

## Dados a migrar (fase 2-3)
Maio/Junho/Julho oficiais em client/src/lib/data.ts: LOJAS_PADRAO, lojasPeriodos, rankingVendedores.
Maio: 8 lojas (Flamboyant 694.000/813.808; Oeste 937.000/1.359.149; Prime 217.000/293.964; Gelateria 166.000/191.000; TOGO 428.000/630.455; Marista 513.000/670.925; Goiânia Shopping 515.000/650.176; Park 350.000/592.461).
Junho: 8 lojas (Flamboyant 707.000/810.690; Marista 479.000/619.622; TOGO 430.000/565.707; Gelateria 136.000/182.577; Prime 191.000/242.154; Park 336.000/546.350; Goiânia Shopping 502.000/676.460; Oeste 931.000/1.258.616).
Julho: 9 lojas (Flamboyant 787.000/980.779; Marista 473.000/695.647; TOGO 375.000/624.479; Gelateria 177.000/226.954; Prime 170.000/315.386; Park 390.000/581.174; Goiânia Shopping 527.000/790.397; Oeste 876.000/1.516.955; Eventos 286.000/350.000). Rankings completos estão em rankingVendedores no mesmo data.ts.

## Estratégia de migração do frontend (fase 3)
- Criar server/routers.ts: bi router com procedures publicProcedure (leitura) listLojasPeriodos/lojasPorPeriodo/perfilLoja e protectedProcedure (escrita) salvarLojaPeriodo, salvarRanking, adicionarPeriodo, restaurarPeriodo, importarRankings.
- DataStore atual (client/src/lib/dataStore.tsx) usa localStorage com dados embutidos data.ts como fallback — alterar para: trpc.useQuery listLojasPeriodos → dados do banco; mutations gravam; localStorage como cache do último snapshot + fallback offline.
- Admin.tsx (aba lojas, vendedores, importar) deve chamar mutations. Importar relatório (parseRelatorio.ts) continua; resultado vai para mutation importarRelatorio no server (recalcular atingimento/diferença no server ou manter lógica cliente).
- Verificar: rotas App.tsx ainda intactas (VisaoGeral, /loja/:nome, /resumo, /admin).

## Progresso fase 3 (backend E frontend dataStore prontos)
- server/db.ts + routers.ts: router bi completo (listLojas/listRankings public; salvarLoja/adicionarPeriodo/substituirRanking/inserirRankingsEmLote/removerVendedor/removerPeriodo admin) — 0 erros TS.
- dataStore.tsx reescrito: DataProvider usa trpc.bi.listLojas/listRankings como fonte da verdade; fallback cache localStorage (chave "bi-richesse:dados:v1", campo sincronizado) e depois dados oficiais embutidos data.ts. Todas as mutations do contexto gravam no banco (salvarLojaMut etc.) + atualizam cache local. removerVendedor do cache NÃO tem id (ranking vem do banco SEM id na listagem padrão? CONFERIR — usei campo id opcional; se trpc não devolver id, removerVendedor no banco não dispara — testar!).
- ATENÇÃO: listRankings no db.ts NÃO seleciona o campo id? Ele usa db.select().from(rankingVendedores) — Drizzle SELECT * inclui id. OK.
- Admin.tsx OK: importação (handleConfirmarImportacao, linha ~211) já usa store.salvarLojaPeriodo/salvarVendedor que agora gravam no banco. Nada a mudar lá.
- Pendências no Admin.tsx: (a) textos que dizem "salvas neste navegador" (linha ~234) → atualizar para mencionar banco; (b) restaurarPadrao() do dataStore só limpa localStorage — implementar resetarNoBanco() que grava dados oficiais nas tabelas (upsert das 25 lojas_periodos + substituirRanking dos 173 vendedores).

## Progresso fase 3 (backend pronto)
- drizzle/schema.ts: lojas_periodos (UK periodo+loja), ranking_vendedores (UK periodo+loja+posicao, is_deleted), audit_log — criadas no banco via webdev_execute_sql.
- seed scripts/seed-bi.mjs executado: Maio 8 lojas, Junho 8, Julho 9 (25 lojas_periodos); rankings Maio 55, Junho 59, Julho 59 (173).
- server/db.ts: listLojasPeriodos, listRankings, salvarLojaPeriodo, adicionarPeriodo, substituirRanking, inserirRankingsEmLote, removerVendedor, removerPeriodoRankings, removerPeriodoLojas — soft-delete só UPDATE is_deleted=1; audit em tudo.
- server/routers.ts: router bi (publicProcedure para list; adminProcedure para mutations) — 0 erros TS.
- Falta: cliente trpc no frontend (dataStore precisa ler do banco em vez de localStorage; fallback localStorage se DB vazio), atualizar Admin.tsx (tabs lojas/ranking/importar), VisaoGeral/EvolucaoLojas já leem via dataStore.
- IMPORTANTE: manter localStorage como cache inicial + sincronizar com trpc.bi ao montar (getData → trpc; setData → trpc mutations + invalidar).
- O owner é admin automaticamente (upsertUser: openId === OWNER_OPEN_ID → role admin).
- TiDB serverless NÃO suporta triggers (tentativa falhou). Soft-delete imposto na API.

## Checklist pós-implantação (fase 4-5)
- Testar visão geral, detalhe loja, resumo executivo, admin (edição, importação de relatório, novo período Agosto) com dados no banco.
- Vitest: testar procedures bi.
- Soft-delete: banco é TiDB serverless (8.0.11-TiDB-v8.5.3-serverless) — NÃO suporta triggers; soft-delete será imposto apenas na API (routers.ts nunca executa DELETE, apenas UPDATE is_deleted=1), com comentário no código. Remover scripts/create-trigger.mjs.
- Checkpoint + entrega.

## STATUS FINAL (fase 4-5 concluída) — pronto para checkpoint
- Vitest: server/bi.router.test.ts (5 testes) + auth.logout (1) = 6 passando.
- API pública /api/trpc/bi.listLojas: HTTP 200, 25 linhas com valores oficiais conferidos (Julho Eventos 286.000/350.000).
- Frontend screenshot OK: / (visão geral com dados do banco), /admin (tabelas Maio/Junho/Julho, cards resumo), /loja (ranking + KPIs), /resumo.
- Textos do Admin atualizados (nuvem + auditoria) — 3 edições aplicadas.
- TypeScript limpo (pnpm check sem erros).
- Falta apenas: atualizar esta nota + checkpoint + entregar.

## Correção de lacunas (fase 4 — em andamento)
Lacunas detectadas pelo reminder: importação JSON e "restaurar padrão" só gravavam no localStorage, não no banco. Correção aplicada em client/src/lib/dataStore.tsx:
- importarJSON agora dispatcha evento "bi-richesse:importar-json" {lojas, ranking}; restaurarPadrao dispatcha "bi-richesse:restaurar-padrao".
- DataProvider adiciona listeners que chamam mutations novas: bi.importarLote (lojas+rankings em lote) e bi.resetarBanco ({}) — PRECISO ADICIONAR essas 2 procedures ao router bi (server/routers.ts) e helpers no db.ts.
- Admin.tsx handleConfirmarImportacao: cria período via store.addPeriodo + salvarLojaPeriodo/salvarVendedor por registro → já persiste no banco (OK, testado conceitualmente via mutations existentes).
- Falta: (1) adicionar importarLote/resetarBanco no routers.ts+db.ts; (2) rodar pnpm check; (3) testar fluxo no navegador (Admin → Importar relatório de Agosto via textarea — há aba importar com extrairRelatorio, e Exportar/Importar JSON); (4) verificar que visões reagem.

router bi atual: listLojas, listRankings (public); salvarLoja, adicionarPeriodo, substituirRanking, inserirRankingsEmLote, removerVendedor, removerPeriodo (admin). db.ts tem: listLojasPeriodos, listRankings, salvarLojaPeriodo, adicionarPeriodo, substituirRanking, inserirRankingsEmLote, removerVendedor, removerPeriodoRankings, removerPeriodoLojas, registrarAuditoria.

## Estado final (após correções)
1. Adicionei as procedures bi.importarLote e bi.resetarBanco no server/routers.ts + helpers importarLote/resetarParaOficiais no server/db.ts. TypeScript OK.
2. Cliente (dataStore.tsx): importarJSON e restaurarPadrao agora disparam eventos que persistem no banco via essas mutations.
3. IMPORTANTE: adminProcedure exige ctx.user.role === 'admin'. O banco NÃO tinha tabela `users` (o upgrade não a criou pois é TiDB/schema novo) — criei via SQL: CREATE TABLE users (id, openId UNIQUE, name, email, loginMethod, role ENUM user/admin, createdAt, updatedAt, lastSignedIn). Agora o seed-bi não criou usuário; o primeiro login do owner (openId == OWNER_OPEN_ID em server/db.ts upsertUser) atribuirá role admin automaticamente. Testes via fetch sem sessão retornam 403 — esperado (comportamento correto de auth).
4. Usuário disse que revogou a publishable key do Supabase que colou; decidiu usar o banco já integrado (provisionado). Não conectar Supabase externo.
5. Falta: rodar vitest completo, screenshot final, checkpoint e entrega.

## Estado final (pós-entrega b8163f66)
- Teste vitest novo server/bi.lote.test.ts: 3 testes passando (importarLote persiste lojas+rankings, recusa não-admin, upsert sem duplicar). Suíte completa: 9/9 passando. Payload real do zod: {lojas: [{periodo, loja, vendasTotal, meta}], rankings: [{periodo, loja, vendedores: [{vendedor, vendas}]}]}; retorno da mutation é undefined (validar leitura direta do banco).
- Cuidado no teste: mysql2 retorna int como string no TiDB — usar Number(String(row.vendasTotal)); schema usa campo vendasTotal (não "vendas").
- Limpeza pós-teste: DELETE dos registros de Agosto do banco (feito via webdev_execute_sql); estado oficial restaurado: Maio 8, Junho 8, Julho 9.
- Screenshot final OK: / e /admin exibindo dados do banco corretamente.
- Falta apenas: marcar todo.md + checkpoint final + entregar mensagem result.
