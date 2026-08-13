import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");

describe("publicação da Vercel", () => {
  it("empacota uma função tRPC explícita e preserva /api fora do fallback da SPA", () => {
    const config = JSON.parse(readFileSync(resolve(projectRoot, "vercel.json"), "utf8"));
    const scripts = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8")).scripts;

    expect(existsSync(resolve(projectRoot, "server", "vercel-trpc.ts"))).toBe(true);
    expect(scripts["build:vercel"]).toContain("server/vercel-trpc.ts");
    expect(scripts["build:vercel"]).toContain("api/trpc/[...path].js");
    expect(config.functions?.["api/trpc/[...path].js"]?.maxDuration).toBe(30);
    expect(config.rewrites).toContainEqual({
      source: "/:path((?!api/).*)",
      destination: "/index.html",
    });
  });
});
