import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }));

export default app;
