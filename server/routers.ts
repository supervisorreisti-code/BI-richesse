import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { authenticateExternalLogin, isExternalAuthEnabled, issueExternalSession } from "./_core/externalAuth";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    loginExternal: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1).max(256) }))
      .mutation(async ({ input, ctx }) => {
        if (!isExternalAuthEnabled()) throw new Error("Login externo não está habilitado neste ambiente.");
        const user = await authenticateExternalLogin(input.email, input.password);
        if (!user) throw new Error("Credenciais inválidas.");
        await issueExternalSession(ctx.req, ctx.res, user);
        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // --- BI Richesse (persistência em banco) ---
  bi: router({
    listLojas: publicProcedure.query(() => db.listLojasPeriodos()),
    listRankings: publicProcedure.query(() => db.listRankings()),
    salvarLoja: adminProcedure
      .input(
        z.object({
          periodo: z.string().max(32),
          loja: z.string().max(128),
          vendasTotal: z.number(),
          meta: z.number(),
        })
      )
      .mutation(({ input, ctx }) =>
        db.salvarLojaPeriodo(input.periodo, input.loja, input.vendasTotal, input.meta, ctx.user?.name ?? undefined)
      ),
    adicionarPeriodo: adminProcedure
      .input(z.object({ periodo: z.string().max(32) }))
      .mutation(({ input, ctx }) => db.adicionarPeriodo(input.periodo, ctx.user?.name ?? undefined)),
    substituirRanking: adminProcedure
      .input(
        z.object({
          periodo: z.string().max(32),
          loja: z.string().max(128),
          vendedores: z.array(z.object({ vendedor: z.string().max(128), vendas: z.number() })),
        })
      )
      .mutation(({ input, ctx }) =>
        db.substituirRanking(input.periodo, input.loja, input.vendedores, ctx.user?.name ?? undefined)
      ),
    inserirRankingsEmLote: adminProcedure
      .input(
        z.object({
          entradas: z.array(
            z.object({
              periodo: z.string().max(32),
              loja: z.string().max(128),
              vendedores: z.array(z.object({ vendedor: z.string().max(128), vendas: z.number() })),
            })
          ),
        })
      )
      .mutation(({ input, ctx }) => db.inserirRankingsEmLote(input.entradas, ctx.user?.name ?? undefined)),
    removerVendedor: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input, ctx }) => db.removerVendedor(input.id, ctx.user?.name ?? undefined)),
    removerPeriodo: adminProcedure
      .input(z.object({ periodo: z.string().max(32) }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user?.name ?? undefined;
        await db.removerPeriodoRankings(input.periodo, user);
        await db.removerPeriodoLojas(input.periodo, user);
      }),
    importarLote: adminProcedure
      .input(
        z.object({
          lojas: z.array(
            z.object({
              periodo: z.string().max(32),
              loja: z.string().max(128),
              vendasTotal: z.number(),
              meta: z.number(),
            })
          ),
          rankings: z.array(
            z.object({
              periodo: z.string().max(32),
              loja: z.string().max(128),
              vendedores: z.array(z.object({ vendedor: z.string().max(128), vendas: z.number() })),
            })
          ),
        })
      )
      .mutation(({ input, ctx }) =>
        db.importarLote(input.lojas, input.rankings, ctx.user?.name ?? undefined)
      ),
    listarAuditoria: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(500).default(200) }).optional())
      .query(({ input }) => db.listarAuditoria(input?.limit ?? 200)),
    criarBackup: adminProcedure.mutation(async ({ ctx }) => {
      const user = ctx.user?.name ?? undefined;
      const snapshot = await db.snapshotCompleto();
      const { storagePut } = await import("./storage");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const payload = JSON.stringify(snapshot);
      const res = await storagePut(`backups/bi-richesse-${stamp}.json`, payload, "application/json; charset=utf-8");
      await db.insereBackup({
        storageKey: res.key,
        usuario: user ?? null,
        tipo: "manual",
        descricao: `Backup automático — ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
        registrosLojas: snapshot.lojas.length,
        registrosRanking: snapshot.rankings.length,
      });
      return { ok: true, storageKey: res.key, url: res.url, registrosLojas: snapshot.lojas.length, registrosRanking: snapshot.rankings.length };
    }),
    listarBackups: adminProcedure.query(() => db.listarBackups()),
    resetarBanco: adminProcedure
      .input(z.object({}).optional())
      .mutation(async ({ ctx }) => {
        const user = ctx.user?.name ?? undefined;
        await db.resetarParaOficiais(user);
        // Reenvia os dados oficiais embutidos para o banco após a limpeza.
        const { lojasPeriodos: OFICIAIS_LOJAS, rankingVendedores: OFICIAIS_RANKING } = await import("../client/src/lib/data");
        await db.importarLote(
          OFICIAIS_LOJAS.map((l) => ({ periodo: l.periodo, loja: l.loja, vendasTotal: l.vendas_total, meta: l.meta })),
          OFICIAIS_RANKING.map((r) => ({
            periodo: r.periodo,
            loja: r.loja,
            vendedores: OFICIAIS_RANKING
              .filter((x) => x.loja === r.loja && x.periodo === r.periodo)
              .map((v) => ({ vendedor: v.vendedor, vendas: v.vendas })),
          })),
          user,
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
