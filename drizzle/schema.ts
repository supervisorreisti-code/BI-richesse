import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// --- BI Richesse: vendas por loja e período ---

export const lojasPeriodos = mysqlTable("lojas_periodos", {
  id: int("id").autoincrement().primaryKey(),
  periodo: varchar("periodo", { length: 32 }).notNull(),
  loja: varchar("loja", { length: 128 }).notNull(),
  vendasTotal: int("vendas_total").notNull(),
  meta: int("meta").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type LojaPeriodo = typeof lojasPeriodos.$inferSelect;
export type InsertLojaPeriodo = typeof lojasPeriodos.$inferInsert;

export const rankingVendedores = mysqlTable("ranking_vendedores", {
  id: int("id").autoincrement().primaryKey(),
  periodo: varchar("periodo", { length: 32 }).notNull(),
  loja: varchar("loja", { length: 128 }).notNull(),
  posicao: int("posicao").notNull(),
  vendedor: varchar("vendedor", { length: 128 }).notNull(),
  vendas: int("vendas").notNull(),
  isDeleted: int("is_deleted").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type RankingVendedor = typeof rankingVendedores.$inferSelect;
export type InsertRankingVendedor = typeof rankingVendedores.$inferInsert;

export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  usuario: varchar("usuario", { length: 255 }),
  tabela: varchar("tabela", { length: 64 }).notNull(),
  registro: varchar("registro", { length: 255 }),
  campo: varchar("campo", { length: 64 }),
  valorAntigo: text("valor_antigo"),
  valorNovo: text("valor_novo"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export type AuditEntry = typeof auditLog.$inferSelect;
export type InsertAuditEntry = typeof auditLog.$inferInsert;