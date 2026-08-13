// Teste funcional: importarLote e resetarBanco via API tRPC do dev server
const BASE = "http://localhost:3000/api/trpc/";

async function rpc(name, input) {
  const payload = input === undefined ? "" : `?input=${encodeURIComponent(JSON.stringify({ json: input }))}`;
  const res = await fetch(`${BASE}bi.${name}${payload}`, {
    method: input === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: input === undefined ? null : JSON.stringify({ json: input }),
  });
  const txt = await res.text();
  return { status: res.status, body: txt.slice(0, 300) };
}

(async () => {
  console.log("1. listar (pre):");
  console.log(await rpc("listLojas", undefined));

  console.log("\n2. importarLote (período Teste 2099):");
  const lote = {
    lojas: [
      { periodo: "Teste 2099", loja: "Richesse Teste", vendasTotal: 123456, meta: 200000 },
    ],
    rankings: [
      { periodo: "Teste 2099", loja: "Richesse Teste", vendedores: [{ vendedor: "Fulano", vendas: 123456 }] },
    ],
  };
  console.log(await rpc("importarLote", lote));

  console.log("\n3. listar (pós import):");
  const r3 = await rpc("listLojas", undefined);
  console.log(r3.status, r3.body.includes("Richesse Teste") ? "OK - Teste 2099 presente" : "FALHA", r3.body.slice(0, 150));

  console.log("\n4. remover periodo de teste:");
  console.log(await rpc("removerPeriodo", { periodo: "Teste 2099" }));

  console.log("\n5. listar (pós remoção):");
  const r5 = await rpc("listLojas", undefined);
  console.log(r5.status, r5.body.includes("Richesse Teste") ? "FALHA - ainda presente" : "OK - removido");
})();
