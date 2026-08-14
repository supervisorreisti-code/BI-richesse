/**
 * Estilo: Executive Ledger — Seção "Evolução mensal por loja".
 * Visualização destacada da evolução mês a mês de cada loja:
 * um card por loja com sparkline do atingimento, tabela horizontal
 * Maio x Junho x Julho (vendas e atingimento %) e deltas coloridos
 * (verde ↑ melhora, vermelho ↓ queda) entre meses consecutivos.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ChartNoAxesCombined, Minus, Target } from "lucide-react";
import { corStatus, fmtPct } from "@/components/bi/shared";
import { fmtMoeda } from "@/lib/data";
import { useDataStore, usePeriodosDisponiveis } from "@/lib/dataStore";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { ordenarLojasParaApresentacao, ordenarPeriodosParaApresentacao } from "@/lib/apresentacaoLoja";

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
  const [slideAtual, setSlideAtual] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const dados = useMemo(() => {
    const todosRegistros = store.lojasPeriodos;
    const periodos = ordenarPeriodosParaApresentacao(Array.from(new Set(todosRegistros.map((r) => r.periodo))));
    if (periodos.length < 2) return null;
    let lojas = Array.from(new Set(todosRegistros.map((r) => r.loja)));
    if (lojasFiltro) lojas = lojas.filter((l) => l === lojasFiltro);
    if (apresentacao) lojas = ordenarLojasParaApresentacao(lojas);
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
  }, [store.lojasPeriodos, lojasFiltro, apresentacao]);

  const quantidadeSlides = dados?.cards.length ?? 0;
  const irParaSlide = useCallback((indice: number) => {
    if (!quantidadeSlides) return;
    setSlideAtual((indice + quantidadeSlides) % quantidadeSlides);
  }, [quantidadeSlides]);
  const proximoSlide = useCallback(() => irParaSlide(slideAtual + 1), [irParaSlide, slideAtual]);
  const slideAnterior = useCallback(() => irParaSlide(slideAtual - 1), [irParaSlide, slideAtual]);

  useEffect(() => {
    if (!quantidadeSlides) return;
    setSlideAtual((atual) => Math.min(atual, quantidadeSlides - 1));
  }, [quantidadeSlides]);

  useEffect(() => {
    if (!apresentacao || !quantidadeSlides) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "ArrowRight") { evento.preventDefault(); proximoSlide(); }
      if (evento.key === "ArrowLeft") { evento.preventDefault(); slideAnterior(); }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [apresentacao, quantidadeSlides, proximoSlide, slideAnterior]);

  useEffect(() => { carouselApi?.scrollTo(slideAtual); }, [carouselApi, slideAtual]);
  useEffect(() => {
    if (!carouselApi) return;
    const atualizarIndice = () => setSlideAtual(carouselApi.selectedScrollSnap());
    carouselApi.on("select", atualizarIndice);
    return () => carouselApi.off("select", atualizarIndice);
  }, [carouselApi]);

  if (!dados) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Adicione um segundo período no painel <strong>Administrar dados</strong> para ver a evolução mês a mês de cada loja.
      </div>
    );
  }

  if (apresentacao) {
    return (
      <section aria-label="Slides de evolução por loja" className="mx-auto w-full max-w-6xl">
        <Carousel setApi={setCarouselApi} opts={{ align: "start", loop: true, duration: 24 }} className="w-full">
          <CarouselContent className="-ml-0">
            {dados.cards.map((c, indice) => {
              const ultimo = c.regs.slice().reverse().find((registro) => registro.temDados);
              const ultimoAtingimento = ultimo?.ating ?? 0;
              const diferencaMeta = ultimo ? Math.abs(ultimo.meta - ultimo.vendas) : 0;
              const atingiuMeta = Boolean(ultimo && ultimo.vendas >= ultimo.meta);
              return (
                <CarouselItem key={c.loja} className="pl-0">
                  <article className="min-h-[620px] overflow-hidden rounded-2xl border border-white/20 bg-[#102a4d] shadow-2xl shadow-black/20">
                    <div className="border-b border-white/15 bg-gradient-to-r from-white/[0.08] via-transparent to-transparent px-6 py-5 sm:px-10">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9b66b]">Unidade {String(indice + 1).padStart(2, "0")} de {String(dados.cards.length).padStart(2, "0")}</p>
                          <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">{c.loja}</h3>
                          <p className="mt-2 text-sm text-white/65 sm:text-base">Evolução de {dados.periodos[0]} a {dados.periodos[dados.periodos.length - 1]}</p>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-right backdrop-blur-sm">
                          <p className="text-xs uppercase tracking-[0.14em] text-white/60">Atingimento mais recente</p>
                          <p className="mt-1 text-3xl font-bold tabular-nums text-white">{fmtPct(ultimoAtingimento)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 px-6 py-6 sm:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-8">
                      <section className="rounded-xl border border-white/15 bg-[#0b203d] p-5 sm:p-6" aria-label="Destaques do último período">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white/80"><ChartNoAxesCombined className="h-4 w-4 text-[#d9b66b]" /> Destaques de {ultimo?.periodo ?? "último período"}</div>
                        {ultimo ? (
                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                              <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/60">Faturamento</p>
                              <p className="mt-2 text-2xl font-bold tabular-nums text-white sm:text-3xl">{fmtMoeda(ultimo.vendas)}</p>
                              <p className="mt-2 text-sm text-white/60">Valor realizado no período</p>
                            </div>
                            <div className="rounded-xl border border-[#d9b66b]/70 bg-[#d9b66b]/15 p-4 shadow-[inset_0_0_0_1px_rgba(217,182,107,0.12)]">
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#f3d99f]"><Target className="h-4 w-4" /> Meta do período</div>
                              <p className="mt-2 text-2xl font-bold tabular-nums text-[#fff3d6] sm:text-3xl">{fmtMoeda(ultimo.meta)}</p>
                              <p className="mt-2 text-sm text-[#f3d99f]">{atingiuMeta ? `Acima da meta em ${fmtMoeda(diferencaMeta)}` : `Faltaram ${fmtMoeda(diferencaMeta)} para a meta`}</p>
                            </div>
                          </div>
                        ) : <p className="mt-6 text-white/65">Não há dados disponíveis para esta unidade.</p>}
                      </section>

                      <section className="rounded-xl border border-white/15 bg-white/[0.045] p-5 sm:p-6" aria-label="Tendência de atingimento">
                        <p className="text-sm font-semibold text-white/80">Tendência de atingimento</p>
                        <div className="mt-4 h-32 w-full sm:h-40">
                          <svg viewBox="0 0 170 68" className="h-full w-full" preserveAspectRatio="none" role="img" aria-label="Atingimento da meta por período">
                            <line x1="8" y1="47" x2="162" y2="47" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                            {c.pts.filter((p): p is NonNullable<typeof p> => p !== null).length >= 2 && <polyline points={c.pts.filter((p): p is NonNullable<typeof p> => p !== null).map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={c.color} strokeWidth="3" strokeLinejoin="round" />}
                            {c.pts.map((p, pontoIndice) => p ? <g key={pontoIndice}><circle cx={p.x} cy={p.y} r="3.6" fill={c.color} /><text x={p.x} y={p.y > 24 ? p.y - 10 : p.y + 15} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f6f8fc">{p.v}%</text></g> : null)}
                          </svg>
                        </div>
                        <div className="mt-1 flex justify-between px-1 text-xs font-medium text-white/55">{dados.periodos.map((periodo) => <span key={periodo}>{periodo}</span>)}</div>
                      </section>
                    </div>

                    <section className="border-t border-white/15 px-6 py-6 sm:px-10 sm:py-8" aria-label="Comparativo mensal">
                      <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-white">Comparativo mês a mês</p><p className="mt-1 text-xs text-white/55">Faturamento e meta aparecem separadamente para facilitar a leitura.</p></div><span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/75 sm:inline">Meta em dourado</span></div>
                      <div className="space-y-2">
                        {c.regs.map((registro) => (
                          <div key={registro.periodo} className="grid grid-cols-[78px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-3 sm:grid-cols-[92px_minmax(0,1fr)_minmax(0,1fr)_105px] sm:gap-4 sm:px-4">
                            <span className="font-semibold text-white/80">{registro.periodo}</span>
                            <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/45">Faturamento</p><p className="mt-0.5 truncate text-base font-semibold tabular-nums text-white sm:text-lg">{registro.temDados ? fmtMoeda(registro.vendas) : "Não informado"}</p></div>
                            <div className="min-w-0 rounded-lg bg-[#d9b66b]/12 px-2.5 py-2 sm:px-3"><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#f3d99f]">Meta</p><p className="mt-0.5 truncate text-base font-bold tabular-nums text-[#fff3d6] sm:text-lg">{registro.temDados ? fmtMoeda(registro.meta) : "Não informado"}</p></div>
                            <div className="col-start-2 flex items-center gap-2 sm:col-start-auto sm:justify-end"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15 sm:hidden"><div className="h-full rounded-full" style={{ width: `${Math.min((registro.ating || 0) * 100, 100)}%`, backgroundColor: corStatus(registro.ating) }} /></div><span className="whitespace-nowrap text-right text-lg font-bold tabular-nums text-white">{registro.temDados ? fmtPct(registro.ating) : "—"}</span></div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </article>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 sm:px-5">
          <button type="button" onClick={slideAnterior} className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 active:scale-[0.97]" aria-label="Exibir loja anterior"><ArrowLeft className="h-4 w-4" /> Anterior</button>
          <div className="order-first w-full text-center sm:order-none sm:w-auto" aria-live="polite"><span className="text-sm font-semibold text-white">{slideAtual + 1} / {dados.cards.length}</span><span className="ml-2 text-xs text-white/55">Use as setas do teclado para navegar</span></div>
          <button type="button" onClick={proximoSlide} className="inline-flex items-center gap-2 rounded-lg bg-[#d9b66b] px-4 py-2 text-sm font-bold text-[#102a4d] transition-colors hover:bg-[#ecd094] active:scale-[0.97]" aria-label="Exibir próxima loja">Próxima <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
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
