import mysql from "mysql2/promise";

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
    multipleStatements: true,
  };
}

const targetDatabase = "richesse_bi";

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS audit_log (
    id int AUTO_INCREMENT NOT NULL,
    usuario varchar(255), tabela varchar(64) NOT NULL, registro varchar(255), campo varchar(64),
    valor_antigo text, valor_novo text, criado_em timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  )`,
  `CREATE TABLE IF NOT EXISTS lojas_periodos (
    id int AUTO_INCREMENT NOT NULL,
    periodo varchar(32) NOT NULL, loja varchar(128) NOT NULL, vendas_total int NOT NULL, meta int NOT NULL,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  )`,
  `CREATE TABLE IF NOT EXISTS ranking_vendedores (
    id int AUTO_INCREMENT NOT NULL,
    periodo varchar(32) NOT NULL, loja varchar(128) NOT NULL, posicao int NOT NULL,
    vendedor varchar(128) NOT NULL, vendas int NOT NULL, is_deleted int NOT NULL DEFAULT 0,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id int AUTO_INCREMENT NOT NULL,
    openId varchar(64) NOT NULL, name text, email varchar(320), loginMethod varchar(64),
    role enum('user','admin') NOT NULL DEFAULT 'user', createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lastSignedIn timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id), UNIQUE KEY users_openId_unique (openId)
  )`,
  `CREATE TABLE IF NOT EXISTS backup_snapshots (
    id int AUTO_INCREMENT NOT NULL, criado_em timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, usuario varchar(255),
    tipo varchar(32) NOT NULL DEFAULT 'manual', storage_key varchar(255) NOT NULL, descricao varchar(255),
    registros_lojas int NOT NULL DEFAULT 0, registros_ranking int NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
  )`,
];

const tables = [
  { name: "lojas_periodos", columns: ["id", "periodo", "loja", "vendas_total", "meta", "updated_at"] },
  { name: "ranking_vendedores", columns: ["id", "periodo", "loja", "posicao", "vendedor", "vendas", "is_deleted", "updated_at"] },
  { name: "users", columns: ["id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn"] },
  { name: "audit_log", columns: ["id", "usuario", "tabela", "registro", "campo", "valor_antigo", "valor_novo", "criado_em"] },
  { name: "backup_snapshots", columns: ["id", "criado_em", "usuario", "tipo", "storage_key", "descricao", "registros_lojas", "registros_ranking"] },
];

let source;
let target;

try {
  source = await mysql.createConnection(connectionOptions(process.env.DATABASE_URL));
  target = await mysql.createConnection(connectionOptions(process.env.EXTERNAL_DATABASE_URL));
  await target.query(`CREATE DATABASE IF NOT EXISTS ${targetDatabase}`);
  await target.query(`USE ${targetDatabase}`);

  for (const statement of schemaStatements) await target.execute(statement);

  const [[targetCount]] = await target.query("SELECT (SELECT COUNT(*) FROM lojas_periodos) + (SELECT COUNT(*) FROM ranking_vendedores) AS total");
  if (Number(targetCount.total) > 0) {
    throw new Error("Migração interrompida: o banco externo já contém dados do BI. Nenhum registro foi alterado.");
  }

  const staged = [];
  for (const table of tables) {
    const columns = table.columns.join(", ");
    const [rows] = await source.query(`SELECT ${columns} FROM ${table.name} ORDER BY id ASC`);
    staged.push({ ...table, rows });
  }

  await target.beginTransaction();
  for (const table of staged) {
    if (table.rows.length === 0) continue;
    const placeholders = table.columns.map(() => "?").join(", ");
    const sql = `INSERT INTO ${table.name} (${table.columns.join(", ")}) VALUES (${placeholders})`;
    for (const row of table.rows) {
      await target.execute(sql, table.columns.map((column) => row[column]));
    }
  }
  await target.commit();

  const summary = {};
  for (const table of tables) {
    const [[row]] = await target.query(`SELECT COUNT(*) AS total FROM ${table.name}`);
    summary[table.name] = Number(row.total);
  }
  console.log(JSON.stringify({ migration: "ok", summary }, null, 2));
} catch (error) {
  await target?.rollback().catch(() => undefined);
  throw error;
} finally {
  await source?.end();
  await target?.end();
}
