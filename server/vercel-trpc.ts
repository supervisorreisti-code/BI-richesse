import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));

// O runtime expõe a função diretamente em /api/trpc. Normalizar o caminho
// mantém a compatibilidade do adaptador Express com o roteador tRPC.
app.use((req, _res, next) => {
  if (req.url === "/api/trpc") req.url = "/";
  else if (req.url.startsWith("/api/trpc/")) req.url = req.url.slice("/api/trpc".length);
  next();
});

app.use("/", createExpressMiddleware({ router: appRouter, createContext }));

export default app;
