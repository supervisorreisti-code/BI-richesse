import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));

// A função já está montada em /api/trpc na Vercel. Remover o prefixo torna
// a requisição compatível tanto com o caminho original quanto com o relativo
// entregue pelo runtime serverless.
app.use((req, _res, next) => {
  if (req.url === "/api/trpc") req.url = "/";
  else if (req.url.startsWith("/api/trpc/")) req.url = req.url.slice("/api/trpc".length);
  next();
});
app.use("/", createExpressMiddleware({ router: appRouter, createContext }));

export default app;
