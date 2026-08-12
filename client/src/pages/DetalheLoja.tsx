/**
 * Estilo: Executive Ledger — Página 2 "Detalhe da Loja".
 * Segmentações loja + periodo; cartões KPI (incluindo melhor vendedor);
 * tabela de ranking por posição; barras horizontais de vendas por vendedor;
 * colunas vendas vs meta por período. Dados vivos via DataStore.
 */
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  Cell,
} from "recharts";
import { Award, UserRound } from "lucide-react";
import { Header, FiltrosDashboard, KpiCard, Panel, DataBar, fmtPct } from "@/components/bi/shared";
import { Filtros, fmtMoeda, totalVendas, totalMeta } from "@/lib/data";
import { useDataStore, usePeriodosDisponiveis } from "@/lib/dataStore";
import { useFiltrar } from "@/lib/useFiltrar";

export default function DetalheLoja() {
  const [filtros, setFiltros] = useState<Filtros>({
    loja: "Richesse Oeste",
    periodo: "Maio",
  });

  const store = useDataStore();
  const periodosVivos = usePeriodosDisponiveis();

  // Garantir que seleções ainda existam após edições
  const filtrosValidos: Filtros = useMemo(() => {
    const f = { ...filtros };
    if (f.periodo && !periodosVivos.includes(f.periodo)) f.periodo = periodosVivos[0];
    const lojasDoPeriodo = store.lojasDoPeriodo(f.periodo ?? "");
    if (f.loja && !lojasDoPeriodo.includes(f.loja)) f.loja = lojasDoPeriodo[0];
    return f;
  }, [filtros, periodosVivos, store]);

  const { registros, ranking, vendas, meta, ating, dif, melhor } = useFiltrar(filtrosValidos);

  const periodoSelecionado = filtrosValidos.periodo ?? periodosVivos[0];
  const lojaSelecionada = filtrosValidos.loja ?? store.lojasDoPeriodo(filtrosValidos.periodo ?? "")[0];

  const chartVendedores = useMemo(
    () => [...ranking].sort((a, b) => b.vendas - a.vendas),
    [ranking],
  );

  // Vendas vs meta por período — somente a loja selecionada
  const chartPeriodos = useMemo(
    () =>
      periodosVivos.map((p) => {
        const reg = store.lojasPeriodos.filter((r) => r.loja === lojaSelecionada && r.periodo === p);
        return {
          periodo: p,
          vendas: totalVendas(reg),
          meta: totalMeta(reg),
        };
      }),
    [lojaSelecionada, periodosVivos, store.lojasPeriodos],
  );

  return (
    <div className="min-h-screen bg-background">
      <Header titulo="Detalhe da Loja" />

      <main className="container pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 pt-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy">{lojaSelecionada}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Período selecionado: <span className="font-medium text-foreground">{periodoSelecionado}</span> ·
              total oficial da loja conforme a seleção
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <FiltrosDashboard
              filtros={filtrosValidos}
              setFiltros={setFiltros}
              compact
              periodos={periodosVivos}
              lojas={store.lojasDoPeriodo(filtrosValidos.periodo ?? "")}
            />
          </div>
        </div>

        {/* Cartões KPI */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Total Vendas" valor={fmtMil(vendas)} sub={fmtMoeda(vendas)} destaque delay={0} />
          <KpiCard label="Total Meta" valor={fmtMil(meta)} sub={fmtMoeda(meta)} delay={50} />
          <KpiCard
            label="Atingimento %"
            valor={fmtPct(ating)}
            status={ating >= 1 ? "success" : ating >= 0.8 ? "warning" : "danger"}
            destaque
            delay={100}
          />
          <KpiCard
            label="Diferença Meta"
            valor={fmtMil(dif)}
            sub={fmtMoeda(dif)}
            status={dif >= 0 ? "success" : "danger"}
            delay={150}
          />
          <KpiCard
            label="Melhor Vendedor"
            valor={melhor ? melhor.vendedor : "—"}
            sub={melhor ? fmtMoeda(melhor.vendas) : undefined}
            delay={200}
          />
          <KpiCard
            label="Vendas do Melhor Vendedor"
            valor={melhor ? fmtMil(melhor.vendas) : "—"}
            sub={
              melhor
                ? `${fmtMoeda(melhor.vendas)} · Posição nº ${ranking.find((r) => r.vendas === melhor.vendas)?.posicao ?? "—"}`
                : undefined
            }
            delay={250}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Ranking — tabela */}
          <Panel
            titulo={`Ranking de vendedores — ${periodoSelecionado}`}
            subtitulo={
              ranking.length > 0
                ? `${ranking.length} vendedor(es) informado(s) no documento`
                : "Nenhum vendedor informado para os filtros selecionados"
            }
            className="lg:col-span-3"
          >
            {ranking.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="w-14 py-2 pr-3 font-semibold text-muted-foreground">Pos.</th>
                      <th className="py-2 pr-3 font-semibold text-muted-foreground">Vendedor</th>
                      <th className="w-44 px-3 py-2 font-semibold text-muted-foreground">Vendas</th>
                      <th className="px-3 py-2 font-semibold text-muted-foreground" />
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((r) => {
                      const maxVendas = ranking[0]?.vendas ?? 1;
                      const primeiro = r.posicao === 1;
                      return (
                        <tr key={`${r.loja}|${r.vendedor}|${r.posicao}`} className="border-b border-border/60 last:border-0">
                          <td className="py-2.5 pr-3">
                            {primeiro ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/20 text-[11px] font-bold text-[#8a5d00]">
                                <Award className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                                {r.posicao}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 pr-3 font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              {primeiro && <span className="text-warning">★</span>}
                              {r.vendedor}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="mb-1 text-right font-semibold tabular-nums text-navy">{fmtMoeda(r.vendas)}</div>
                            <DataBar valor={r.vendas / maxVendas} cor="#17365D" />
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground tabular-nums">
                              {((r.vendas / maxVendas) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}% do 1º
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <UserRound className="h-8 w-8 opacity-40" />
                <p className="text-sm">Nenhum ranking disponível para os filtros atuais.</p>
              </div>
            )}
          </Panel>

          {/* Gráficos */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Panel
              titulo="Vendas por vendedor"
              subtitulo={`Ordenado por vendas decrescente — ${periodoSelecionado}`}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartVendedores} layout="vertical" margin={{ top: 4, right: 56, left: 0, bottom: 4 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="2 4" stroke="#e3e8ed" />
                    <XAxis type="number" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="vendedor"
                      width={145}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(v: number) => [fmtMoeda(v), "Vendas"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e3e8ed", fontSize: 12 }}
                    />
                    <Bar dataKey="vendas" radius={[0, 3, 3, 0]} maxBarSize={20}>
                      <LabelList dataKey="vendas" position="right" formatter={(v: number) => fmtMoeda(v)} style={{ fontSize: 10, fill: "#64748b" }} />
                      {chartVendedores.map((d, i) => (
                        <Cell key={i} fill={i === 0 ? "#2E7D32" : "#17365D"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel titulo="Vendas vs Meta por período" subtitulo="Somente a loja selecionada">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartPeriodos} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                    <CartesianGrid vertical={false} strokeDasharray="2 4" stroke="#e3e8ed" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number, name: string) => [fmtMoeda(v), name === "vendas" ? "Vendas" : "Meta"]} contentStyle={{ borderRadius: 8, border: "1px solid #e3e8ed", fontSize: 12 }} />
                    <Legend formatter={(v: string) => (v === "vendas" ? "Vendas" : "Meta")} />
                    <Bar dataKey="vendas" name="vendas" fill="#17365D" radius={[3, 3, 0, 0]} maxBarSize={40}>
                      <LabelList dataKey="vendas" position="top" formatter={(v: number) => fmtMoeda(v)} style={{ fontSize: 10, fill: "#33415c" }} />
                    </Bar>
                    <Bar dataKey="meta" name="meta" fill="#9fb4d4" radius={[3, 3, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}

function fmtMil(v: number): string {
  const abs = Math.abs(v);
  const sinal = v < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const milhao = abs / 1_000_000;
    const inteiro = Math.floor(milhao);
    const decimal = Math.round((milhao - inteiro) * 10);
    return `${sinal}R$ ${inteiro}${decimal > 0 ? `,${decimal}` : ""} milh${milhao >= 2 ? "ões" : "ão"}`;
  }
  const mil = Math.round(abs / 1000);
  return `${sinal}R$ ${mil.toLocaleString("pt-BR")} mil`;
}
