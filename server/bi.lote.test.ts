import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { lojasPeriodos, rankingVendedores } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 0,
    openId: "owner-test",
    email: "owner@example.com",
    name: "Owner",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

const LOJA_TESTE = "Richesse Flamboyant";

const payloadTeste = {
  lojas: [
    {
      periodo: "Agosto",
      loja: LOJA_TESTE,
      vendasTotal: 800000,
      meta: 1000000,
    },
  ],
  rankings: [
    {
      periodo: "Agosto",
      loja: LOJA_TESTE,
      vendedores: [
        { vendedor: "Luciana", vendas: 114000 },
        { vendedor: "Cintia", vendas: 92000 },
      ],
    },
  ],
};

let periodoCriado = false;

beforeAll(async () => {
  // Garantir estado limpo: remover qualquer linha de Agosto deixada por teste anterior
  const db = await getDb();
  if (db) {
    await db.delete(rankingVendedores).where(eq(rankingVendedores.periodo, "Agosto"));
    await db.delete(lojasPeriodos).where(eq(lojasPeriodos.periodo, "Agosto"));
  }
});

afterAll(async () => {
  const db = await getDb();
  if (db && periodoCriado) {
    await db.delete(rankingVendedores).where(eq(rankingVendedores.periodo, "Agosto"));
    await db.delete(lojasPeriodos).where(eq(lojasPeriodos.periodo, "Agosto"));
  }
});

describe("bi.importarLote e bi.resetarBanco", () => {
  it("importa um lote e persiste lojas + rankings no banco", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const resultado = await caller.bi.importarLote(payloadTeste);
    expect(resultado).toBeUndefined();
    periodoCriado = true;

    const db = await getDb();
    if (!db) throw new Error("DB indisponível");
    const lojas = await db
      .select()
      .from(lojasPeriodos)
      .where(eq(lojasPeriodos.periodo, "Agosto"))
      .limit(10);
    expect(lojas.length).toBe(1);
    expect(lojas[0]?.loja).toBe(LOJA_TESTE);
    expect(Number(String(lojas[0]?.vendasTotal))).toBe(800000);
    expect(Number(String(lojas[0]?.meta))).toBe(1000000);

    const rankings = await db
      .select()
      .from(rankingVendedores)
      .where(eq(rankingVendedores.periodo, "Agosto"))
      .limit(10);
    expect(rankings.length).toBe(2);
  });

  it("recusa lotes de usuários não admin", async () => {
    const user: AuthenticatedUser = {
      id: 1,
      openId: "user-test",
      email: "user@example.com",
      name: "User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller({
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
    });
    await expect(caller.bi.importarLote(payloadTeste)).rejects.toThrow();
  });

  it("atualiza loja existente em vez de duplicar", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const resultado = await caller.bi.importarLote({
      lojas: [
        {
          periodo: "Agosto",
          loja: LOJA_TESTE,
          vendasTotal: 850000,
          meta: 1000000,
        },
      ],
      rankings: [
        {
          periodo: "Agosto",
          loja: LOJA_TESTE,
          vendedores: [
            { vendedor: "Luciana", vendas: 120000 },
            { vendedor: "Steffany", vendas: 80000 },
          ],
        },
      ],
    });
    expect(resultado).toBeUndefined();
    const db = await getDb();
    if (!db) throw new Error("DB indisponível");
    const lojas = await db
      .select()
      .from(lojasPeriodos)
      .where(eq(lojasPeriodos.periodo, "Agosto"))
      .limit(10);
    expect(lojas.length).toBe(1);
    expect(Number(String(lojas[0]?.vendasTotal))).toBe(850000);
  });
});
