import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

function connectionOptions(value) {
  if (!value) throw new Error("DATABASE_URL não configurada.");
  const url = new URL(value);
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    ssl: url.hostname.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
  };
}

async function loadOfficialData() {
  const file = await readFile(new URL("../client/src/lib/data.ts", import.meta.url), "utf8");
  const storesBlock = file.match(/export const lojasPeriodos: LojaPeriodo\[\] = \[([\s\S]*?)\n\];/);
  const rankingsBlock = file.match(/export const rankingVendedores: RankingVendedor\[\] = \[([\s\S]*?)\n\];/);
  if (!storesBlock || !rankingsBlock) throw new Error("Fonte oficial de dados não localizada.");

  const stores = [];
  const storePattern = /\{\s*periodo:\s*"([^"]+)",\s*loja:\s*"([^"]+)",\s*vendas_total:\s*(\d+),\s*meta:\s*(\d+)/g;
  for (const match of storesBlock[1].matchAll(storePattern)) {
    stores.push({ periodo: match[1], loja: match[2], vendas: Number(match[3]), meta: Number(match[4]) });
  }

  const rankings = [];
  const rankingPattern = /\{\s*periodo:\s*"([^"]+)",\s*loja:\s*"([^"]+)",\s*posicao:\s*(\d+),\s*vendedor:\s*"([^"]+)",\s*vendas:\s*(\d+)\s*\}/g;
  for (const match of rankingsBlock[1].matchAll(rankingPattern)) {
    rankings.push({ periodo: match[1], loja: match[2], posicao: Number(match[3]), vendedor: match[4], vendas: Number(match[5]) });
  }
  if (stores.length !== 25 || rankings.length !== 173) {
    throw new Error(`Fonte oficial incompleta: ${stores.length} lojas e ${rankings.length} rankings.`);
  }
  return { stores, rankings };
}

const data = await loadOfficialData();
const connection = await mysql.createConnection(connectionOptions(process.env.DATABASE_URL));

try {
  await connection.beginTransaction();
  await connection.query("DELETE FROM ranking_vendedores");
  await connection.query("DELETE FROM lojas_periodos");

  for (const store of data.stores) {
    await connection.execute(
      "INSERT INTO lojas_periodos (periodo, loja, vendas_total, meta) VALUES (?, ?, ?, ?)",
      [store.periodo, store.loja, store.vendas, store.meta],
    );
  }
  for (const ranking of data.rankings) {
    await connection.execute(
      "INSERT INTO ranking_vendedores (periodo, loja, posicao, vendedor, vendas, is_deleted) VALUES (?, ?, ?, ?, ?, 0)",
      [ranking.periodo, ranking.loja, ranking.posicao, ranking.vendedor, ranking.vendas],
    );
  }
  await connection.commit();
  console.log(JSON.stringify({ restored: true, stores: data.stores.length, rankings: data.rankings.length }));
} catch (error) {
  await connection.rollback().catch(() => undefined);
  throw error;
} finally {
  await connection.end();
}
