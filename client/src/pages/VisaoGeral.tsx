/**
 * Estilo: Executive Ledger — Página 1 "Visão Geral".
 * Título "BI Comercial Richesse — Maio", 4 cartões KPI, tabela por loja com
 * status e data bars, gráfico de barras de atingimento e colunas vendas vs meta.
 * Dados vivos via DataStore (usuário pode editar via Admin).
 */
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LabelList,
} from "recharts";
import { Header, FiltrosDashboard, KpiCard, StatusChip, DataBar, Panel, fmtPct, corStatus } from "@/components/bi/shared";
import EvolucaoLojas from "@/components/bi/EvolucaoLojas";
import ModalApresentacao, { BotaoApresentar } from "@/components/bi/ModalApresentacao";
import { Filtros, fmtMoeda } from "@/lib/data";
import { useDataStore, usePeriodosDisponiveis } from "@/lib/dataStore";
import { useFiltrar } from "@/lib/useFiltrar";

export default function VisaoGeral() {
  const [filtros, setFiltros] = useState<Filtros>({ periodo: "Maio" });
  const [apresentar, setApresentar] = useState(false);

  const store = useDataStore();
  const periodosVivos = usePeriodosDisponiveis();

  // Garantir que o período selecionado ainda exista após edições
  const filtrosValidos: Filtros = useMemo(() => {
    if (filtros.periodo && !periodosVivos.includes(filtros.periodo)) {
      return { ...filtros, periodo: periodosVivos[0] };
    }
    return filtros;
  }, [filtros, periodosVivos]);

  // Lojas do período selecionado, atualizada em tempo real pelo DataStore
  const lojasVivas = store.lojasDoPeriodo(filtrosValidos.periodo ?? "");

  const { registros, vendas, meta, ating, dif } = useFiltrar(filtrosValidos);

  const periodos = Array.from(new Set(registros.map((r) => r.periodo)));
  const tituloPeriodo = periodos.length === 1 ? periodos[0] : periodos.join(" · ");

  // Tabela: melhor atingimento primeiro
  const linhas = useMemo(
    () =>
      [...registros]
        .filter((r) => (!filtrosValidos.loja || r.loja === filtrosValidos.loja))
        .sort((a, b) => b.atingimento_percentual - a.atingimento_percentual),
    [registros, filtrosValidos.loja],
  );

  const chartAtingimento = useMemo(
    () =>
      [...registros]
        .filter((r) => (!filtrosValidos.loja || r.loja === filtrosValidos.loja))
        .sort((a, b) => b.atingimento_percentual - a.atingimento_percentual)
        .filter((r) => r.vendas_total > 0 || r.meta > 0)
        .map((r) => ({
          loja: r.loja,
          atingimento: r.atingimento_percentual * 100,
          cor: corStatus(r.atingimento_percentual),
        })),
    [registros, filtrosValidos.loja],
  );

  const chartVendasMeta = useMemo(
    () =>
      [...registros]
        .filter((r) => (!filtrosValidos.loja || r.loja === filtrosValidos.loja))
        .sort((a, b) => b.vendas_total - a.vendas_total)
        .map((r) => ({
          loja: r.loja,
          vendas: r.vendas_total,
          meta: r.meta,
        })),
    [registros, filtrosValidos.loja],
  );

  // Mini-timeline: atingimento por loja em TODOS os períodos do store
  const chartEvolucao = useMemo(() => {
    const todosRegistros = store.lojasPeriodos;
    const todosPeriodos = Array.from(new Set(todosRegistros.map((r) => r.periodo)));
    if (todosPeriodos.length < 2) return null;
    const lojasFiltradas = filtrosValidos.loja
      ? todosRegistros.filter((r) => r.loja === filtrosValidos.loja)
      : todosRegistros;
    const lojasSet = Array.from(new Set(lojasFiltradas.map((r) => r.loja)));
    return {
      periodos: todosPeriodos,
      linhas: lojasSet.map((loja) => ({
        loja,
        valores: todosPeriodos.map((p) => {
          const r = lojasFiltradas.find((x) => x.loja === loja && x.periodo === p);
          return r ? Math.round(r.atingimento_percentual * 100) : null;
        }),
      })),
    };
  }, [store.lojasPeriodos, filtrosValidos.loja]);

  // Evolução do atingimento consolidado por período
const CORES_LINHA = ["#17365D", "#C62828", "#F9A825", "#2E7D32", "#6A1B9A", "#00838F", "#EF6C00", "#455A64"];

  const chartConsolidado = useMemo(() => {
    const todosPeriodos = Array.from(new Set(store.lojasPeriodos.map((r) => r.periodo)));
    return todosPeriodos.map((p) => {
      const regs = store.lojasPeriodos.filter((r) => r.periodo === p);
      const v = regs.reduce((s, r) => s + r.vendas_total, 0);
      const m = regs.reduce((s, r) => s + r.meta, 0);
      return {
        periodo: p,
        atingimento: m === 0 ? 0 : Math.round((v / m) * 100),
        vendas: v,
        meta: m,
      };
    });
  }, [store.lojasPeriodos]);

  return (
    <div className="min-h-screen bg-background">
      <Header titulo="Visão Geral" />

      <main className="container pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 pt-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy">
              BI Comercial Richesse — {tituloPeriodo}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Desempenho individual das lojas · vendas, metas e atingimento
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <FiltrosDashboard
              filtros={filtrosValidos}
              setFiltros={setFiltros}
              compact
              periodos={periodosVivos}
              lojas={lojasVivas}
            />
          </div>
        </div>

        {/* Cartões KPI */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard delay={0} label="Total de Vendas" valor={fmtMil(vendas)} sub={fmtMoeda(vendas)} destaque />
          <KpiCard delay={60} label="Total de Meta" valor={fmtMil(meta)} sub={fmtMoeda(meta)} />
          <KpiCard
            delay={120}
            label="Atingimento %"
            valor={fmtPct(ating)}
            status={ating >= 1 ? "success" : ating >= 0.8 ? "warning" : "danger"}
            destaque
          />
          <KpiCard
            delay={180}
            label="Diferença Meta"
            valor={fmtMil(dif)}
            sub={fmtMoeda(dif)}
            status={dif >= 0 ? "success" : "danger"}
          />
        </div>

        {/* Evolução mensal por loja — seção destacada */}
        <Panel
          titulo="Evolução mensal por loja"
          subtitulo={`Atingimento e vendas mês a mês · deltas em pontos percentuais vs o mês anterior`}
          className="mb-6"
          acaoDireita={<BotaoApresentar onClick={() => setApresentar(true)} />}
        >
          <EvolucaoLojas lojasFiltro={filtrosValidos.loja} />
        </Panel>

        {/* Modo apresentação — evolução mensal em tela cheia */}
        <ModalApresentacao
          aberto={apresentar}
          onFechar={() => setApresentar(false)}
          titulo="Evolução mensal por loja"
          subtitulo="Atingimento e vendas mês a mês · deltas em pontos percentuais vs o mês anterior"
        >
          <EvolucaoLojas lojasFiltro={filtrosValidos.loja} apresentacao />
        </ModalApresentacao>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Tabela por loja */}
          <Panel
            titulo="Desempenho por loja"
            subtitulo={`Ordenado por atingimento · ${linhas.length} loja(s)`}
            className="lg:col-span-3"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-3 font-semibold text-muted-foreground">Loja</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Vendas</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Meta</th>
                    <th className="px-3 py-2 font-semibold text-muted-foreground">Atingimento %</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Diferença</th>
                    <th className="pl-3 py-2 font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((r) => (
                    <tr key={`${r.loja}|${r.periodo}`} className="border-b border-border/60 last:border-0 align-top">
                      <td className="py-3 pr-3 font-medium text-foreground">{r.loja}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{fmtMoeda(r.vendas_total)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{fmtMoeda(r.meta)}</td>
                      <td className="w-40 max-w-[160px] px-3 py-3">
                        <div className="mb-1 text-right">
                          <span className={
                            corStatus(r.atingimento_percentual) === "#C62828"
                              ? "text-danger font-semibold tabular-nums"
                              : corStatus(r.atingimento_percentual) === "#F9A825"
                                ? "text-[#8a5d00] font-semibold tabular-nums"
                                : "text-success font-semibold tabular-nums"
                          }>
                            {fmtPct(r.atingimento_percentual)}
                          </span>
                        </div>
                        <DataBar valor={r.atingimento_percentual} cor={corStatus(r.atingimento_percentual)} />
                      </td>
                      <td className={
                        r.diferenca_meta >= 0
                          ? "px-3 py-3 text-right tabular-nums text-success"
                          : "px-3 py-3 text-right tabular-nums text-danger"
                      }>
                        {fmtMoeda(r.diferenca_meta)}
                      </td>
                      <td className="pl-3 py-3">
                        <StatusChip atingimento={r.atingimento_percentual} />
                      </td>
                    </tr>
                  ))}
                  {linhas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        Nenhum registro para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Gráficos */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Panel
              titulo="Atingimento da meta por loja"
              subtitulo="Ordenado do maior para o menor atingimento"
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartAtingimento} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 4 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="2 4" stroke="#e3e8ed" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="loja" width={130} tick={{ fontSize: 11 }} interval={0} />
                    <Tooltip
                      formatter={(v: number) => [fmtPct(v / 100), "Atingimento"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e3e8ed", fontSize: 12 }}
                    />
                    <Bar dataKey="atingimento" radius={[0, 3, 3, 0]} maxBarSize={22}>
                      <LabelList dataKey="atingimento" position="right" formatter={(v: number) => fmtPct(v / 100)} style={{ fontSize: 10, fill: "#64748b" }} />
                      {chartAtingimento.map((d, i) => (
                        <Cell key={i} fill={d.cor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {chartConsolidado.length >= 2 && (
              <Panel
                titulo="Evolução do atingimento consolidado"
                subtitulo="Atingimento total (vendas ÷ meta) por período"
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartConsolidado} margin={{ top: 16, right: 8, left: 8, bottom: 4 }}>
                      <CartesianGrid vertical={false} strokeDasharray="2 4" stroke="#e3e8ed" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number, name: string) => {
                          if (name === "atingimento") return [`${v}%`, "Atingimento"];
                          return [fmtMoeda(v), name === "vendas" ? "Vendas" : "Meta"];
                        }}
                        contentStyle={{ borderRadius: 8, border: "1px solid #e3e8ed", fontSize: 12 }}
                      />
                      <Legend formatter={(v: string) => (v === "vendas" ? "Vendas" : v === "meta" ? "Meta" : "Atingimento %")} />
                      <Bar dataKey="vendas" name="vendas" fill="#9fb4d4" radius={[3, 3, 0, 0]} maxBarSize={48} hide />
                      <Bar dataKey="meta" name="meta" fill="#c9d6ea" radius={[3, 3, 0, 0]} maxBarSize={48} hide />
                      <Bar dataKey="atingimento" name="atingimento" fill="#17365D" radius={[3, 3, 0, 0]} maxBarSize={48}>
                        <LabelList dataKey="atingimento" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 11, fill: "#17365D", fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            )}

            {chartEvolucao && (
              <Panel
                titulo="Evolução do atingimento por loja"
                subtitulo={`Linha do tempo entre ${chartEvolucao.periodos.join(" e ")}`}
              >
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartEvolucao.periodos.map((p, i) => ({ periodo: p, ...Object.fromEntries(chartEvolucao.linhas.map((l) => [l.loja, l.valores[i]])) }))} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 4" stroke="#e3e8ed" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v, name) => (typeof v === "number" ? [`${v}%`, name] : ["sem dados", name])}
                        contentStyle={{ borderRadius: 8, border: "1px solid #e3e8ed", fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {chartEvolucao.linhas.map((l, i) => (
                        <Line key={l.loja} type="monotone" dataKey={l.loja} stroke={CORES_LINHA[i % CORES_LINHA.length]} strokeWidth={2} dot={{ r: 4 }} connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            )}

            <Panel titulo="Vendas vs Meta por loja" subtitulo="Total do período filtrado">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartVendasMeta} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                    <CartesianGrid vertical={false} strokeDasharray="2 4" stroke="#e3e8ed" />
                    <XAxis dataKey="loja" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number, name: string) => [fmtMoeda(v), name === "vendas" ? "Vendas" : "Meta"]} contentStyle={{ borderRadius: 8, border: "1px solid #e3e8ed", fontSize: 12 }} />
                    <Legend formatter={(v: string) => (v === "vendas" ? "Vendas" : "Meta")} />
                    <Bar dataKey="vendas" name="vendas" fill="#17365D" radius={[3, 3, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="meta" name="meta" fill="#9fb4d4" radius={[3, 3, 0, 0]} maxBarSize={28} />
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
