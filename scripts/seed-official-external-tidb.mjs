import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const targetDatabase = "richesse_bi";
const officialPeriods = ["Maio", "Junho", "Julho"];

function connectionOptions(value) {
  if (!value) throw new Error("Variável de conexão ausente.");
  const url = new URL(value);
  return {
    host: url.hostname,
    port: Number(url.port || 4000),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "") || "sys"),
    ssl: url.hostname.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
  };
}

async function loadOfficialRankings() {
  const file = await readFile(new URL("../client/src/lib/data.ts", import.meta.url), "utf8");
  const block = file.match(/export const rankingVendedores: RankingVendedor\[\] = \[([\s\S]*?)\n\];/);
  if (!block) throw new Error("Não foi possível localizar o ranking oficial no arquivo de dados.");

  const rankings = [];
  const pattern = /\{\s*periodo:\s*"([^"]+)",\s*loja:\s*"([^"]+)",\s*posicao:\s*(\d+),\s*vendedor:\s*"([^"]+)",\s*vendas:\s*(\d+)\s*\}/g;
  for (const match of block[1].matchAll(pattern)) {
    rankings.push({
      periodo: match[1], loja: match[2], posicao: Number(match[3]), vendedor: match[4], vendas: Number(match[5]),
    });
  }
  if (rankings.length < 150) throw new Error(`Ranking oficial incompleto: ${rankings.length} registros identificados.`);
  return rankings;
}

const source = await mysql.createConnection(connectionOptions(process.env.DATABASE_URL));
const target = await mysql.createConnection(connectionOptions(process.env.EXTERNAL_DATABASE_URL));

try {
  await target.query(`USE ${targetDatabase}`);
  const [lojas] = await source.query(
    "SELECT periodo, loja, vendas_total, meta, updated_at FROM lojas_periodos WHERE periodo IN (?, ?, ?) ORDER BY id ASC",
    officialPeriods,
  );
  if (lojas.length !== 25) throw new Error(`Esperava 25 registros oficiais de lojas; encontrei ${lojas.length}.`);
  const rankings = await loadOfficialRankings();
  const [users] = await source.query("SELECT id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn FROM users ORDER BY id ASC");
  const [audit] = await source.query("SELECT id, usuario, tabela, registro, campo, valor_antigo, valor_novo, criado_em FROM audit_log ORDER BY id ASC");
  const [snapshots] = await source.query("SELECT id, criado_em, usuario, tipo, storage_key, descricao, registros_lojas, registros_ranking FROM backup_snapshots ORDER BY id ASC");

  await target.beginTransaction();
  for (const table of ["backup_snapshots", "audit_log", "ranking_vendedores", "lojas_periodos", "users"]) {
    await target.query(`DELETE FROM ${table}`);
  }

  for (const row of lojas) {
    await target.execute(
      "INSERT INTO lojas_periodos (periodo, loja, vendas_total, meta, updated_at) VALUES (?, ?, ?, ?, ?)",
      [row.periodo, row.loja, row.vendas_total, row.meta, row.updated_at],
    );
  }
  for (const row of rankings) {
    await target.execute(
      "INSERT INTO ranking_vendedores (periodo, loja, posicao, vendedor, vendas, is_deleted) VALUES (?, ?, ?, ?, ?, 0)",
      [row.periodo, row.loja, row.posicao, row.vendedor, row.vendas],
    );
  }
  for (const row of users) {
    await target.execute(
      "INSERT INTO users (id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [row.id, row.openId, row.name, row.email, row.loginMethod, row.role, row.createdAt, row.updatedAt, row.lastSignedIn],
    );
  }
  for (const row of audit) {
    await target.execute(
      "INSERT INTO audit_log (id, usuario, tabela, registro, campo, valor_antigo, valor_novo, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [row.id, row.usuario, row.tabela, row.registro, row.campo, row.valor_antigo, row.valor_novo, row.criado_em],
    );
  }
  for (const row of snapshots) {
    await target.execute(
      "INSERT INTO backup_snapshots (id, criado_em, usuario, tipo, storage_key, descricao, registros_lojas, registros_ranking) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [row.id, row.criado_em, row.usuario, row.tipo, row.storage_key, row.descricao, row.registros_lojas, row.registros_ranking],
    );
  }
  await target.commit();

  const [[counts]] = await target.query(`
    SELECT
      (SELECT COUNT(*) FROM lojas_periodos) AS lojas_periodos,
      (SELECT COUNT(*) FROM ranking_vendedores) AS ranking_vendedores,
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM audit_log) AS audit_log,
      (SELECT COUNT(*) FROM backup_snapshots) AS backup_snapshots
  `);
  console.log(JSON.stringify({ seed: "ok", officialPeriods, counts }, null, 2));
} catch (error) {
  await target.rollback().catch(() => undefined);
  throw error;
} finally {
  await source.end();
  await target.end();
}
