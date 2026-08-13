import { afterEach, describe, expect, it } from "vitest";
import { storageGetSignedUrl, storagePut } from "./storage";

const previousMode = process.env.STORAGE_MODE;
const previousToken = process.env.BLOB_READ_WRITE_TOKEN;

afterEach(() => {
  process.env.STORAGE_MODE = previousMode;
  process.env.BLOB_READ_WRITE_TOKEN = previousToken;
});

describe("armazenamento externo de backup", () => {
  it("exige o token do Vercel Blob no modo externo", async () => {
    process.env.STORAGE_MODE = "vercel-blob";
    delete process.env.BLOB_READ_WRITE_TOKEN;
    await expect(storagePut("backups/teste.json", "{}", "application/json"))
      .rejects.toThrow("BLOB_READ_WRITE_TOKEN");
    await expect(storageGetSignedUrl("backups/teste.json"))
      .rejects.toThrow("BLOB_READ_WRITE_TOKEN");
  });
});
