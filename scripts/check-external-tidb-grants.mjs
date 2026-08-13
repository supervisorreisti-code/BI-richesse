import mysql from "mysql2/promise";

const value = process.env.EXTERNAL_DATABASE_URL;
if (!value) throw new Error("EXTERNAL_DATABASE_URL não configurada.");
const url = new URL(value);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || 4000),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.replace(/^\//, "") || "sys"),
  ssl: { rejectUnauthorized: true },
});

try {
  const [grants] = await connection.query("SHOW GRANTS");
  const [databases] = await connection.query("SHOW DATABASES");
  console.log(JSON.stringify({ grants, databases }, null, 2));
} finally {
  await connection.end();
}
