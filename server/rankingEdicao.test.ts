import { describe, expect, it } from "vitest";
import { atualizarRegistroDoRanking } from "@shared/ranking";

const eventosJulho = {
  loja: "Richesse Eventos",
  periodo: "Julho",
  vendedor: "Ludmilla",
  vendas: 286_000,
  posicao: 1,
};

describe("atualizarRegistroDoRanking", () => {
  it("renomeia um vendedor sem criar uma segunda linha", () => {
    const resultado = atualizarRegistroDoRanking(
      [eventosJulho],
      { ...eventosJulho, vendedor: "Cristina" },
      "Ludmilla",
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toMatchObject({ vendedor: "Cristina", vendas: 286_000, posicao: 1 });
  });

  it("mantém atualizações de valor na mesma linha", () => {
    const resultado = atualizarRegistroDoRanking(
      [{ ...eventosJulho, vendedor: "Cristina" }],
      { ...eventosJulho, vendedor: "Cristina", vendas: 300_000 },
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0].vendas).toBe(300_000);
  });

  it("adiciona um vendedor quando não há registro anterior", () => {
    const resultado = atualizarRegistroDoRanking(
      [eventosJulho],
      { ...eventosJulho, vendedor: "Cristina", vendas: 100_000, posicao: 2 },
    );

    expect(resultado).toHaveLength(2);
    expect(resultado.map((r) => r.vendedor)).toEqual(["Ludmilla", "Cristina"]);
  });
});
