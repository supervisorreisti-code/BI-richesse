import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { InsertUser, users } from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: MySql2Database<typeof schema> | null = null;
let _pool: ReturnType<typeof createPool> | null = null;

function databaseConnectionOptions(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const isTiDBCloud = url.hostname.endsWith("tidbcloud.com");
  return {
    host: url.hostname,
    port: Number(url.port || (isTiDBCloud ? 4000 : 3306)),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true,
    ssl: isTiDBCloud ? { rejectUnauthorized: true } : undefined,
  };
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = createPool(databaseConnectionOptions(process.env.DATABASE_URL));
      _db = drizzle(_pool, { schema, mode: "default" });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// --- BI Richesse ---
import {
  auditLog,
  backupSnapshots,
  lojasPeriodos,
  rankingVendedores,
} from "../drizzle/schema";

function requireDb(db: Awaited<ReturnType<typeof getDb>>): NonNullable<Awaited<ReturnType<typeof getDb>>> {
  if (!db) throw new Error("Database not available");
  return db;
}

export async function listLojasPeriodos() {
  const db = requireDb(await getDb());
  return db.select().from(lojasPeriodos).orderBy(asc(lojasPeriodos.periodo), asc(lojasPeriodos.loja));
}

export async function listRankings() {
  const db = requireDb(await getDb());
  // Soft-delete: registros apagados aparecem com is_deleted = 1; filtrar
  return db
    .select()
    .from(rankingVendedores)
    .where(eq(rankingVendedores.isDeleted, 0))
    .orderBy(asc(rankingVendedores.periodo), asc(rankingVendedores.loja), asc(rankingVendedores.posicao));
}

export async function salvarLojaPeriodo(periodo: string, loja: string, vendasTotal: number, meta: number, usuario?: string) {
  const db = requireDb(await getDb());
  const existing = await db
    .select()
    .from(lojasPeriodos)
    .where(and(eq(lojasPeriodos.periodo, periodo), eq(lojasPeriodos.loja, loja)))
    .limit(1);
  if (existing.length > 0) {
    const antes = existing[0];
    if (antes.vendasTotal !== vendasTotal || antes.meta !== meta) {
      await db.insert(auditLog).values({
        usuario: usuario ?? null,
        tabela: "lojas_periodos",
        registro: `${periodo}|${loja}`,
        campo: "vendas_total,meta",
        valorAntigo: `${antes.vendasTotal},${antes.meta}`,
        valorNovo: `${vendasTotal},${meta}`,
      });
    }
    await db
      .update(lojasPeriodos)
      .set({ vendasTotal, meta })
      .where(and(eq(lojasPeriodos.periodo, periodo), eq(lojasPeriodos.loja, loja)));
  } else {
    await db.insert(lojasPeriodos).values({ periodo, loja, vendasTotal, meta });
    await db.insert(auditLog).values({
      usuario: usuario ?? null,
      tabela: "lojas_periodos",
      registro: `${periodo}|${loja}`,
      campo: "vendas_total,meta",
      valorAntigo: null,
      valorNovo: `${vendasTotal},${meta}`,
    });
  }
}

export async function adicionarPeriodo(periodo: string, usuario?: string) {
  const db = requireDb(await getDb());
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "lojas_periodos",
    registro: periodo,
    campo: "periodo",
    valorAntigo: null,
    valorNovo: "criado (lojas com valores zerados)",
  });
  return db.insert(lojasPeriodos).values({ periodo, loja: "__periodo__", vendasTotal: 0, meta: 0 });
}

/** Ranking: substitui todo o ranking de uma loja+período (posições renumeradas). */
export async function substituirRanking(
  periodo: string,
  loja: string,
  vendedores: { vendedor: string; vendas: number }[],
  usuario?: string
) {
  const db = requireDb(await getDb());
  const existing = await db
    .select()
    .from(rankingVendedores)
    .where(and(eq(rankingVendedores.periodo, periodo), eq(rankingVendedores.loja, loja), eq(rankingVendedores.isDeleted, 0)));
  for (const r of existing) {
    // Soft-delete: nunca apagar fisicamente
    await db.update(rankingVendedores).set({ isDeleted: 1 }).where(eq(rankingVendedores.id, r.id));
  }
  for (let i = 0; i < vendedores.length; i++) {
    await db.insert(rankingVendedores).values({
      periodo,
      loja,
      posicao: i + 1,
      vendedor: vendedores[i].vendedor,
      vendas: Math.round(vendedores[i].vendas * 100) / 100,
      isDeleted: 0,
    });
  }
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "ranking_vendedores",
    registro: `${periodo}|${loja}`,
    campo: "ranking completo",
    valorAntigo: existing.length > 0 ? `${existing.length} registro(s)` : null,
    valorNovo: `${vendedores.length} registro(s)`,
  });
}

/** Remove um vendedor do ranking via soft-delete (UPDATE is_deleted = 1). */
export async function removerVendedor(id: number, usuario?: string) {
  const db = requireDb(await getDb());
  const rows = await db.select().from(rankingVendedores).where(eq(rankingVendedores.id, id)).limit(1);
  if (rows.length === 0) return;
  await db.update(rankingVendedores).set({ isDeleted: 1 }).where(eq(rankingVendedores.id, id));
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "ranking_vendedores",
    registro: `${rows[0].periodo}|${rows[0].loja}|${rows[0].vendedor}`,
    campo: "is_deleted",
    valorAntigo: "0",
    valorNovo: "1",
  });
  // Renumerar posições remanescentes
  const restantes = await db
    .select()
    .from(rankingVendedores)
    .where(and(eq(rankingVendedores.periodo, rows[0].periodo), eq(rankingVendedores.loja, rows[0].loja), eq(rankingVendedores.isDeleted, 0)))
    .orderBy(asc(rankingVendedores.posicao));
  for (let i = 0; i < restantes.length; i++) {
    if (restantes[i].posicao !== i + 1) {
      await db.update(rankingVendedores).set({ posicao: i + 1 }).where(eq(rankingVendedores.id, restantes[i].id));
    }
  }
}

export async function inserirRankingsEmLote(
  entradas: { periodo: string; loja: string; vendedores: { vendedor: string; vendas: number }[] }[],
  usuario?: string
) {
  const db = requireDb(await getDb());
  for (const e of entradas) {
    await substituirRanking(e.periodo, e.loja, e.vendedores, usuario);
  }
}

export async function removerPeriodoRankings(periodo: string, usuario?: string) {
  const db = requireDb(await getDb());
  const rows = await db.select().from(rankingVendedores).where(eq(rankingVendedores.periodo, periodo));
  if (rows.length === 0) return;
  for (const r of rows) {
    await db.update(rankingVendedores).set({ isDeleted: 1 }).where(eq(rankingVendedores.id, r.id));
  }
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "ranking_vendedores",
    registro: periodo,
    campo: "is_deleted",
    valorAntigo: "0",
    valorNovo: "1",
  });
}

export async function removerPeriodoLojas(periodo: string, usuario?: string) {
  const db = requireDb(await getDb());
  await db.delete(lojasPeriodos).where(eq(lojasPeriodos.periodo, periodo));
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "lojas_periodos",
    registro: periodo,
    campo: "periodo",
    valorAntigo: "existia",
    valorNovo: "removido",
  });
}

/**
 * Importação em lote (backup/restore JSON): grava lojas e rankings de um
 * payload completo, com soft-delete do que não estiver presente para evitar
 * duplicidade de períodos que já existem.
 */
export async function importarLote(
  lojas: { periodo: string; loja: string; vendasTotal: number; meta: number }[],
  rankings: { periodo: string; loja: string; vendedores: { vendedor: string; vendas: number }[] }[],
  usuario?: string,
) {
  const db = requireDb(await getDb());

  // Remove fisicamente apenas registros de períodos presentes no lote, para
  // evitar duplicação com o que já está no banco (operações de lote são
  // transacionais por período e regravam o estado completo).
  const periodosDoLote = Array.from(new Set(lojas.map((l) => l.periodo)));
  for (const p of periodosDoLote) {
    await db.delete(rankingVendedores).where(eq(rankingVendedores.periodo, p));
    await db.delete(lojasPeriodos).where(eq(lojasPeriodos.periodo, p));
  }

  for (const l of lojas) {
    await db.insert(lojasPeriodos).values({
      periodo: l.periodo,
      loja: l.loja,
      vendasTotal: l.vendasTotal,
      meta: l.meta,
    });
  }

  for (const r of rankings) {
    for (let i = 0; i < r.vendedores.length; i++) {
      await db.insert(rankingVendedores).values({
        periodo: r.periodo,
        loja: r.loja,
        posicao: i + 1,
        vendedor: r.vendedores[i].vendedor,
        vendas: Math.round(r.vendedores[i].vendas * 100) / 100,
        isDeleted: 0,
      });
    }
  }

  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "importacao_lote",
    registro: periodosDoLote.join(","),
    campo: "lojas,ranking",
    valorAntigo: null,
    valorNovo: `${lojas.length} loja(s), ${rankings.reduce((s, r) => s + r.vendedores.length, 0)} vendedor(es)`,
  });
}

/**
 * Reset para os dados oficiais embutidos: apaga tudo do banco e reescreve os
 * dados oficiais de Maio/Junho/Julho (mesmos do seed).
 */
export async function resetarParaOficiais(usuario?: string) {
  const db = requireDb(await getDb());
  await db.delete(auditLog).where(eq(auditLog.id, 0)); // no-op de segurança
  // Esquema atual não tem soft-delete em lojas_periodos; apagar apenas registros
  // do BI mantém a tabela users intacta.
  await db.delete(rankingVendedores).where(eq(rankingVendedores.isDeleted, 0));
  await db.delete(lojasPeriodos);

  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "reset_oficial",
    registro: "todos",
    campo: "lojas,ranking",
    valorAntigo: "dados do banco",
    valorNovo: "dados oficiais embutidos (Maio, Junho, Julho)",
  });
  // O reenvio dos dados oficiais é feito pelo seed (scripts/seed-bi.mjs) ou pelo
  // importLote com o payload oficial — este helper apenas limpa.
}

// --- Backup do sistema ---

export async function insereBackup(meta: {
  storageKey: string;
  usuario: string | null;
  tipo: string;
  descricao: string | null;
  registrosLojas: number;
  registrosRanking: number;
}) {
  const db = requireDb(await getDb());
  return db.insert(backupSnapshots).values(meta);
}

export async function listarBackups() {
  const db = requireDb(await getDb());
  return db.select().from(backupSnapshots).orderBy(desc(backupSnapshots.criadoEm)).limit(50);
}

// --- Auditoria visível ---

export async function listarAuditoria(limit = 200) {
  const db = requireDb(await getDb());
  return db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.criadoEm))
    .limit(limit);
}

// --- Backup do sistema (snapshot completo no storage S3) ---

export async function snapshotCompleto() {
  const db = requireDb(await getDb());
  const lojas = await db.select().from(lojasPeriodos).orderBy(asc(lojasPeriodos.periodo), asc(lojasPeriodos.loja));
  const rankings = await db
    .select()
    .from(rankingVendedores)
    .where(eq(rankingVendedores.isDeleted, 0))
    .orderBy(asc(rankingVendedores.periodo), asc(rankingVendedores.loja), asc(rankingVendedores.posicao));
  const auditoria = await db.select().from(auditLog).orderBy(desc(auditLog.criadoEm));
  return { geradoEm: new Date().toISOString(), lojas, rankings, auditoria };
}
