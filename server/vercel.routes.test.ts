import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");

describe("publicação da Vercel", () => {
  it("mantém uma função tRPC explícita e preserva /api fora do fallback da SPA", () => {
    const config = JSON.parse(readFileSync(resolve(projectRoot, "vercel.json"), "utf8"));

    expect(existsSync(resolve(projectRoot, "api", "trpc", "[...path].ts"))).toBe(true);
    expect(config.functions?.["api/trpc/[...path].ts"]?.maxDuration).toBe(30);
    expect(config.rewrites).toContainEqual({
      source: "/:path((?!api/).*)",
      destination: "/index.html",
    });
  });
});
