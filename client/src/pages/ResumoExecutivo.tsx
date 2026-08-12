/**
 * Estilo: Executive Ledger — Página "Resumo Executivo".
 * Uma tela só, sem rolagem (projetada para vídeo-chamadas e apresentações):
 * 4 KPIs grandes + ranking completo das lojas + destaques (melhor/pior loja e
 * melhor vendedor), tudo visível no viewport de 16:9.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useDataStore, usePeriodosDisponiveis } from "@/lib/dataStore";
import { useFiltrar } from "@/lib/useFiltrar";
import { Filtros, fmtMoeda, fmtPercentual } from "@/lib/data";
import { Panel, StatusChip, DataBar, corStatus } from "@/components/bi/shared";
import { cn } from "@/lib/utils";
import { TrendingUp, Award, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

export default function ResumoExecutivo() {
  const store = useDataStore();
  const periodosVivos = usePeriodosDisponiveis();
  const [periodo, setPeriodo] = useState<string | undefined>(periodosVivos[0]);

  const filtros: Filtros = useMemo(() => ({ periodo }), [periodo]);
  const filtrosValidos: Filtros = useMemo(() => {
    if (filtros.periodo && !periodosVivos.includes(filtros.periodo)) {
      return { ...filtros, periodo: periodosVivos[0] };
    }
    return filtros;
  }, [filtros, periodosVivos]);

  const { ranking, vendas, meta, ating, dif, melhor } = useFiltrar(filtrosValidos);

  // Ordem cronológica dos períodos (meses do ano), para achar o mês anterior
  const periodosOrdenados = useMemo(
    () => [...periodosVivos].sort((a, b) => ordemMes(a) - ordemMes(b)),
    [periodosVivos],
  );
  const indice = filtrosValidos.periodo ? periodosOrdenados.indexOf(filtrosValidos.periodo) : -1;
  const periodoAnterior = indice > 0 ? periodosOrdenados[indice - 1] : undefined;

  // Atingimento consolidado do mês anterior (para delta no KPI)
  const dadosAnteriores = useMemo(() => {
    if (!periodoAnterior) return undefined;
    const regs = store.lojasPeriodos.filter((r) => r.periodo === periodoAnterior);
    const m = regs.reduce((s, r) => s + r.meta, 0);
    const v = regs.reduce((s, r) => s + r.vendas_total, 0);
    return { ating: m > 0 ? v / m : 0 };
  }, [store.lojasPeriodos, periodoAnterior]);
  const deltaAting = dadosAnteriores && periodosOrdenados.length > 1 ? ating - dadosAnteriores.ating : undefined;

  // Atingimento de cada loja no mês anterior (para a coluna de variação)
  const anteriorPorLoja = useMemo(() => {
    const map = new Map<string, number>();
    if (!periodoAnterior) return map;
    for (const r of store.lojasPeriodos.filter((x) => x.periodo === periodoAnterior)) {
      if (r.meta > 0) map.set(r.loja, r.vendas_total / r.meta);
    }
    return map;
  }, [store.lojasPeriodos, periodoAnterior]);

  const linhas = useMemo(
    () =>
      [...ranking]
        .filter((r) => !filtrosValidos.loja || r.loja === filtrosValidos.loja)
        .sort((a, b) => b.vendas - a.vendas),
    [ranking, filtrosValidos.loja],
  );

  // Dados consolidados de lojas do período (com atingimento e diferença)
  const lojasDoPeriodo = useMemo(
    () =>
      store.lojasPeriodos
        .filter((r) => r.periodo === filtrosValidos.periodo)
        .sort((a, b) => b.atingimento_percentual - a.atingimento_percentual),
    [store.lojasPeriodos, filtrosValidos.periodo],
  );

  const melhorLoja = lojasDoPeriodo[0];
  const piorLoja = lojasDoPeriodo[linhas.length - 1];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Barra superior compacta */}
      <header className="bg-navy text-primary-foreground">
        <div className="container flex items-center justify-between py-2.5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20">
              <span className="font-display text-sm font-bold tracking-tight">
                R<span className="text-warning">.</span>
              </span>
            </span>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold">BI Comercial Richesse</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-white/60">Resumo Executivo</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-white/60">Período</span>
              <select
                className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white outline-none"
                value={filtrosValidos.periodo ?? periodosVivos[0]}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                {periodosVivos.map((p) => (
                  <option key={p} value={p} className="text-foreground">
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Voltar ao painel
            </Link>
          </div>
        </div>
      </header>

      {/* Corpo em grid único, sem rolagem */}
      <main className="container flex flex-1 flex-col gap-4 overflow-hidden py-4">
        {/* Título + KPIs */}
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">
            BI Comercial Richesse — {filtrosValidos.periodo ?? periodosVivos[0]}
          </h1>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiGrande label="Total de Vendas" valor={`R$ ${fmtMil(vendas)}`} sub={fmtMoeda(vendas)} cor="navy" />
            <KpiGrande label="Total de Meta" valor={`R$ ${fmtMil(meta)}`} sub={fmtMoeda(meta)} cor="slate" />
            <KpiGrande
              label="Atingimento %"
              valor={fmtPercentual(ating)}
              cor={ating >= 1 ? "success" : ating >= 0.8 ? "warning" : "danger"}
              destaque
              delta={deltaAting !== undefined ? fmtPontosPercentuais(deltaAting) : undefined}
              positivo={deltaAting !== undefined ? deltaAting >= 0 : undefined}
            />
            <KpiGrande
              label="Diferença Meta"
              valor={`${dif >= 0 ? "" : "-"}R$ ${fmtMil(Math.abs(dif))}`}
              sub={fmtMoeda(dif)}
              cor={dif >= 0 ? "success" : "danger"}
            />
          </div>
        </div>

        {/* Destaques + Ranking (duas colunas, preenchem a altura restante) */}
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-3">
          {/* Destaques */}
          <div className="flex flex-col gap-3">
            <Panel titulo="Destaques do período" className="flex-1">
              <div className="flex flex-col gap-3">
                <Destaque
                  icon={<Award className="h-5 w-5" />}
                  cor="success"
                  titulo="Melhor loja"
                  valor={melhorLoja?.loja ?? "—"}
                  sub={
                    melhorLoja
                      ? `${fmtPercentual(melhorLoja.atingimento_percentual)} de atingimento · ${fmtMoeda(melhorLoja.vendas_total)} em vendas`
                      : undefined
                  }
                />
                {piorLoja && melhorLoja?.loja !== piorLoja.loja && (
                  <Destaque
                    icon={<AlertTriangle className="h-5 w-5" />}
                    cor="danger"
                    titulo="Loja com maior gap"
                    valor={piorLoja.loja}
                    sub={`${fmtPercentual(piorLoja.atingimento_percentual)} de atingimento · falta ${fmtMoeda(Math.abs(piorLoja.diferenca_meta))}`}
                  />
                )}
                {melhor && (
                  <Destaque
                    icon={<TrendingUp className="h-5 w-5" />}
                    cor="navy"
                    titulo="Melhor vendedor"
                    valor={melhor.vendedor}
                    sub={`${fmtMoeda(melhor.vendas)} em vendas`}
                  />
                )}
              </div>
            </Panel>
            <div className="rounded-lg border bg-navy p-4 text-primary-foreground">
              <div className="text-[10px] uppercase tracking-[0.14em] text-white/60">Leitura rápida</div>
              <p className="mt-1.5 text-sm leading-snug text-white/90">
                {ating >= 1
                  ? `Meta consolidada atingida em ${fmtPercentual(ating)}. Parabéns à equipe!`
                  : ating >= 0.8
                    ? `Consolidado em ${fmtPercentual(ating)} — próximo da meta, falta ${fmtMoeda(Math.abs(dif))} para fechar.`
                    : `Consolidado em ${fmtPercentual(ating)} — gap de ${fmtMoeda(Math.abs(dif))} para a meta. Foco nas lojas com menor atingimento.`}
              </p>
            </div>
          </div>

          {/* Ranking das lojas */}
          <Panel titulo="Ranking das lojas por atingimento" subtitulo="Ordenado do maior para o menor atingimento" className="flex min-h-0 flex-col lg:col-span-2">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-left">
                    <th className="py-1.5 pr-3 text-[11px] font-semibold text-muted-foreground">Pos.</th>
                    <th className="py-1.5 pr-3 text-[11px] font-semibold text-muted-foreground">Loja</th>
                    <th className="px-3 py-1.5 text-right text-[11px] font-semibold text-muted-foreground">Vendas</th>
                    <th className="px-3 py-1.5 text-right text-[11px] font-semibold text-muted-foreground">Meta</th>
                    {periodoAnterior && (
                      <th className="px-3 py-1.5 text-right text-[11px] font-semibold text-muted-foreground">
                        Variação vs {periodoAnterior}
                      </th>
                    )}
                    <th className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">Atingimento</th>
                    <th className="pl-3 py-1.5 text-right text-[11px] font-semibold text-muted-foreground">Diferença</th>
                    <th className="pl-3 py-1.5 text-[11px] font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lojasDoPeriodo.map((r, i) => (
                    <tr key={r.loja} className="border-b border-border/60 last:border-0 align-top">
                      <td className="py-2 pr-3">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy/10 text-[11px] font-semibold text-navy">
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-2 pr-3 font-medium text-foreground">{r.loja}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmtMoeda(r.vendas_total)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{fmtMoeda(r.meta)}</td>
                      {periodoAnterior && (
                        <td className="px-3 py-2 text-right text-xs font-medium">
                          {anteriorPorLoja.has(r.loja) ? (
                            <Variacao delta={r.atingimento_percentual - (anteriorPorLoja.get(r.loja) ?? 0)} />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      )}
                      <td className="w-36 px-3 py-2">
                        <div className="mb-0.5 text-right">
                          <span
                            className={cn(
                              "font-semibold tabular-nums",
                              corStatus(r.atingimento_percentual) === "#C62828"
                                ? "text-danger"
                                : corStatus(r.atingimento_percentual) === "#F9A825"
                                  ? "text-[#8a5d00]"
                                  : "text-success",
                            )}
                          >
                            {fmtPercentual(r.atingimento_percentual)}
                          </span>
                        </div>
                        <DataBar valor={r.atingimento_percentual} cor={corStatus(r.atingimento_percentual)} />
                      </td>
                      <td
                        className={cn(
                          "pl-3 py-2 text-right tabular-nums",
                          r.diferenca_meta >= 0 ? "text-success" : "text-danger",
                        )}
                      >
                        {r.diferenca_meta >= 0 ? "R$ 0" : fmtMoeda(r.diferenca_meta)}
                      </td>
                      <td className="pl-3 py-2">
                        <StatusChip atingimento={r.atingimento_percentual} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </main>
    </div>
  );
}

function KpiGrande({
  label,
  valor,
  sub,
  cor,
  destaque,
  delta,
  positivo,
}: {
  label: string;
  valor: string;
  sub?: string;
  cor: "navy" | "slate" | "success" | "warning" | "danger";
  destaque?: boolean;
  delta?: string;
  positivo?: boolean;
}) {
  const corValor =
    cor === "success"
      ? "text-success"
      : cor === "warning"
        ? "text-warning"
        : cor === "danger"
          ? "text-danger"
          : cor === "navy"
            ? "text-navy"
            : "text-foreground";
  return (
    <div className="rise-in relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
      {destaque && (
        <span className={cn("absolute right-0 top-0 h-1.5 w-full", corValor === "text-danger" ? "bg-danger" : corValor === "text-warning" ? "bg-warning" : corValor === "text-success" ? "bg-success" : "bg-navy")} />
      )}
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className={cn("font-display text-3xl font-bold tabular-nums", corValor)}>{valor}</div>
        {delta !== undefined && (
          <span className={positivo ? "text-success" : "text-danger"}>
            <span className="mr-0.5 inline-flex">
              {positivo ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
            </span>
            <span className="text-xs font-semibold tabular-nums">{delta}</span>
          </span>
        )}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Destaque({
  icon,
  cor,
  titulo,
  valor,
  sub,
}: {
  icon: React.ReactNode;
  cor: "success" | "danger" | "navy";
  titulo: string;
  valor: string;
  sub?: string;
}) {
  const bg = cor === "success" ? "bg-success/10 text-success" : cor === "danger" ? "bg-danger/10 text-danger" : "bg-navy/10 text-navy";
  return (
    <div className="flex items-start gap-3 rounded-md border border-border p-3">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", bg)}>{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{titulo}</div>
        <div className="truncate font-display text-lg font-bold text-foreground">{valor}</div>
        {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

function ordemMes(p: string): number {
  const MESES = ["janeiro", "fevereiro", "março", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return MESES.indexOf(p.toLowerCase());
}

function fmtPontosPercentuais(delta: number): string {
  const pp = Math.round(delta * 100);
  const sinal = pp >= 0 ? "+" : "";
  return `${sinal}${pp.toLocaleString("pt-BR")} p.p.`;
}

function Variacao({ delta }: { delta: number }) {
  const positivo = delta >= 0;
  return (
    <span className={positivo ? "text-success" : "text-danger"}>
      <span className="mr-1 inline-flex">
        {positivo ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      </span>
      <span className="tabular-nums">{fmtPontosPercentuais(delta)}</span>
    </span>
  );
}

function fmtMil(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) {
    const milhao = abs / 1_000_000;
    const inteiro = Math.floor(milhao);
    const decimal = Math.round((milhao - inteiro) * 10);
    return `${inteiro}${decimal > 0 ? `,${decimal}` : ""} milh${milhao >= 2 ? "ões" : "ão"}`;
  }
  const mil = Math.round(abs / 1000);
  return `${mil.toLocaleString("pt-BR")} mil`;
}
