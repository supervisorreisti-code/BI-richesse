import { afterEach, describe, expect, it } from "vitest";
import { authenticateExternalLogin, isExternalAuthEnabled } from "./_core/externalAuth";
import { createContext } from "./_core/context";

const previous = {
  AUTH_MODE: process.env.AUTH_MODE,
  VERCEL: process.env.VERCEL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL,
};

afterEach(() => {
  process.env.AUTH_MODE = previous.AUTH_MODE;
  process.env.VERCEL = previous.VERCEL;
  process.env.ADMIN_EMAIL = previous.ADMIN_EMAIL;
  process.env.ADMIN_PASSWORD = previous.ADMIN_PASSWORD;
  process.env.OAUTH_SERVER_URL = previous.OAUTH_SERVER_URL;
});

describe("autenticação administrativa externa", () => {
  it("prioriza o modo externo na Vercel e só permite Manus quando configurado explicitamente", () => {
    process.env.AUTH_MODE = "external";
    process.env.VERCEL = "";
    expect(isExternalAuthEnabled()).toBe(true);
    process.env.AUTH_MODE = "manus";
    expect(isExternalAuthEnabled()).toBe(false);
    process.env.AUTH_MODE = undefined;
    process.env.VERCEL = "1";
    expect(isExternalAuthEnabled()).toBe(true);
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

  it("não inicializa OAuth Manus ao criar contexto externo sem sessão", async () => {
    process.env.AUTH_MODE = "external";
    process.env.VERCEL = "1";
    process.env.OAUTH_SERVER_URL = "";

    const context = await createContext({
      req: { headers: {} },
      res: {},
    } as never);

    expect(context.user).toBeNull();
  });
});
