import { timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

const EXTERNAL_SESSION_HOURS = 12;

function externalSecret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET não configurada no ambiente externo.");
  return new TextEncoder().encode(value);
}

function safeEquals(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

function externalAdminUser(email: string): User {
  const now = new Date();
  return {
    id: -1,
    openId: `external-admin:${email.toLowerCase()}`,
    name: "Administrador Richesse",
    email: email.toLowerCase(),
    loginMethod: "password",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export function isExternalAuthEnabled() {
  // Em produção na Vercel, usar a autenticação local do BI por padrão impede
  // que um token legado do ambiente anterior possa liberar o painel Admin.
  // AUTH_MODE=manus continua permitindo o modo integrado apenas quando
  // solicitado de forma explícita.
  return process.env.AUTH_MODE === "external" || (
    process.env.VERCEL === "1" && process.env.AUTH_MODE !== "manus"
  );
}

export async function authenticateExternalLogin(email: string, password: string): Promise<User | null> {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) {
    throw new Error("Credenciais administrativas externas não configuradas.");
  }
  if (!safeEquals(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase())) return null;
  if (!safeEquals(password, expectedPassword)) return null;
  return externalAdminUser(expectedEmail);
}

export async function issueExternalSession(req: Request, res: Response, user: User) {
  const expiresAt = Math.floor(Date.now() / 1000) + EXTERNAL_SESSION_HOURS * 60 * 60;
  const token = await new SignJWT({
    openId: user.openId,
    name: user.name ?? "Administrador Richesse",
    email: user.email,
    authMode: "external",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(externalSecret());

  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: EXTERNAL_SESSION_HOURS * 60 * 60 * 1000,
  });
}

export async function authenticateExternalRequest(req: Request): Promise<User> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const token = cookies[COOKIE_NAME];
  if (!token) throw new Error("Sessão externa ausente.");

  const { payload } = await jwtVerify(token, externalSecret(), { algorithms: ["HS256"] });
  const openId = typeof payload.openId === "string" ? payload.openId : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  const authMode = payload.authMode;
  if (!openId.startsWith("external-admin:") || !email || authMode !== "external") {
    throw new Error("Sessão externa inválida.");
  }
  return externalAdminUser(email);
}
