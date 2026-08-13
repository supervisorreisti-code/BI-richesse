import mysql from "mysql2/promise";

function connectionOptions(value) {
  if (!value) throw new Error("EXTERNAL_DATABASE_URL não configurada.");
  const url = new URL(value);
  return {
    host: url.hostname,
    port: Number(url.port || 4000),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "") || "sys"),
    ssl: { rejectUnauthorized: true },
  };
}

const connection = await mysql.createConnection(connectionOptions(process.env.EXTERNAL_DATABASE_URL));
try {
  await connection.query("USE richesse_bi");
  const [rows] = await connection.query(`
    SELECT
      (SELECT COUNT(*) FROM lojas_periodos) AS lojas_periodos,
      (SELECT COUNT(*) FROM ranking_vendedores) AS ranking_vendedores,
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM audit_log) AS audit_log,
      (SELECT COUNT(*) FROM backup_snapshots) AS backup_snapshots
  `);
  console.log(JSON.stringify(rows[0], null, 2));
} finally {
  await connection.end();
}
