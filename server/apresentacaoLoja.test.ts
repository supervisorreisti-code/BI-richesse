import { describe, expect, it } from "vitest";
import { ordenarLojasParaApresentacao, ordenarPeriodosParaApresentacao } from "../client/src/lib/apresentacaoLoja";

describe("apresentação por loja", () => {
  it("prioriza Eventos e segue a ordem definida para reuniões", () => {
    expect(ordenarLojasParaApresentacao(["Richesse Prime", "Richesse Marista", "Richesse Flamboyant", "Richesse Eventos"])).toEqual([
      "Richesse Eventos",
      "Richesse Flamboyant",
      "Richesse Marista",
      "Richesse Prime",
    ]);
  });

  it("ordena os períodos cronologicamente", () => {
    expect(ordenarPeriodosParaApresentacao(["Julho", "Maio", "Junho"])).toEqual(["Maio", "Junho", "Julho"]);
  });
});
