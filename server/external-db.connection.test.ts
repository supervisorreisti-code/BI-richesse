import mysql from "mysql2/promise";
import { afterAll, describe, expect, it } from "vitest";

const connectionString = process.env.EXTERNAL_DATABASE_URL;
let connection: mysql.Connection | undefined;

function buildConnectionOptions(urlValue: string): mysql.ConnectionOptions {
  const url = new URL(urlValue);
  return {
    host: url.hostname,
    port: Number(url.port || 4000),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "") || "sys"),
    ssl: { rejectUnauthorized: true },
  };
}

describe("conexão com TiDB Cloud externo", () => {
  afterAll(async () => {
    await connection?.end();
  });

  it("usa EXTERNAL_DATABASE_URL e responde a uma consulta leve", async () => {
    expect(connectionString, "EXTERNAL_DATABASE_URL deve estar configurada").toBeTruthy();

    connection = await mysql.createConnection(buildConnectionOptions(connectionString!));
    const [rows] = await connection.query<{ connection_ok: number }[]>("SELECT 1 AS connection_ok");

    expect(rows[0]?.connection_ok).toBe(1);
  });
});
