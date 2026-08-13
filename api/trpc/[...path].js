var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  storageGet: () => storageGet,
  storageGetSignedUrl: () => storageGetSignedUrl,
  storagePut: () => storagePut
});
import { issueSignedToken, presignUrl, put } from "@vercel/blob";
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
function isVercelBlobStorage() {
  return process.env.STORAGE_MODE === "vercel-blob";
}
function getVercelBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN n\xE3o configurado para o armazenamento externo.");
  return token;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const key = appendHashSuffix(normalizeKey(relKey));
  if (isVercelBlobStorage()) {
    const body = data instanceof Uint8Array && !Buffer.isBuffer(data) ? Buffer.from(data) : data;
    const blob2 = await put(key, body, {
      access: "private",
      addRandomSuffix: false,
      contentType,
      token: getVercelBlobToken()
    });
    return { key, url: blob2.url };
  }
  const { forgeUrl, forgeKey } = getForgeConfig();
  const presignUrl2 = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl2.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl2, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}
async function storageGet(relKey) {
  const key = normalizeKey(relKey);
  if (isVercelBlobStorage()) return { key, url: await storageGetSignedUrl(key) };
  return { key, url: `/manus-storage/${key}` };
}
async function storageGetSignedUrl(relKey) {
  if (isVercelBlobStorage()) {
    const key2 = normalizeKey(relKey);
    const validUntil = Date.now() + 10 * 60 * 1e3;
    const signedToken = await issueSignedToken({
      pathname: key2,
      operations: ["get"],
      validUntil,
      token: getVercelBlobToken()
    });
    const { presignedUrl } = await presignUrl(signedToken, {
      operation: "get",
      pathname: key2,
      access: "private",
      validUntil,
      useCache: false
    });
    return presignedUrl;
  }
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = normalizeKey(relKey);
  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
  }
  const { url } = await resp.json();
  return url;
}
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_env();
  }
});

// client/src/lib/data.ts
var data_exports = {};
__export(data_exports, {
  LOJAS_PADRAO: () => LOJAS_PADRAO,
  atingimentoPercentual: () => atingimentoPercentual,
  chaveComposta: () => chaveComposta,
  diferencaMeta: () => diferencaMeta,
  filtrarLojasPeriodos: () => filtrarLojasPeriodos,
  filtrarRanking: () => filtrarRanking,
  fmtMil: () => fmtMil,
  fmtMoeda: () => fmtMoeda,
  fmtMoeda2: () => fmtMoeda2,
  fmtNumero: () => fmtNumero,
  fmtPercentual: () => fmtPercentual,
  lojasDisponiveis: () => lojasDisponiveis,
  lojasPeriodos: () => lojasPeriodos2,
  melhorVendedor: () => melhorVendedor,
  periodosDisponiveis: () => periodosDisponiveis,
  rankingVendedores: () => rankingVendedores2,
  statusMeta: () => statusMeta,
  totalMeta: () => totalMeta,
  totalVendas: () => totalVendas,
  vendasVendedoresInformados: () => vendasVendedoresInformados
});
function totalVendas(registros) {
  return registros.reduce((s, r) => s + r.vendas_total, 0);
}
function totalMeta(registros) {
  return registros.reduce((s, r) => s + r.meta, 0);
}
function atingimentoPercentual(registros) {
  const vendas = totalVendas(registros);
  const meta = totalMeta(registros);
  return meta === 0 ? 0 : vendas / meta;
}
function diferencaMeta(registros) {
  return totalVendas(registros) - totalMeta(registros);
}
function statusMeta(atingimento) {
  const pct = atingimento * 100;
  if (pct >= 110) return "Acima da meta";
  if (pct >= 100) return "Meta atingida";
  if (pct >= 90) return "Pr\xF3ximo da meta";
  if (pct >= 70) return "Abaixo da meta";
  return "Cr\xEDtico";
}
function vendasVendedoresInformados(ranking) {
  return ranking.reduce((s, r) => s + r.vendas, 0);
}
function melhorVendedor(ranking) {
  if (ranking.length === 0) return null;
  return ranking.reduce((best, r) => r.vendas > best.vendas ? r : best, ranking[0]);
}
function filtrarLojasPeriodos(f) {
  return lojasPeriodos2.filter(
    (r) => (!f.loja || r.loja === f.loja) && (!f.periodo || r.periodo === f.periodo)
  );
}
function filtrarRanking(f) {
  return rankingVendedores2.filter(
    (r) => (!f.loja || r.loja === f.loja) && (!f.periodo || r.periodo === f.periodo)
  ).sort((a, b) => a.posicao - b.posicao);
}
function periodosDisponiveis() {
  return Array.from(new Set(lojasPeriodos2.map((r) => r.periodo)));
}
function lojasDisponiveis() {
  return Array.from(new Set(lojasPeriodos2.map((r) => r.loja)));
}
function fmtMoeda(v) {
  return fmtBRL.format(v);
}
function fmtMoeda2(v) {
  return fmtBRL2.format(v);
}
function fmtPercentual(v) {
  return v.toLocaleString("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function fmtNumero(v) {
  return v.toLocaleString("pt-BR");
}
function fmtMil(v) {
  const abs = Math.abs(v);
  const sinal = v < 0 ? "-" : "";
  if (abs >= 1e6) {
    const milhao = abs / 1e6;
    const inteiro = Math.floor(milhao);
    const decimal = Math.round((milhao - inteiro) * 10);
    return `${sinal}R$ ${inteiro}${decimal > 0 ? `,${decimal}` : ""} milh${milhao >= 2 ? "\xF5es" : "\xE3o"}`;
  }
  const mil = Math.round(abs / 1e3);
  return `${sinal}R$ ${mil.toLocaleString("pt-BR")} mil`;
}
var LOJAS_PADRAO, lojasPeriodos2, rankingVendedores2, chaveComposta, fmtBRL, fmtBRL2;
var init_data = __esm({
  "client/src/lib/data.ts"() {
    "use strict";
    LOJAS_PADRAO = [
      "Richesse Flamboyant",
      "Richesse Oeste",
      "Richesse Prime",
      "Richesse Gelateria",
      "Richesse TOGO",
      "Richesse Marista",
      "Richesse Goi\xE2nia Shopping",
      "Richesse Park",
      "Richesse Eventos"
    ];
    lojasPeriodos2 = [
      { periodo: "Maio", loja: "Richesse Flamboyant", vendas_total: 694e3, meta: 813808, atingimento_percentual: 694e3 / 813808, diferenca_meta: 694e3 - 813808 },
      { periodo: "Maio", loja: "Richesse Oeste", vendas_total: 937e3, meta: 1359149, atingimento_percentual: 937e3 / 1359149, diferenca_meta: 937e3 - 1359149 },
      { periodo: "Maio", loja: "Richesse Prime", vendas_total: 217e3, meta: 293964, atingimento_percentual: 217e3 / 293964, diferenca_meta: 217e3 - 293964 },
      { periodo: "Maio", loja: "Richesse Gelateria", vendas_total: 166e3, meta: 191e3, atingimento_percentual: 166e3 / 191e3, diferenca_meta: 166e3 - 191e3 },
      { periodo: "Maio", loja: "Richesse TOGO", vendas_total: 428e3, meta: 630455, atingimento_percentual: 428e3 / 630455, diferenca_meta: 428e3 - 630455 },
      { periodo: "Maio", loja: "Richesse Marista", vendas_total: 513e3, meta: 670925, atingimento_percentual: 513e3 / 670925, diferenca_meta: 513e3 - 670925 },
      { periodo: "Maio", loja: "Richesse Goi\xE2nia Shopping", vendas_total: 515e3, meta: 650176, atingimento_percentual: 515e3 / 650176, diferenca_meta: 515e3 - 650176 },
      { periodo: "Maio", loja: "Richesse Park", vendas_total: 35e4, meta: 592461, atingimento_percentual: 35e4 / 592461, diferenca_meta: 35e4 - 592461 },
      // Junho — relatório oficial recebido (Richesse SETOR OESTE mapeado para "Richesse Oeste")
      { periodo: "Junho", loja: "Richesse Flamboyant", vendas_total: 707e3, meta: 810690, atingimento_percentual: 707e3 / 810690, diferenca_meta: 707e3 - 810690 },
      { periodo: "Junho", loja: "Richesse Oeste", vendas_total: 931e3, meta: 1258616, atingimento_percentual: 931e3 / 1258616, diferenca_meta: 931e3 - 1258616 },
      { periodo: "Junho", loja: "Richesse Prime", vendas_total: 191e3, meta: 242154, atingimento_percentual: 191e3 / 242154, diferenca_meta: 191e3 - 242154 },
      { periodo: "Junho", loja: "Richesse Gelateria", vendas_total: 136e3, meta: 182577, atingimento_percentual: 136e3 / 182577, diferenca_meta: 136e3 - 182577 },
      { periodo: "Junho", loja: "Richesse TOGO", vendas_total: 43e4, meta: 565707, atingimento_percentual: 43e4 / 565707, diferenca_meta: 43e4 - 565707 },
      { periodo: "Junho", loja: "Richesse Marista", vendas_total: 479e3, meta: 619622, atingimento_percentual: 479e3 / 619622, diferenca_meta: 479e3 - 619622 },
      { periodo: "Junho", loja: "Richesse Goi\xE2nia Shopping", vendas_total: 502e3, meta: 676460, atingimento_percentual: 502e3 / 676460, diferenca_meta: 502e3 - 676460 },
      { periodo: "Junho", loja: "Richesse Park", vendas_total: 336e3, meta: 546350, atingimento_percentual: 336e3 / 546350, diferenca_meta: 336e3 - 546350 },
      // Julho — relatório oficial recebido (9 unidades: nova Richesse Eventos; SETOR OESTE mapeado para "Richesse Oeste")
      { periodo: "Julho", loja: "Richesse Flamboyant", vendas_total: 787e3, meta: 980779, atingimento_percentual: 787e3 / 980779, diferenca_meta: 787e3 - 980779 },
      { periodo: "Julho", loja: "Richesse Marista", vendas_total: 473e3, meta: 695647, atingimento_percentual: 473e3 / 695647, diferenca_meta: 473e3 - 695647 },
      { periodo: "Julho", loja: "Richesse TOGO", vendas_total: 375e3, meta: 624479, atingimento_percentual: 375e3 / 624479, diferenca_meta: 375e3 - 624479 },
      { periodo: "Julho", loja: "Richesse Gelateria", vendas_total: 177e3, meta: 226954, atingimento_percentual: 177e3 / 226954, diferenca_meta: 177e3 - 226954 },
      { periodo: "Julho", loja: "Richesse Prime", vendas_total: 17e4, meta: 315386, atingimento_percentual: 17e4 / 315386, diferenca_meta: 17e4 - 315386 },
      { periodo: "Julho", loja: "Richesse Park", vendas_total: 39e4, meta: 581174, atingimento_percentual: 39e4 / 581174, diferenca_meta: 39e4 - 581174 },
      { periodo: "Julho", loja: "Richesse Goi\xE2nia Shopping", vendas_total: 527e3, meta: 790397, atingimento_percentual: 527e3 / 790397, diferenca_meta: 527e3 - 790397 },
      { periodo: "Julho", loja: "Richesse Oeste", vendas_total: 876e3, meta: 1516955, atingimento_percentual: 876e3 / 1516955, diferenca_meta: 876e3 - 1516955 },
      { periodo: "Julho", loja: "Richesse Eventos", vendas_total: 286e3, meta: 35e4, atingimento_percentual: 286e3 / 35e4, diferenca_meta: 286e3 - 35e4 }
    ];
    rankingVendedores2 = [
      { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 1, vendedor: "Luciana Araujo Alves", vendas: 103e3 },
      { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 2, vendedor: "Cintia Alzira", vendas: 87e3 },
      { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 3, vendedor: "Keleme Lima", vendas: 71e3 },
      { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 4, vendedor: "Helen Viana", vendas: 64e3 },
      { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 5, vendedor: "Gabriel Felipe", vendas: 53e3 },
      { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 6, vendedor: "Yara Rayanne", vendas: 45e3 },
      { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 7, vendedor: "Steffany Cristina", vendas: 41e3 },
      { periodo: "Maio", loja: "Richesse Flamboyant", posicao: 8, vendedor: "Janis Lopes Lima", vendas: 38e3 },
      { periodo: "Maio", loja: "Richesse Oeste", posicao: 1, vendedor: "Natia Cristina Saldanha", vendas: 108e3 },
      { periodo: "Maio", loja: "Richesse Oeste", posicao: 2, vendedor: "Naiane Souza", vendas: 98e3 },
      { periodo: "Maio", loja: "Richesse Oeste", posicao: 3, vendedor: "Karolyne de Sousa", vendas: 93e3 },
      { periodo: "Maio", loja: "Richesse Oeste", posicao: 4, vendedor: "Maria Raimunda", vendas: 81e3 },
      { periodo: "Maio", loja: "Richesse Oeste", posicao: 5, vendedor: "Denize dos Santos Silva", vendas: 78e3 },
      { periodo: "Maio", loja: "Richesse Oeste", posicao: 6, vendedor: "Francisca Rodrigues", vendas: 68e3 },
      { periodo: "Maio", loja: "Richesse Oeste", posicao: 7, vendedor: "Luciana de Kasssia", vendas: 67e3 },
      { periodo: "Maio", loja: "Richesse Oeste", posicao: 8, vendedor: "Ireny Alves", vendas: 65e3 },
      { periodo: "Maio", loja: "Richesse Prime", posicao: 1, vendedor: "Rayssa Lorrany", vendas: 58e3 },
      { periodo: "Maio", loja: "Richesse Prime", posicao: 2, vendedor: "Eliana Miguel de Morais", vendas: 46e3 },
      { periodo: "Maio", loja: "Richesse Prime", posicao: 3, vendedor: "Celismar Cunha Cavalcante", vendas: 44e3 },
      { periodo: "Maio", loja: "Richesse Prime", posicao: 4, vendedor: "Michele Gomes Pereira", vendas: 33e3 },
      { periodo: "Maio", loja: "Richesse Prime", posicao: 5, vendedor: "Daniela de Sousa", vendas: 15e3 },
      { periodo: "Maio", loja: "Richesse Prime", posicao: 6, vendedor: "Jusimeire de Rocha", vendas: 5e3 },
      { periodo: "Maio", loja: "Richesse Gelateria", posicao: 1, vendedor: "Luscineide", vendas: 88e3 },
      { periodo: "Maio", loja: "Richesse Gelateria", posicao: 2, vendedor: "Jaqueline", vendas: 78e3 },
      { periodo: "Maio", loja: "Richesse TOGO", posicao: 1, vendedor: "Maria Sthfanny dos Reis", vendas: 79e3 },
      { periodo: "Maio", loja: "Richesse TOGO", posicao: 2, vendedor: "Bianca Vaz", vendas: 68e3 },
      { periodo: "Maio", loja: "Richesse TOGO", posicao: 3, vendedor: "Caroline Sousa", vendas: 67e3 },
      { periodo: "Maio", loja: "Richesse TOGO", posicao: 4, vendedor: "Diana Mendes", vendas: 6e4 },
      { periodo: "Maio", loja: "Richesse TOGO", posicao: 5, vendedor: "Davi Mendes", vendas: 51e3 },
      { periodo: "Maio", loja: "Richesse TOGO", posicao: 6, vendedor: "Estefane Lustosa", vendas: 27e3 },
      { periodo: "Maio", loja: "Richesse TOGO", posicao: 7, vendedor: "Adelio Junio", vendas: 24e3 },
      { periodo: "Maio", loja: "Richesse TOGO", posicao: 8, vendedor: "Kamille Jenifer", vendas: 17e3 },
      { periodo: "Maio", loja: "Richesse Marista", posicao: 1, vendedor: "Mylena dos Santos", vendas: 125e3 },
      { periodo: "Maio", loja: "Richesse Marista", posicao: 2, vendedor: "Joelma Cristina", vendas: 104e3 },
      { periodo: "Maio", loja: "Richesse Marista", posicao: 3, vendedor: "Bruna Fernanda", vendas: 65e3 },
      { periodo: "Maio", loja: "Richesse Marista", posicao: 4, vendedor: "Itamara Araujo", vendas: 65e3 },
      { periodo: "Maio", loja: "Richesse Marista", posicao: 5, vendedor: "Daniel Silva", vendas: 57e3 },
      { periodo: "Maio", loja: "Richesse Marista", posicao: 6, vendedor: "Nathalia Silva", vendas: 5e4 },
      { periodo: "Maio", loja: "Richesse Marista", posicao: 7, vendedor: "Bianca dos Santos Luz", vendas: 18e3 },
      { periodo: "Maio", loja: "Richesse Goi\xE2nia Shopping", posicao: 1, vendedor: "Alexander Machado de Almeida", vendas: 9e4 },
      { periodo: "Maio", loja: "Richesse Goi\xE2nia Shopping", posicao: 2, vendedor: "Leticia Cordoval", vendas: 65e3 },
      { periodo: "Maio", loja: "Richesse Goi\xE2nia Shopping", posicao: 3, vendedor: "Ana Paula Amaral", vendas: 65e3 },
      { periodo: "Maio", loja: "Richesse Goi\xE2nia Shopping", posicao: 4, vendedor: "Cassiane Eva Pinto", vendas: 64e3 },
      { periodo: "Maio", loja: "Richesse Goi\xE2nia Shopping", posicao: 5, vendedor: "Wellingyhon dos Santos", vendas: 62e3 },
      { periodo: "Maio", loja: "Richesse Goi\xE2nia Shopping", posicao: 6, vendedor: "Karen Lainy Ferreira", vendas: 61e3 },
      { periodo: "Maio", loja: "Richesse Goi\xE2nia Shopping", posicao: 7, vendedor: "Ana Tereza Freitas", vendas: 52e3 },
      { periodo: "Maio", loja: "Richesse Goi\xE2nia Shopping", posicao: 8, vendedor: "Nathalia Medeiros", vendas: 16e3 },
      { periodo: "Maio", loja: "Richesse Park", posicao: 1, vendedor: "Isabela de Jesus", vendas: 82e3 },
      { periodo: "Maio", loja: "Richesse Park", posicao: 2, vendedor: "Jessica Yasmin Rodrigues", vendas: 8e4 },
      { periodo: "Maio", loja: "Richesse Park", posicao: 3, vendedor: "Marcela Lorrany", vendas: 52e3 },
      { periodo: "Maio", loja: "Richesse Park", posicao: 4, vendedor: "Nyckolas Alessandro", vendas: 46e3 },
      { periodo: "Maio", loja: "Richesse Park", posicao: 5, vendedor: "Felipe de Sousa", vendas: 2e4 },
      { periodo: "Maio", loja: "Richesse Park", posicao: 6, vendedor: "Paulo Ricardo", vendas: 15e3 },
      { periodo: "Maio", loja: "Richesse Park", posicao: 7, vendedor: "Jaqueline Alves", vendas: 12e3 },
      { periodo: "Maio", loja: "Richesse Park", posicao: 8, vendedor: "Ana Clara Carvalho", vendas: 12e3 },
      // Junho — relatório oficial recebido; nomes conforme exibidos no relatório
      { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 1, vendedor: "Luciana", vendas: 101e3 },
      { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 2, vendedor: "Cintia", vendas: 93e3 },
      { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 3, vendedor: "Steffany", vendas: 68e3 },
      { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 4, vendedor: "Gabriel", vendas: 57e3 },
      { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 5, vendedor: "Helen", vendas: 55e3 },
      { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 6, vendedor: "Lays", vendas: 48e3 },
      { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 7, vendedor: "Micaelly", vendas: 47e3 },
      { periodo: "Junho", loja: "Richesse Flamboyant", posicao: 8, vendedor: "Elen", vendas: 4e4 },
      { periodo: "Junho", loja: "Richesse Marista", posicao: 1, vendedor: "Milena", vendas: 11e4 },
      { periodo: "Junho", loja: "Richesse Marista", posicao: 2, vendedor: "Daniela", vendas: 88e3 },
      { periodo: "Junho", loja: "Richesse Marista", posicao: 3, vendedor: "Itamara", vendas: 68e3 },
      { periodo: "Junho", loja: "Richesse Marista", posicao: 4, vendedor: "Bruna", vendas: 68e3 },
      { periodo: "Junho", loja: "Richesse Marista", posicao: 5, vendedor: "Nathalia", vendas: 58e3 },
      { periodo: "Junho", loja: "Richesse Marista", posicao: 6, vendedor: "Julia", vendas: 5e4 },
      { periodo: "Junho", loja: "Richesse Marista", posicao: 7, vendedor: "Bianca", vendas: 18e3 },
      { periodo: "Junho", loja: "Richesse Marista", posicao: 8, vendedor: "Joelma", vendas: 11e3 },
      { periodo: "Junho", loja: "Richesse TOGO", posicao: 1, vendedor: "Caroline", vendas: 79e3 },
      { periodo: "Junho", loja: "Richesse TOGO", posicao: 2, vendedor: "Diana", vendas: 7e4 },
      { periodo: "Junho", loja: "Richesse TOGO", posicao: 3, vendedor: "Bianca", vendas: 65e3 },
      { periodo: "Junho", loja: "Richesse TOGO", posicao: 4, vendedor: "Maria", vendas: 63e3 },
      { periodo: "Junho", loja: "Richesse TOGO", posicao: 5, vendedor: "Kamille", vendas: 46e3 },
      { periodo: "Junho", loja: "Richesse TOGO", posicao: 6, vendedor: "Davi", vendas: 36e3 },
      { periodo: "Junho", loja: "Richesse TOGO", posicao: 7, vendedor: "Adelio", vendas: 35e3 },
      { periodo: "Junho", loja: "Richesse TOGO", posicao: 8, vendedor: "Estefane", vendas: 19e3 },
      { periodo: "Junho", loja: "Richesse Gelateria", posicao: 1, vendedor: "Lusineide", vendas: 69e3 },
      { periodo: "Junho", loja: "Richesse Gelateria", posicao: 2, vendedor: "Jaqueline", vendas: 64e3 },
      { periodo: "Junho", loja: "Richesse Gelateria", posicao: 3, vendedor: "Nikelly", vendas: 3e3 },
      { periodo: "Junho", loja: "Richesse Prime", posicao: 1, vendedor: "Rayssa", vendas: 48e3 },
      { periodo: "Junho", loja: "Richesse Prime", posicao: 2, vendedor: "Eliana", vendas: 44e3 },
      { periodo: "Junho", loja: "Richesse Prime", posicao: 3, vendedor: "Celisnar", vendas: 4e4 },
      { periodo: "Junho", loja: "Richesse Prime", posicao: 4, vendedor: "Michele", vendas: 34e3 },
      { periodo: "Junho", loja: "Richesse Prime", posicao: 5, vendedor: "Daniela", vendas: 11e3 },
      { periodo: "Junho", loja: "Richesse Prime", posicao: 6, vendedor: "Adriana", vendas: 8e3 },
      { periodo: "Junho", loja: "Richesse Prime", posicao: 7, vendedor: "Jusimeire", vendas: 4e3 },
      { periodo: "Junho", loja: "Richesse Prime", posicao: 8, vendedor: "Flavia", vendas: 241 },
      { periodo: "Junho", loja: "Richesse Park", posicao: 1, vendedor: "Isabela", vendas: 76e3 },
      { periodo: "Junho", loja: "Richesse Park", posicao: 2, vendedor: "Marcela", vendas: 61e3 },
      { periodo: "Junho", loja: "Richesse Park", posicao: 3, vendedor: "Jessica", vendas: 38e3 },
      { periodo: "Junho", loja: "Richesse Park", posicao: 4, vendedor: "Nyckolas", vendas: 34e3 },
      { periodo: "Junho", loja: "Richesse Park", posicao: 5, vendedor: "Jennifer", vendas: 3e4 },
      { periodo: "Junho", loja: "Richesse Park", posicao: 6, vendedor: "Sabrina", vendas: 28e3 },
      { periodo: "Junho", loja: "Richesse Park", posicao: 7, vendedor: "Jaqueline", vendas: 16e3 },
      { periodo: "Junho", loja: "Richesse Park", posicao: 8, vendedor: "Waldir", vendas: 15e3 },
      { periodo: "Junho", loja: "Richesse Goi\xE2nia Shopping", posicao: 1, vendedor: "Let\xEDcia", vendas: 63e3 },
      { periodo: "Junho", loja: "Richesse Goi\xE2nia Shopping", posicao: 2, vendedor: "Ana", vendas: 61e3 },
      { periodo: "Junho", loja: "Richesse Goi\xE2nia Shopping", posicao: 3, vendedor: "Karen", vendas: 59e3 },
      { periodo: "Junho", loja: "Richesse Goi\xE2nia Shopping", posicao: 4, vendedor: "Cassiane", vendas: 59e3 },
      { periodo: "Junho", loja: "Richesse Goi\xE2nia Shopping", posicao: 5, vendedor: "Wellington", vendas: 56e3 },
      { periodo: "Junho", loja: "Richesse Goi\xE2nia Shopping", posicao: 6, vendedor: "Thyayla", vendas: 49e3 },
      { periodo: "Junho", loja: "Richesse Goi\xE2nia Shopping", posicao: 7, vendedor: "Alexander", vendas: 48e3 },
      { periodo: "Junho", loja: "Richesse Goi\xE2nia Shopping", posicao: 8, vendedor: "Ana", vendas: 47e3 },
      { periodo: "Junho", loja: "Richesse Oeste", posicao: 1, vendedor: "Karolyne", vendas: 126e3 },
      { periodo: "Junho", loja: "Richesse Oeste", posicao: 2, vendedor: "Naiane", vendas: 114e3 },
      { periodo: "Junho", loja: "Richesse Oeste", posicao: 3, vendedor: "Natia", vendas: 95e3 },
      { periodo: "Junho", loja: "Richesse Oeste", posicao: 4, vendedor: "Dayane", vendas: 78e3 },
      { periodo: "Junho", loja: "Richesse Oeste", posicao: 5, vendedor: "Naykele", vendas: 73e3 },
      { periodo: "Junho", loja: "Richesse Oeste", posicao: 6, vendedor: "Denize", vendas: 73e3 },
      { periodo: "Junho", loja: "Richesse Oeste", posicao: 7, vendedor: "Naydes", vendas: 59e3 },
      { periodo: "Junho", loja: "Richesse Oeste", posicao: 8, vendedor: "Davi", vendas: 56e3 },
      // Julho — relatório oficial recebido; nomes conforme exibidos no relatório (mantidos os dois "Gabriel" da Flamboyant)
      { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 1, vendedor: "Luciana", vendas: 114e3 },
      { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 2, vendedor: "Cintia", vendas: 92e3 },
      { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 3, vendedor: "Steffany", vendas: 8e4 },
      { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 4, vendedor: "Helen", vendas: 69e3 },
      { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 5, vendedor: "Gabriel", vendas: 65e3 },
      { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 6, vendedor: "Elen", vendas: 59e3 },
      { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 7, vendedor: "Gabriel", vendas: 58e3 },
      { periodo: "Julho", loja: "Richesse Flamboyant", posicao: 8, vendedor: "Micaelly", vendas: 55e3 },
      { periodo: "Julho", loja: "Richesse Marista", posicao: 1, vendedor: "Mylena", vendas: 77e3 },
      { periodo: "Julho", loja: "Richesse Marista", posicao: 2, vendedor: "Daniel", vendas: 65e3 },
      { periodo: "Julho", loja: "Richesse Marista", posicao: 3, vendedor: "Nathalia", vendas: 62e3 },
      { periodo: "Julho", loja: "Richesse Marista", posicao: 4, vendedor: "Bruna", vendas: 58e3 },
      { periodo: "Julho", loja: "Richesse Marista", posicao: 5, vendedor: "Joelma", vendas: 49e3 },
      { periodo: "Julho", loja: "Richesse Marista", posicao: 6, vendedor: "Itamara", vendas: 48e3 },
      { periodo: "Julho", loja: "Richesse Marista", posicao: 7, vendedor: "Jaina", vendas: 41e3 },
      { periodo: "Julho", loja: "Richesse Marista", posicao: 8, vendedor: "Maria", vendas: 29e3 },
      { periodo: "Julho", loja: "Richesse TOGO", posicao: 1, vendedor: "Kamille", vendas: 53e3 },
      { periodo: "Julho", loja: "Richesse TOGO", posicao: 2, vendedor: "Elainny", vendas: 51e3 },
      { periodo: "Julho", loja: "Richesse TOGO", posicao: 3, vendedor: "Caroline", vendas: 5e4 },
      { periodo: "Julho", loja: "Richesse TOGO", posicao: 4, vendedor: "Diana", vendas: 41e3 },
      { periodo: "Julho", loja: "Richesse TOGO", posicao: 5, vendedor: "Adriana", vendas: 37e3 },
      { periodo: "Julho", loja: "Richesse TOGO", posicao: 6, vendedor: "Adelio", vendas: 35e3 },
      { periodo: "Julho", loja: "Richesse TOGO", posicao: 7, vendedor: "Michelle", vendas: 21e3 },
      { periodo: "Julho", loja: "Richesse TOGO", posicao: 8, vendedor: "Syang", vendas: 18e3 },
      { periodo: "Julho", loja: "Richesse Gelateria", posicao: 1, vendedor: "Lusineide", vendas: 9e4 },
      { periodo: "Julho", loja: "Richesse Gelateria", posicao: 2, vendedor: "Jaqueline", vendas: 87e3 },
      { periodo: "Julho", loja: "Richesse Prime", posicao: 1, vendedor: "Eliana", vendas: 42e3 },
      { periodo: "Julho", loja: "Richesse Prime", posicao: 2, vendedor: "Rayssa", vendas: 41e3 },
      { periodo: "Julho", loja: "Richesse Prime", posicao: 3, vendedor: "Celisnar", vendas: 39e3 },
      { periodo: "Julho", loja: "Richesse Prime", posicao: 4, vendedor: "Michele", vendas: 33e3 },
      { periodo: "Julho", loja: "Richesse Prime", posicao: 5, vendedor: "Jusimeire", vendas: 4e3 },
      { periodo: "Julho", loja: "Richesse Prime", posicao: 6, vendedor: "Juliana", vendas: 4e3 },
      { periodo: "Julho", loja: "Richesse Prime", posicao: 7, vendedor: "Daniela", vendas: 3e3 },
      { periodo: "Julho", loja: "Richesse Prime", posicao: 8, vendedor: "Adriana", vendas: 3e3 },
      { periodo: "Julho", loja: "Richesse Park", posicao: 1, vendedor: "Isabela", vendas: 78e3 },
      { periodo: "Julho", loja: "Richesse Park", posicao: 2, vendedor: "Marcela", vendas: 67e3 },
      { periodo: "Julho", loja: "Richesse Park", posicao: 3, vendedor: "Jennifer", vendas: 55e3 },
      { periodo: "Julho", loja: "Richesse Park", posicao: 4, vendedor: "Sabrina", vendas: 51e3 },
      { periodo: "Julho", loja: "Richesse Park", posicao: 5, vendedor: "Nyckolas", vendas: 46e3 },
      { periodo: "Julho", loja: "Richesse Park", posicao: 6, vendedor: "Stefane", vendas: 33e3 },
      { periodo: "Julho", loja: "Richesse Park", posicao: 7, vendedor: "Ana", vendas: 18e3 },
      { periodo: "Julho", loja: "Richesse Park", posicao: 8, vendedor: "Waldir", vendas: 12e3 },
      { periodo: "Julho", loja: "Richesse Goi\xE2nia Shopping", posicao: 1, vendedor: "Alexander", vendas: 99e3 },
      { periodo: "Julho", loja: "Richesse Goi\xE2nia Shopping", posicao: 2, vendedor: "Wellington", vendas: 66e3 },
      { periodo: "Julho", loja: "Richesse Goi\xE2nia Shopping", posicao: 3, vendedor: "Let\xEDcia", vendas: 64e3 },
      { periodo: "Julho", loja: "Richesse Goi\xE2nia Shopping", posicao: 4, vendedor: "Ana", vendas: 58e3 },
      { periodo: "Julho", loja: "Richesse Goi\xE2nia Shopping", posicao: 5, vendedor: "Karen", vendas: 56e3 },
      { periodo: "Julho", loja: "Richesse Goi\xE2nia Shopping", posicao: 6, vendedor: "Kemelli", vendas: 52e3 },
      { periodo: "Julho", loja: "Richesse Goi\xE2nia Shopping", posicao: 7, vendedor: "Cassiane", vendas: 46e3 },
      { periodo: "Julho", loja: "Richesse Goi\xE2nia Shopping", posicao: 8, vendedor: "Thyayla", vendas: 35e3 },
      { periodo: "Julho", loja: "Richesse Oeste", posicao: 1, vendedor: "Karolyne", vendas: 128e3 },
      { periodo: "Julho", loja: "Richesse Oeste", posicao: 2, vendedor: "Denize", vendas: 84e3 },
      { periodo: "Julho", loja: "Richesse Oeste", posicao: 3, vendedor: "Natia", vendas: 78e3 },
      { periodo: "Julho", loja: "Richesse Oeste", posicao: 4, vendedor: "Dayane", vendas: 7e4 },
      { periodo: "Julho", loja: "Richesse Oeste", posicao: 5, vendedor: "Naykele", vendas: 6e4 },
      { periodo: "Julho", loja: "Richesse Oeste", posicao: 6, vendedor: "Naydes", vendas: 49e3 },
      { periodo: "Julho", loja: "Richesse Oeste", posicao: 7, vendedor: "Sabrina", vendas: 48e3 },
      { periodo: "Julho", loja: "Richesse Oeste", posicao: 8, vendedor: "Naiane", vendas: 47e3 },
      { periodo: "Julho", loja: "Richesse Eventos", posicao: 1, vendedor: "Ludmila", vendas: 286e3 }
    ];
    chaveComposta = (loja, periodo) => `${loja}|${periodo}`;
    fmtBRL = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    fmtBRL2 = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
});

// server/vercel-trpc.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/externalAuth.ts
import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
var EXTERNAL_SESSION_HOURS = 12;
function externalSecret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET n\xE3o configurada no ambiente externo.");
  return new TextEncoder().encode(value);
}
function safeEquals(first, second) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}
function externalAdminUser(email) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: `external-admin:${email.toLowerCase()}`,
    name: "Administrador Richesse",
    email: email.toLowerCase(),
    loginMethod: "password",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now
  };
}
function isExternalAuthEnabled() {
  return process.env.AUTH_MODE === "external" || process.env.VERCEL === "1" && process.env.AUTH_MODE !== "manus";
}
async function authenticateExternalLogin(email, password) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) {
    throw new Error("Credenciais administrativas externas n\xE3o configuradas.");
  }
  if (!safeEquals(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase())) return null;
  if (!safeEquals(password, expectedPassword)) return null;
  return externalAdminUser(expectedEmail);
}
async function issueExternalSession(req, res, user) {
  const expiresAt = Math.floor(Date.now() / 1e3) + EXTERNAL_SESSION_HOURS * 60 * 60;
  const token = await new SignJWT({
    openId: user.openId,
    name: user.name ?? "Administrador Richesse",
    email: user.email,
    authMode: "external"
  }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuedAt().setExpirationTime(expiresAt).sign(externalSecret());
  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: EXTERNAL_SESSION_HOURS * 60 * 60 * 1e3
  });
}
async function authenticateExternalRequest(req) {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const token = cookies[COOKIE_NAME];
  if (!token) throw new Error("Sess\xE3o externa ausente.");
  const { payload } = await jwtVerify(token, externalSecret(), { algorithms: ["HS256"] });
  const openId = typeof payload.openId === "string" ? payload.openId : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  const authMode = payload.authMode;
  if (!openId.startsWith("external-admin:") || !email || authMode !== "external") {
    throw new Error("Sess\xE3o externa inv\xE1lida.");
  }
  return externalAdminUser(email);
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";

// server/db.ts
import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLog: () => auditLog,
  backupSnapshots: () => backupSnapshots,
  lojasPeriodos: () => lojasPeriodos,
  rankingVendedores: () => rankingVendedores,
  users: () => users
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var lojasPeriodos = mysqlTable("lojas_periodos", {
  id: int("id").autoincrement().primaryKey(),
  periodo: varchar("periodo", { length: 32 }).notNull(),
  loja: varchar("loja", { length: 128 }).notNull(),
  vendasTotal: int("vendas_total").notNull(),
  meta: int("meta").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});
var rankingVendedores = mysqlTable("ranking_vendedores", {
  id: int("id").autoincrement().primaryKey(),
  periodo: varchar("periodo", { length: 32 }).notNull(),
  loja: varchar("loja", { length: 128 }).notNull(),
  posicao: int("posicao").notNull(),
  vendedor: varchar("vendedor", { length: 128 }).notNull(),
  vendas: int("vendas").notNull(),
  isDeleted: int("is_deleted").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});
var auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  usuario: varchar("usuario", { length: 255 }),
  tabela: varchar("tabela", { length: 64 }).notNull(),
  registro: varchar("registro", { length: 255 }),
  campo: varchar("campo", { length: 64 }),
  valorAntigo: text("valor_antigo"),
  valorNovo: text("valor_novo"),
  criadoEm: timestamp("criado_em").defaultNow().notNull()
});
var backupSnapshots = mysqlTable("backup_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  usuario: varchar("usuario", { length: 255 }),
  tipo: varchar("tipo", { length: 32 }).default("manual").notNull(),
  /** Chave do arquivo JSON no storage (/manus-storage/...) */
  storageKey: varchar("storage_key", { length: 255 }).notNull(),
  descricao: varchar("descricao", { length: 255 }),
  registrosLojas: int("registros_lojas").notNull().default(0),
  registrosRanking: int("registros_ranking").notNull().default(0)
});

// server/db.ts
init_env();
var _db = null;
var _pool = null;
function databaseConnectionOptions(databaseUrl) {
  const url = new URL(databaseUrl);
  const isTiDBCloud = url.hostname.endsWith("tidbcloud.com");
  return {
    host: url.hostname,
    port: Number(url.port || (isTiDBCloud ? 4e3 : 3306)),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true,
    ssl: isTiDBCloud ? { rejectUnauthorized: true } : void 0
  };
}
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = createPool(databaseConnectionOptions(process.env.DATABASE_URL));
      _db = drizzle(_pool, { schema: schema_exports, mode: "default" });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
function requireDb(db) {
  if (!db) throw new Error("Database not available");
  return db;
}
async function listLojasPeriodos() {
  const db = requireDb(await getDb());
  return db.select().from(lojasPeriodos).orderBy(asc(lojasPeriodos.periodo), asc(lojasPeriodos.loja));
}
async function listRankings() {
  const db = requireDb(await getDb());
  return db.select().from(rankingVendedores).where(eq(rankingVendedores.isDeleted, 0)).orderBy(asc(rankingVendedores.periodo), asc(rankingVendedores.loja), asc(rankingVendedores.posicao));
}
async function salvarLojaPeriodo(periodo, loja, vendasTotal, meta, usuario) {
  const db = requireDb(await getDb());
  const existing = await db.select().from(lojasPeriodos).where(and(eq(lojasPeriodos.periodo, periodo), eq(lojasPeriodos.loja, loja))).limit(1);
  if (existing.length > 0) {
    const antes = existing[0];
    if (antes.vendasTotal !== vendasTotal || antes.meta !== meta) {
      await db.insert(auditLog).values({
        usuario: usuario ?? null,
        tabela: "lojas_periodos",
        registro: `${periodo}|${loja}`,
        campo: "vendas_total,meta",
        valorAntigo: `${antes.vendasTotal},${antes.meta}`,
        valorNovo: `${vendasTotal},${meta}`
      });
    }
    await db.update(lojasPeriodos).set({ vendasTotal, meta }).where(and(eq(lojasPeriodos.periodo, periodo), eq(lojasPeriodos.loja, loja)));
  } else {
    await db.insert(lojasPeriodos).values({ periodo, loja, vendasTotal, meta });
    await db.insert(auditLog).values({
      usuario: usuario ?? null,
      tabela: "lojas_periodos",
      registro: `${periodo}|${loja}`,
      campo: "vendas_total,meta",
      valorAntigo: null,
      valorNovo: `${vendasTotal},${meta}`
    });
  }
}
async function adicionarPeriodo(periodo, usuario) {
  const db = requireDb(await getDb());
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "lojas_periodos",
    registro: periodo,
    campo: "periodo",
    valorAntigo: null,
    valorNovo: "criado (lojas com valores zerados)"
  });
  return db.insert(lojasPeriodos).values({ periodo, loja: "__periodo__", vendasTotal: 0, meta: 0 });
}
async function substituirRanking(periodo, loja, vendedores, usuario) {
  const db = requireDb(await getDb());
  const existing = await db.select().from(rankingVendedores).where(and(eq(rankingVendedores.periodo, periodo), eq(rankingVendedores.loja, loja), eq(rankingVendedores.isDeleted, 0)));
  for (const r of existing) {
    await db.update(rankingVendedores).set({ isDeleted: 1 }).where(eq(rankingVendedores.id, r.id));
  }
  for (let i = 0; i < vendedores.length; i++) {
    await db.insert(rankingVendedores).values({
      periodo,
      loja,
      posicao: i + 1,
      vendedor: vendedores[i].vendedor,
      vendas: Math.round(vendedores[i].vendas * 100) / 100,
      isDeleted: 0
    });
  }
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "ranking_vendedores",
    registro: `${periodo}|${loja}`,
    campo: "ranking completo",
    valorAntigo: existing.length > 0 ? `${existing.length} registro(s)` : null,
    valorNovo: `${vendedores.length} registro(s)`
  });
}
async function removerVendedor(id, usuario) {
  const db = requireDb(await getDb());
  const rows = await db.select().from(rankingVendedores).where(eq(rankingVendedores.id, id)).limit(1);
  if (rows.length === 0) return;
  await db.update(rankingVendedores).set({ isDeleted: 1 }).where(eq(rankingVendedores.id, id));
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "ranking_vendedores",
    registro: `${rows[0].periodo}|${rows[0].loja}|${rows[0].vendedor}`,
    campo: "is_deleted",
    valorAntigo: "0",
    valorNovo: "1"
  });
  const restantes = await db.select().from(rankingVendedores).where(and(eq(rankingVendedores.periodo, rows[0].periodo), eq(rankingVendedores.loja, rows[0].loja), eq(rankingVendedores.isDeleted, 0))).orderBy(asc(rankingVendedores.posicao));
  for (let i = 0; i < restantes.length; i++) {
    if (restantes[i].posicao !== i + 1) {
      await db.update(rankingVendedores).set({ posicao: i + 1 }).where(eq(rankingVendedores.id, restantes[i].id));
    }
  }
}
async function inserirRankingsEmLote(entradas, usuario) {
  const db = requireDb(await getDb());
  for (const e of entradas) {
    await substituirRanking(e.periodo, e.loja, e.vendedores, usuario);
  }
}
async function removerPeriodoRankings(periodo, usuario) {
  const db = requireDb(await getDb());
  const rows = await db.select().from(rankingVendedores).where(eq(rankingVendedores.periodo, periodo));
  if (rows.length === 0) return;
  for (const r of rows) {
    await db.update(rankingVendedores).set({ isDeleted: 1 }).where(eq(rankingVendedores.id, r.id));
  }
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "ranking_vendedores",
    registro: periodo,
    campo: "is_deleted",
    valorAntigo: "0",
    valorNovo: "1"
  });
}
async function removerPeriodoLojas(periodo, usuario) {
  const db = requireDb(await getDb());
  await db.delete(lojasPeriodos).where(eq(lojasPeriodos.periodo, periodo));
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "lojas_periodos",
    registro: periodo,
    campo: "periodo",
    valorAntigo: "existia",
    valorNovo: "removido"
  });
}
async function importarLote(lojas, rankings, usuario) {
  const db = requireDb(await getDb());
  const periodosDoLote = Array.from(new Set(lojas.map((l) => l.periodo)));
  for (const p of periodosDoLote) {
    await db.delete(rankingVendedores).where(eq(rankingVendedores.periodo, p));
    await db.delete(lojasPeriodos).where(eq(lojasPeriodos.periodo, p));
  }
  for (const l of lojas) {
    await db.insert(lojasPeriodos).values({
      periodo: l.periodo,
      loja: l.loja,
      vendasTotal: l.vendasTotal,
      meta: l.meta
    });
  }
  for (const r of rankings) {
    for (let i = 0; i < r.vendedores.length; i++) {
      await db.insert(rankingVendedores).values({
        periodo: r.periodo,
        loja: r.loja,
        posicao: i + 1,
        vendedor: r.vendedores[i].vendedor,
        vendas: Math.round(r.vendedores[i].vendas * 100) / 100,
        isDeleted: 0
      });
    }
  }
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "importacao_lote",
    registro: periodosDoLote.join(","),
    campo: "lojas,ranking",
    valorAntigo: null,
    valorNovo: `${lojas.length} loja(s), ${rankings.reduce((s, r) => s + r.vendedores.length, 0)} vendedor(es)`
  });
}
async function resetarParaOficiais(usuario) {
  const db = requireDb(await getDb());
  await db.delete(auditLog).where(eq(auditLog.id, 0));
  await db.delete(rankingVendedores).where(eq(rankingVendedores.isDeleted, 0));
  await db.delete(lojasPeriodos);
  await db.insert(auditLog).values({
    usuario: usuario ?? null,
    tabela: "reset_oficial",
    registro: "todos",
    campo: "lojas,ranking",
    valorAntigo: "dados do banco",
    valorNovo: "dados oficiais embutidos (Maio, Junho, Julho)"
  });
}
async function insereBackup(meta) {
  const db = requireDb(await getDb());
  return db.insert(backupSnapshots).values(meta);
}
async function listarBackups() {
  const db = requireDb(await getDb());
  return db.select().from(backupSnapshots).orderBy(desc(backupSnapshots.criadoEm)).limit(50);
}
async function listarAuditoria(limit = 200) {
  const db = requireDb(await getDb());
  return db.select().from(auditLog).orderBy(desc(auditLog.criadoEm)).limit(limit);
}
async function snapshotCompleto() {
  const db = requireDb(await getDb());
  const lojas = await db.select().from(lojasPeriodos).orderBy(asc(lojasPeriodos.periodo), asc(lojasPeriodos.loja));
  const rankings = await db.select().from(rankingVendedores).where(eq(rankingVendedores.isDeleted, 0)).orderBy(asc(rankingVendedores.periodo), asc(rankingVendedores.loja), asc(rankingVendedores.posicao));
  const auditoria = await db.select().from(auditLog).orderBy(desc(auditLog.criadoEm));
  return { geradoEm: (/* @__PURE__ */ new Date()).toISOString(), lojas, rankings, auditoria };
}

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    loginExternal: publicProcedure.input(z2.object({ email: z2.string().email(), password: z2.string().min(1).max(256) })).mutation(async ({ input, ctx }) => {
      if (!isExternalAuthEnabled()) throw new Error("Login externo n\xE3o est\xE1 habilitado neste ambiente.");
      const user = await authenticateExternalLogin(input.email, input.password);
      if (!user) throw new Error("Credenciais inv\xE1lidas.");
      await issueExternalSession(ctx.req, ctx.res, user);
      return { success: true };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // --- BI Richesse (persistência em banco) ---
  bi: router({
    listLojas: publicProcedure.query(() => listLojasPeriodos()),
    listRankings: publicProcedure.query(() => listRankings()),
    salvarLoja: adminProcedure.input(
      z2.object({
        periodo: z2.string().max(32),
        loja: z2.string().max(128),
        vendasTotal: z2.number(),
        meta: z2.number()
      })
    ).mutation(
      ({ input, ctx }) => salvarLojaPeriodo(input.periodo, input.loja, input.vendasTotal, input.meta, ctx.user?.name ?? void 0)
    ),
    adicionarPeriodo: adminProcedure.input(z2.object({ periodo: z2.string().max(32) })).mutation(({ input, ctx }) => adicionarPeriodo(input.periodo, ctx.user?.name ?? void 0)),
    substituirRanking: adminProcedure.input(
      z2.object({
        periodo: z2.string().max(32),
        loja: z2.string().max(128),
        vendedores: z2.array(z2.object({ vendedor: z2.string().max(128), vendas: z2.number() }))
      })
    ).mutation(
      ({ input, ctx }) => substituirRanking(input.periodo, input.loja, input.vendedores, ctx.user?.name ?? void 0)
    ),
    inserirRankingsEmLote: adminProcedure.input(
      z2.object({
        entradas: z2.array(
          z2.object({
            periodo: z2.string().max(32),
            loja: z2.string().max(128),
            vendedores: z2.array(z2.object({ vendedor: z2.string().max(128), vendas: z2.number() }))
          })
        )
      })
    ).mutation(({ input, ctx }) => inserirRankingsEmLote(input.entradas, ctx.user?.name ?? void 0)),
    removerVendedor: adminProcedure.input(z2.object({ id: z2.number() })).mutation(({ input, ctx }) => removerVendedor(input.id, ctx.user?.name ?? void 0)),
    removerPeriodo: adminProcedure.input(z2.object({ periodo: z2.string().max(32) })).mutation(async ({ input, ctx }) => {
      const user = ctx.user?.name ?? void 0;
      await removerPeriodoRankings(input.periodo, user);
      await removerPeriodoLojas(input.periodo, user);
    }),
    importarLote: adminProcedure.input(
      z2.object({
        lojas: z2.array(
          z2.object({
            periodo: z2.string().max(32),
            loja: z2.string().max(128),
            vendasTotal: z2.number(),
            meta: z2.number()
          })
        ),
        rankings: z2.array(
          z2.object({
            periodo: z2.string().max(32),
            loja: z2.string().max(128),
            vendedores: z2.array(z2.object({ vendedor: z2.string().max(128), vendas: z2.number() }))
          })
        )
      })
    ).mutation(
      ({ input, ctx }) => importarLote(input.lojas, input.rankings, ctx.user?.name ?? void 0)
    ),
    listarAuditoria: adminProcedure.input(z2.object({ limit: z2.number().min(1).max(500).default(200) }).optional()).query(({ input }) => listarAuditoria(input?.limit ?? 200)),
    criarBackup: adminProcedure.mutation(async ({ ctx }) => {
      const user = ctx.user?.name ?? void 0;
      const snapshot = await snapshotCompleto();
      const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const payload = JSON.stringify(snapshot);
      const res = await storagePut2(`backups/bi-richesse-${stamp}.json`, payload, "application/json; charset=utf-8");
      await insereBackup({
        storageKey: res.key,
        usuario: user ?? null,
        tipo: "manual",
        descricao: `Backup autom\xE1tico \u2014 ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
        registrosLojas: snapshot.lojas.length,
        registrosRanking: snapshot.rankings.length
      });
      return { ok: true, storageKey: res.key, url: res.url, registrosLojas: snapshot.lojas.length, registrosRanking: snapshot.rankings.length };
    }),
    listarBackups: adminProcedure.query(() => listarBackups()),
    resetarBanco: adminProcedure.input(z2.object({}).optional()).mutation(async ({ ctx }) => {
      const user = ctx.user?.name ?? void 0;
      await resetarParaOficiais(user);
      const { lojasPeriodos: OFICIAIS_LOJAS, rankingVendedores: OFICIAIS_RANKING } = await Promise.resolve().then(() => (init_data(), data_exports));
      await importarLote(
        OFICIAIS_LOJAS.map((l) => ({ periodo: l.periodo, loja: l.loja, vendasTotal: l.vendas_total, meta: l.meta })),
        OFICIAIS_RANKING.map((r) => ({
          periodo: r.periodo,
          loja: r.loja,
          vendedores: OFICIAIS_RANKING.filter((x) => x.loja === r.loja && x.periodo === r.periodo).map((v) => ({ vendedor: v.vendedor, vendas: v.vendas }))
        })),
        user
      );
    })
  })
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader2 } from "cookie";
import { SignJWT as SignJWT2, jwtVerify as jwtVerify2 } from "jose";
init_env();
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader2(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT2({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify2(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = isExternalAuthEnabled() ? await authenticateExternalRequest(opts.req) : await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/vercel-trpc.ts
var app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use((req, _res, next) => {
  if (req.url === "/api/trpc") req.url = "/";
  else if (req.url.startsWith("/api/trpc/")) req.url = req.url.slice("/api/trpc".length);
  next();
});
app.use("/", createExpressMiddleware({ router: appRouter, createContext }));
var vercel_trpc_default = app;
export {
  vercel_trpc_default as default
};
