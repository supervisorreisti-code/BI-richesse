import { describe, expect, it } from "vitest";
import { participacaoNasVendasDaLoja } from "@shared/ranking";

describe("participacaoNasVendasDaLoja", () => {
  it("calcula cada vendedor sobre o total mensal oficial da própria loja", () => {
    expect(participacaoNasVendasDaLoja(99_000, 527_000)).toBeCloseTo(0.1878558, 6);
    expect(participacaoNasVendasDaLoja(128_000, 876_000)).toBeCloseTo(0.1461187, 6);
    expect(participacaoNasVendasDaLoja(286_000, 286_000)).toBe(1);
  });

  it("não usa o líder do ranking como denominador", () => {
    const lider = 99_000;
    const vendedoraSeguinte = 66_000;
    const vendasTotaisDaLoja = 527_000;

    expect(participacaoNasVendasDaLoja(lider, vendasTotaisDaLoja)).toBeCloseTo(0.188, 3);
    expect(participacaoNasVendasDaLoja(vendedoraSeguinte, vendasTotaisDaLoja)).toBeCloseTo(0.125, 3);
    expect(participacaoNasVendasDaLoja(vendedoraSeguinte, vendasTotaisDaLoja)).not.toBeCloseTo(
      vendedoraSeguinte / lider,
      3,
    );
  });

  it("evita percentuais inválidos quando a loja não possui vendas registradas", () => {
    expect(participacaoNasVendasDaLoja(10_000, 0)).toBe(0);
    expect(participacaoNasVendasDaLoja(10_000, -1)).toBe(0);
  });
});
