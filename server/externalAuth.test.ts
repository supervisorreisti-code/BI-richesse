import { afterEach, describe, expect, it } from "vitest";
import { authenticateExternalLogin, isExternalAuthEnabled } from "./_core/externalAuth";

const previous = {
  AUTH_MODE: process.env.AUTH_MODE,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
};

afterEach(() => {
  process.env.AUTH_MODE = previous.AUTH_MODE;
  process.env.ADMIN_EMAIL = previous.ADMIN_EMAIL;
  process.env.ADMIN_PASSWORD = previous.ADMIN_PASSWORD;
});

describe("autenticação administrativa externa", () => {
  it("habilita o modo externo somente quando explicitamente configurado", () => {
    process.env.AUTH_MODE = "external";
    expect(isExternalAuthEnabled()).toBe(true);
    process.env.AUTH_MODE = "manus";
    expect(isExternalAuthEnabled()).toBe(false);
  });

  it("aceita somente as credenciais administrativas configuradas", async () => {
    process.env.ADMIN_EMAIL = "admin@richesse.go";
    process.env.ADMIN_PASSWORD = "senha-segura";

    const authenticated = await authenticateExternalLogin("ADMIN@RICHESSE.GO", "senha-segura");
    const rejected = await authenticateExternalLogin("admin@richesse.go", "senha-incorreta");

    expect(authenticated?.role).toBe("admin");
    expect(authenticated?.openId).toBe("external-admin:admin@richesse.go");
    expect(rejected).toBeNull();
  });
});

