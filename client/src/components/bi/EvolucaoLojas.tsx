/**
 * Estilo: Executive Ledger — Seção "Evolução mensal por loja".
 * Visualização destacada da evolução mês a mês de cada loja:
 * um card por loja com sparkline do atingimento, tabela horizontal
 * Maio x Junho x Julho (vendas e atingimento %) e deltas coloridos
 * (verde ↑ melhora, vermelho ↓ queda) entre meses consecutivos.
 */
import { useMemo } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { corStatus, fmtPct } from "@/components/bi/shared";
import { fmtMoeda } from "@/lib/data";
import { useDataStore, usePeriodosDisponiveis } from "@/lib/dataStore";

const ORDENAR_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function indiceMes(nome: string): number {
  const i = ORDENAR_MESES.findIndex((m) => m.toLowerCase() === nome.toLowerCase());
  return i >= 0 ? i : 99;
}

/**
 * Delta entre dois meses consecutivos em pontos percentuais de atingimento.
 * Retorna { valor, positivo, ok } — ok = true quando os dois meses têm dados.
 */
export function deltaEntreMeses(
  lojasPeriodos: { loja: string; periodo: string; atingimento_percentual: number; vendas_total: number }[],
  loja: string,
  mesAtual: string,
  mesAnterior: string,
): { valor: number; positivo: boolean; ok: boolean } | null {
  const rAtual = lojasPeriodos.find((r) => r.loja === loja && r.periodo.toLowerCase() === mesAtual.toLowerCase());
  const rAnterior = lojasPeriodos.find((r) => r.loja === loja && r.periodo.toLowerCase() === mesAnterior.toLowerCase());
  if (!rAtual || !rAnterior) return null;
  const valor = (rAtual.atingimento_percentual - rAnterior.atingimento_percentual) * 100;
  return { valor, positivo: valor > 0, ok: true };
}

function SetaDelta({
  delta,
  grande,
}: {
  delta: { valor: number; positivo: boolean; ok: boolean } | null;
  grande?: boolean;
}) {
  const size = grande ? "h-5 w-5" : "h-3.5 w-3.5";
  if (!delta || !delta.ok) {
    return <Minus className={`${size} text-muted-foreground/50`} />;
  }
  const cls = delta.positivo ? "text-success" : "text-danger";
  const Icon = delta.positivo ? ArrowUp : ArrowDown;
  return (
    <span className={cls}>
      <Icon className={`inline ${size}`} />
      {" "}{delta.positivo ? "+" : ""}
      {Math.abs(delta.valor).toFixed(0)} p.p.
    </span>
  );
}

export default function EvolucaoLojas({
  lojasFiltro,
  apresentacao,
}: {
  lojasFiltro?: string;
  apresentacao?: boolean;
}) {
  const store = useDataStore();
  const periodosVivos = usePeriodosDisponiveis();

  const dados = useMemo(() => {
    const todosRegistros = store.lojasPeriodos;
    const periodos = Array.from(new Set(todosRegistros.map((r) => r.periodo))).sort(
      (a, b) => indiceMes(a) - indiceMes(b),
    );
    if (periodos.length < 2) return null;
    let lojas = Array.from(new Set(todosRegistros.map((r) => r.loja)));
    if (lojasFiltro) lojas = lojas.filter((l) => l === lojasFiltro);
    const cards = lojas.map((loja) => {
      const regs = periodos.map((p) => {
        const r = todosRegistros.find((x) => x.loja === loja && x.periodo === p);
        return r
          ? { periodo: p, vendas: r.vendas_total, meta: r.meta, ating: r.atingimento_percentual, temDados: true }
          : { periodo: p, vendas: 0, meta: 0, ating: 0, temDados: false };
      });
      const series = regs.map((r) => (r.temDados ? Math.round(r.ating * 100) : null));
      const minV = Math.min(...series.filter((v): v is number => v !== null));
      const maxV = Math.max(...series.filter((v): v is number => v !== null));
      // sparkline points (viewport 170x68, com margem lateral p/ rótulos e respiro no topo p/ o texto)
      const pts = series.map((v, i) => {
        if (v === null) return null;
        const x = 20 + (i / Math.max(series.length - 1, 1)) * 130;
        const range = maxV - minV || 10;
        const y = 56 - ((v - minV) / range) * 40;
        return { x, y, v };
      });
      return { loja, regs, series, pts, color: corStatus(regs[regs.length - 1]?.ating ?? 0) };
    });
    return { periodos, cards };
  }, [store.lojasPeriodos, lojasFiltro]);

  if (!dados) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Adicione um segundo período no painel <strong>Administrar dados</strong> para ver a evolução mês a mês de cada loja.
      </div>
    );
  }

  return (
    <div className={apresentacao ? "grid grid-cols-1 gap-6 lg:grid-cols-2" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"}>
      {dados.cards.map((c) => {
        const ultimoAting = c.regs.slice().reverse().find((r) => r.temDados)?.ating ?? 0;
        return (
          <div
            key={c.loja}
            className={`rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${
              apresentacao ? "border-white/25 !bg-[#102a4d] p-6 text-white" : "border-border"
            }`}
          >
            <div className={`mb-3 flex items-start justify-between gap-2 ${apresentacao ? "mb-5" : ""}`}>
              <div>
                <h3 className={`font-display font-bold text-navy ${apresentacao ? "text-2xl text-white" : "text-base"}`}>
                  {c.loja}
                </h3>
                <p className={`mt-0.5 ${apresentacao ? "text-sm text-white/70" : "text-xs text-muted-foreground"}`}>
                  Atingimento % por período
                </p>
              </div>
              <span className={`whitespace-nowrap rounded px-2 py-1 font-semibold ${apresentacao ? "px-3 py-1.5 text-xl" : "text-xs"}`} style={{
                color: c.color === "#C62828" ? "#ffffff" : c.color === "#F9A825" ? "#8a5d00" : "#ffffff",
                backgroundColor: c.color === "#C62828" ? "#C62828" : c.color === "#F9A825" ? "#F9A825" : "#2E7D32",
              }}>
                {fmtPct(ultimoAting)}
              </span>
            </div>

            {/* Sparkline */}
            <div className={`mb-3 w-full ${apresentacao ? "h-40" : "h-20"}`}>
              <svg viewBox="0 0 170 68" className="h-full w-full" preserveAspectRatio="none">
                <line x1="0" y1="42" x2="170" y2="42" stroke={apresentacao ? "rgba(255,255,255,0.25)" : "#e3e8ed"} strokeDasharray="3 3" />
                {c.pts.filter((p): p is NonNullable<typeof p> => p !== null).length >= 2 && (
                  <polyline
                    points={c.pts.filter((p): p is NonNullable<typeof p> => p !== null).map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={c.color}
                    strokeWidth={apresentacao ? 3 : 2.2}
                    strokeLinejoin="round"
                  />
                )}
                {c.pts.map((p, i) => {
                  if (!p) return null;
                  const rotulo = `${p.v}%`;
                  const rotuloAcima = p.y > 26;
                  const rotuloOffset = rotuloAcima ? p.y - 10 : p.y + 16;
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={apresentacao ? 3.5 : 3} fill={c.color} />
                      <text
                        x={p.x}
                        y={rotuloOffset}
                        textAnchor="middle"
                        fontSize={apresentacao ? 12 : 10}
                        fontWeight="700"
                        fill={apresentacao ? "#e8eef8" : "#1e293b"}
                      >
                        {rotulo}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Mini-tabela mês a mês com deltas */}
            <div className={`space-y-1.5 ${apresentacao ? "text-lg" : "text-xs"}`}>
              {c.regs.map((r, i) => {
                return (
                  <div
                    key={r.periodo}
                    className={`flex items-center rounded px-2 py-1.5 ${
                      i % 2 === 1 ? (apresentacao ? "bg-white/10" : "bg-secondary/60") : ""
                    } ${apresentacao ? "py-3 px-3" : ""}`}
                  >
                    <span className={`shrink-0 font-medium ${apresentacao ? "w-20 text-white/80" : "w-16 text-muted-foreground"}`}>
                      {r.periodo}
                    </span>
                    {apresentacao ? (
                      <span className={`min-w-0 truncate text-[0.9em] tabular-nums text-white/90`}>
                        {r.temDados ? `${fmtMoeda(r.vendas)} · Meta ${fmtMoeda(r.meta)}` : "— · Meta —"}
                      </span>
                    ) : (
                      <>
                        <span className={`shrink-0 tabular-nums w-24 text-foreground`}>
                          {r.temDados ? fmtMoeda(r.vendas) : "—"}
                        </span>
                        <span className="shrink-0 text-[0.85em] tabular-nums w-32 text-muted-foreground/70">
                          {r.temDados ? `Meta ${fmtMoeda(r.meta)}` : "—"}
                        </span>
                      </>
                    )}
                    <span className={`ml-auto shrink-0 text-right tabular-nums font-semibold ${apresentacao ? "text-white" : ""}`}>
                      {r.temDados ? fmtPct(r.ating) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
