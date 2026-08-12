import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock do módulo db.ts para não tocar o banco real nos testes
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    listLojasPeriodos: vi.fn().mockResolvedValue([
      {
        periodo: "Maio",
        loja: "Richesse Oeste",
        vendasTotal: 937000,
        meta: 1359149,
        isDeleted: 0,
        atualizadoPor: null,
        atualizadoEm: new Date(),
        id: 1,
      },
    ]),
    listRankings: vi.fn().mockResolvedValue([
      {
        id: 1,
        periodo: "Maio",
        loja: "Richesse Oeste",
        posicao: 1,
        vendedor: "Natia Cristina Saldanha",
        vendas: 108000,
        isDeleted: 0,
      },
    ]),
    salvarLojaPeriodo: vi.fn().mockResolvedValue(undefined),
    substituirRanking: vi.fn().mockResolvedValue(undefined),
    inserirRankingsEmLote: vi.fn().mockResolvedValue(undefined),
    removerVendedor: vi.fn().mockResolvedValue(undefined),
    removerPeriodoRankings: vi.fn().mockResolvedValue(undefined),
  };
});

const adminUser = {
  id: 1,
  openId: "test-owner",
  email: "owner@example.com",
  name: "Owner",
  loginMethod: "manus",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const anonCtx: TrpcContext = { user: null } as TrpcContext;
const adminCtx: TrpcContext = { user: adminUser } as TrpcContext;

describe("router bi", () => {
  it("listLojas é público e retorna os registros", async () => {
    const caller = appRouter.createCaller(anonCtx);
    const lojas = await caller.bi.listLojas();
    expect(lojas).toHaveLength(1);
    // As colunas do banco usam camelCase no schema drizzle (vendasTotal)
    const row = lojas[0] as Record<string, unknown>;
    expect(row.vendasTotal).toBe(937000);
    expect(row.periodo).toBe("Maio");
  });

  it("listRankings é público e retorna os registros com id", async () => {
    const caller = appRouter.createCaller(anonCtx);
    const ranking = await caller.bi.listRankings();
    expect(ranking).toHaveLength(1);
    expect(ranking[0]?.vendedor).toBe("Natia Cristina Saldanha");
    expect(typeof ranking[0]?.id).toBe("number");
  });

  it("salvarLoja rejeita usuário não autenticado", async () => {
    const caller = appRouter.createCaller(anonCtx);
    await expect(
      caller.bi.salvarLoja({
        periodo: "Maio",
        loja: "Richesse Oeste",
        vendasTotal: 937000,
        meta: 1359149,
      })
    ).rejects.toThrow();
  });

  it("salvarLoja aceita administrador", async () => {
    const caller = appRouter.createCaller(adminCtx);
    const result = await caller.bi.salvarLoja({
      periodo: "Maio",
      loja: "Richesse Oeste",
      vendasTotal: 937000,
      meta: 1359149,
    });
    expect(result).toBeUndefined();
    const { salvarLojaPeriodo } = await import("./db");
    expect(salvarLojaPeriodo).toHaveBeenCalledWith(
      "Maio",
      "Richesse Oeste",
      937000,
      1359149,
      "Owner"
    );
  });

  it("inserirRankingsEmLote aceita administrador", async () => {
    const caller = appRouter.createCaller(adminCtx);
    const result = await caller.bi.inserirRankingsEmLote({
      entradas: [
        {
          periodo: "Maio",
          loja: "Richesse Oeste",
          vendedores: [
            { vendedor: "Natia Cristina Saldanha", vendas: 108000 },
          ],
        },
      ],
    });
    expect(result).toBeUndefined();
    const { inserirRankingsEmLote } = await import("./db");
    expect(inserirRankingsEmLote).toHaveBeenCalled();
  });
});
