/**
 * Estilo: Executive Ledger — Painel de administração de dados.
 * Permite alimentar novos períodos (Junho/Julho), editar vendas e metas das
 * lojas, e gerenciar o ranking de vendedores. Dados persistem no banco de dados (nuvem),
 * com o navegador mantendo um cache local. Atingimento e diferença são recalculados
 * automaticamente.
 */
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileJson, Plus, RotateCcw, Save, Trash2, Upload } from "lucide-react";
import { Header, Panel, StatusChip, DataBar, fmtPct, corStatus } from "@/components/bi/shared";
import {
  useDataStore,
  exportarJSON,
  importarJSON,
  restaurarPadrao,
} from "@/lib/dataStore";
import {
  LOJAS_PADRAO,
  fmtMoeda,
  fmtNumero,
  LojaPeriodo,
  RankingVendedor,
} from "@/lib/data";
import { parseMoeda, moedaParaTexto, aplicarMascaraMoeda, moedaFormatada } from "@/lib/admin";
import { extrairRelatorio, extrairParaRegistros, RelatorioExtraido } from "@/lib/parseRelatorio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ResumoCard({
  label,
  valor,
  status,
}: {
  label: string;
  valor: string;
  status: "success" | "warning" | "danger" | "neutral";
}) {
  const statusColor =
    status === "success"
      ? "text-success"
      : status === "warning"
        ? "text-warning"
        : status === "danger"
          ? "text-danger"
          : undefined;
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="kpi-label">{label}</div>
      <div className={cn("mt-1.5 font-display text-xl font-semibold tabular-nums", statusColor)}>{valor}</div>
    </div>
  );
}

type Aba = "lojas" | "vendedores" | "importar";

export default function Admin() {
  const store = useDataStore();
  const [aba, setAba] = useState<Aba>("lojas");
  const [periodoAtivo, setPeriodoAtivo] = useState(() => store.periodosDisponiveis()[0]);
  const [novoPeriodo, setNovoPeriodo] = useState("");
  const [lojaSelecionada, setLojaSelecionada] = useState<string>(
    store.lojasDoPeriodo(periodoAtivo)[0] ?? LOJAS_PADRAO[0],
  );
  const [novoVendedor, setNovoVendedor] = useState({ vendedor: "", vendas: "" });
  const [textoRelatorio, setTextoRelatorio] = useState("");
  const [extraido, setExtraido] = useState<RelatorioExtraido | null>(null);
  const [periodoImportacao, setPeriodoImportacao] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const periodoImportacaoValido = extraido && periodoImportacao.trim().length > 0;
  const lojasJaImportadas = useMemo(() => {
    if (!extraido) return [];
    return extraido.lojas
      .filter((l) => store.lojasPeriodos.some((r) => r.loja === l.lojaOficial && r.periodo === periodoImportacao.trim()))
      .map((l) => l.lojaOficial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraido, periodoImportacao, store.lojasPeriodos]);

  const periodos = store.periodosDisponiveis();
  const lojasDoPeriodo = store.lojasDoPeriodo(periodoAtivo);
  const registros = store.lojasDisponiveisPorPeriodo(periodoAtivo);
  const ranking = store.rankingVendedores.filter(
    (r) => r.loja === lojaSelecionada && r.periodo === periodoAtivo,
  );

  // Ajustar loja selecionada quando mudar de período
  useMemo(() => {
    if (!lojasDoPeriodo.includes(lojaSelecionada)) {
      setLojaSelecionada(lojasDoPeriodo[0] ?? LOJAS_PADRAO[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodoAtivo]);

  function atualizarRegistro(loja: string, campo: "vendas_total" | "meta", texto: string) {
    const n = parseMoeda(texto);
    if (texto.trim() === "") return; // permite apagar o campo
    if (n === null) return; // valor inválido, ignora enquanto digita
    const atual = registros.find((r) => r.loja === loja)!;
    store.salvarLojaPeriodo({ ...atual, [campo]: n });
  }

  /* ---- Helpers de resumo do período ---- */
  function registrosComDados(rs: LojaPeriodo[]): LojaPeriodo[] {
    return rs.filter((r) => r.vendas_total > 0 || r.meta > 0);
  }
  function totalRealizado(rs: LojaPeriodo[]): number {
    return rs.reduce((s, r) => s + r.vendas_total, 0);
  }
  function totalMetaPeriodo(rs: LojaPeriodo[]): number {
    return rs.reduce((s, r) => s + r.meta, 0);
  }
  function atingConsolidado(rs: LojaPeriodo[]): number {
    const meta = totalMetaPeriodo(rs);
    return meta > 0 ? totalRealizado(rs) / meta : 0;
  }

  function adicionarPeriodo() {
    const nome = novoPeriodo.trim();
    if (!nome) return;
    if (periodos.map((p) => p.toLowerCase()).includes(nome.toLowerCase())) {
      toast.error(`O período "${nome}" já existe.`);
      return;
    }
    store.addPeriodo(nome);
    setNovoPeriodo("");
    setPeriodoAtivo(nome);
    toast.success(`Período "${nome}" criado com as 8 lojas.`);
  }

  function salvarNovoVendedor() {
    const nome = novoVendedor.vendedor.trim();
    const n = parseMoeda(novoVendedor.vendas);
    if (!nome) {
      toast.error("Informe o nome do vendedor.");
      return;
    }
    if (ranking.some((r) => r.vendedor.toLowerCase() === nome.toLowerCase())) {
      toast.error("Já existe um vendedor com esse nome nesta loja e período. Edite-o na tabela.");
      return;
    }
    store.salvarVendedor({
      periodo: periodoAtivo,
      loja: lojaSelecionada,
      posicao: 0,
      vendedor: nome,
      vendas: n ?? 0,
    });
    setNovoVendedor({ vendedor: "", vendas: "" });
    store.reordenarRanking(lojaSelecionada, periodoAtivo);
    toast.success(`Vendedor "${nome}" adicionado.`);
  }

  function atualizarVendedor(r: RankingVendedor, campo: "vendedor" | "vendas", valor: string) {
    if (campo === "vendedor") {
      const nome = valor.trim();
      if (!nome || ranking.some((x) => x.vendedor === nome && x.vendedor !== r.vendedor)) return;
      store.salvarVendedor({ ...r, vendedor: nome });
    } else {
      const n = parseMoeda(valor);
      if (n === null) return;
      store.salvarVendedor({ ...r, vendas: n });
      store.reordenarRanking(lojaSelecionada, periodoAtivo);
    }
  }

  function handleExportar() {
    const blob = new Blob([exportarJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bi-richesse-dados-${periodoAtivo.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Arquivo JSON exportado.");
  }

  function handleImportar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importarJSON(String(reader.result));
      toast[res.ok ? "success" : "error"](res.mensagem);
      if (res.ok && fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(file);
  }

  function handleRestaurar() {
    restaurarPadrao();
    toast.success("Dados restaurados ao padrão oficial de Maio.");
  }

  function handleAnalisarRelatorio() {
    if (!textoRelatorio.trim()) {
      toast.error("Cole o texto do relatório no campo acima.");
      return;
    }
    const e = extrairRelatorio(textoRelatorio);
    if (e.lojas.length === 0) {
      toast.error("Não foi possível extrair lojas do texto. Verifique se o relatório segue o formato padrão (número + nome da loja, Meta, Total de vendas e lista de vendedores).", { duration: 7000 });
      setExtraido(null);
      return;
    }
    setExtraido(e);
    setPeriodoImportacao(e.periodoDetectado ?? "");
    toast.success(`${e.lojas.length} loja(s) e ${e.totalVendedores} vendedor(es) identificados. Confira a prévia abaixo.`);
  }

  function handleConfirmarImportacao() {
    if (!extraido || !periodoImportacaoValido) return;
    const periodo = periodoImportacao.trim();
    if (!store.periodosDisponiveis().map((p) => p.toLowerCase()).includes(periodo.toLowerCase())) {
      store.addPeriodo(periodo);
    }
    const { lojas, ranking } = extrairParaRegistros(extraido, periodo);
    for (const l of lojas) store.salvarLojaPeriodo(l);
    for (const r of ranking) store.salvarVendedor(r);
    toast.success(`Relatório de "${periodo}" importado: ${lojas.length} loja(s) e ${ranking.length} vendedor(es).`);
    setTextoRelatorio("");
    setExtraido(null);
    setPeriodoImportacao("");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header titulo="Administração de dados" />

      <main className="container pb-16">
        <div className="pt-8">
          <h1 className="font-display text-3xl font-bold text-navy">Administração de dados</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Alimente o painel com novos períodos e edite vendas, metas e vendedores. As
            alterações ficam salvas no banco de dados (na nuvem) e aparecem em qualquer
            dispositivo, com histórico de auditoria. Recomenda-se exportar o backup JSON
            antes de grandes edições.
          </p>
        </div>

        {/* Barra de ferramentas */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExportar}>
              <Download className="mr-1.5 h-4 w-4" /> Exportar backup
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-1.5 h-4 w-4" /> Importar JSON
            </Button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportar} />
            {store.temEdicoes && (
              <Button size="sm" variant="outline" className="text-muted-foreground" onClick={handleRestaurar}>
                <RotateCcw className="mr-1.5 h-4 w-4" /> Restaurar padrão oficial
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={novoPeriodo}
              onChange={(e) => setNovoPeriodo(e.target.value)}
              placeholder="Novo período (ex.: Junho)"
              className="h-9 w-52"
              onKeyDown={(e) => e.key === "Enter" && adicionarPeriodo()}
            />
            <Button size="sm" onClick={adicionarPeriodo}>
              <Plus className="mr-1.5 h-4 w-4" /> Adicionar período
            </Button>
          </div>
        </div>

        {/* Abas */}
        <div className="mt-6 flex gap-1 border-b border-border">
          {          (
            [
              ["lojas", "Lojas por período"],
              ["vendedores", "Ranking de vendedores"],
              ["importar", "Importar relatório"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                aba === id ? "border-navy text-navy" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {aba === "lojas" && (
          <div className="mt-6">
            {/* Seletor de período */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="kpi-label mr-2">Período ativo:</span>
              {periodos.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodoAtivo(p)}
                  className={cn(
                    "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                    periodoAtivo === p
                      ? "bg-navy text-white"
                      : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Cards de resumo do período */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <ResumoCard label="Realizado" valor={fmtMoeda(totalRealizado(registros))} status="neutral" />
              <ResumoCard label="Meta total" valor={fmtMoeda(totalMetaPeriodo(registros))} status="neutral" />
              <ResumoCard
                label="Atingimento"
                valor={registrosComDados(registros).length > 0 ? fmtPct(atingConsolidado(registros)) : "—"}
                status={registrosComDados(registros).length > 0 ? (atingConsolidado(registros) >= 1 ? "success" : atingConsolidado(registros) >= 0.9 ? "warning" : "danger") : "neutral"}
              />
              <ResumoCard
                label={totalRealizado(registros) >= totalMetaPeriodo(registros) && registrosComDados(registros).length > 0 ? "Acima da meta" : "Falta para a meta"}
                valor={registrosComDados(registros).length > 0 ? fmtMoeda(Math.abs(totalRealizado(registros) - totalMetaPeriodo(registros))) : "—"}
                status={totalRealizado(registros) >= totalMetaPeriodo(registros) && registrosComDados(registros).length > 0 ? "success" : "danger"}
              />
            </div>

            <Panel
              titulo={`Desempenho por loja — ${periodoAtivo}`}
              subtitulo="Preencha o realizado e a meta de cada loja; atingimento e status são recalculados automaticamente."
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 pr-3 font-semibold text-muted-foreground">Loja</th>
                      <th className="w-52 px-3 py-2 font-semibold text-muted-foreground">Realizado</th>
                      <th className="w-52 px-3 py-2 font-semibold text-muted-foreground">Meta</th>
                      <th className="w-36 px-3 py-2 font-semibold text-muted-foreground">Atingimento</th>
                      <th className="w-48 px-3 py-2 font-semibold text-muted-foreground">Falta para a meta</th>
                      <th className="w-40 py-2 font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r) => {
                      const temDados = r.vendas_total > 0 || r.meta > 0;
                      const falta = temDados ? Math.max(0, r.meta - r.vendas_total) : 0;
                      const acima = temDados && r.vendas_total > r.meta ? r.vendas_total - r.meta : 0;
                      return (
                        <tr key={`${r.loja}|${r.periodo}`} className="border-b border-border/60 last:border-0 align-middle">
                          <td className="py-2.5 pr-3 font-medium">{r.loja}</td>
                          <td className="px-3 py-2.5">
                            <input
                              inputMode="decimal"
                              defaultValue={moedaFormatada(r.vendas_total)}
                              onFocus={(e) => {
                                const el = e.target;
                                el.select();
                              }}
                              onBlur={(e) => {
                                const valor = aplicarMascaraMoeda(e.target.value);
                                e.target.value = valor;
                                atualizarRegistro(r.loja, "vendas_total", e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const el = e.target as HTMLInputElement;
                                  el.value = aplicarMascaraMoeda(el.value);
                                  atualizarRegistro(r.loja, "vendas_total", el.value);
                                  el.blur();
                                }
                              }}
                              className="w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-right text-xs tabular-nums focus:ring-2 focus:ring-ring"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              inputMode="decimal"
                              defaultValue={moedaFormatada(r.meta)}
                              onFocus={(e) => {
                                const el = e.target;
                                el.select();
                              }}
                              onBlur={(e) => {
                                const valor = aplicarMascaraMoeda(e.target.value);
                                e.target.value = valor;
                                atualizarRegistro(r.loja, "meta", e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const el = e.target as HTMLInputElement;
                                  el.value = aplicarMascaraMoeda(el.value);
                                  atualizarRegistro(r.loja, "meta", el.value);
                                  el.blur();
                                }
                              }}
                              className="w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-right text-xs tabular-nums focus:ring-2 focus:ring-ring"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            {temDados ? (
                              <>
                                <div className="mb-1 text-right text-xs font-semibold tabular-nums" style={{ color: corStatus(r.atingimento_percentual) }}>
                                  {fmtPct(r.atingimento_percentual)}
                                </div>
                                <DataBar valor={r.atingimento_percentual} cor={corStatus(r.atingimento_percentual)} />
                              </>
                            ) : (
                              <span className="block text-right text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right text-xs tabular-nums">
                            {temDados ? (
                              acima > 0 ? (
                                <span className="font-medium text-success">Acima R$ {fmtNumero(acima)}</span>
                              ) : (
                                <span className="font-medium text-muted-foreground">R$ {fmtNumero(falta)}</span>
                              )
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-2.5">
                            {temDados ? <StatusChip atingimento={r.atingimento_percentual} /> : <span className="text-xs text-muted-foreground">Aguardando dados</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Digite valores em reais (ex.: 9807790 ou 9.807.790,00) e pressione Enter ou clique fora do campo para salvar.
              </p>
            </Panel>
          </div>
        )}

        {aba === "vendedores" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Seletor de loja */}
            <Panel titulo="Selecionar loja" subtitulo={`Período: ${periodoAtivo}`}>
              <div className="flex flex-col gap-1.5">
                {lojasDoPeriodo.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLojaSelecionada(l)}
                    className={cn(
                      "rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                      lojaSelecionada === l
                        ? "bg-navy text-white"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
                {lojasDoPeriodo.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma loja neste período.</p>
                )}
              </div>
            </Panel>

            {/* Ranking */}
            <Panel
              titulo={`Ranking — ${lojaSelecionada}`}
              subtitulo={`${ranking.length} vendedor(es) · edite nome ou vendas e salve com Enter`}
              className="lg:col-span-2"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="w-12 py-2 pr-3 font-semibold text-muted-foreground">Pos.</th>
                      <th className="py-2 pr-3 font-semibold text-muted-foreground">Vendedor</th>
                      <th className="w-40 px-3 py-2 font-semibold text-muted-foreground">Vendas</th>
                      <th className="w-14 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((r) => (
                      <tr key={`${r.loja}|${r.vendedor}|${r.periodo}`} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">{r.posicao}</span>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            defaultValue={r.vendedor}
                            onBlur={(e) => atualizarVendedor(r, "vendedor", e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && atualizarVendedor(r, "vendedor", (e.target as HTMLInputElement).value)}
                            className="w-full rounded-md border border-input px-2.5 py-1.5 focus:ring-2 focus:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            inputMode="decimal"
                            defaultValue={moedaParaTexto(r.vendas)}
                            onBlur={(e) => atualizarVendedor(r, "vendas", e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && atualizarVendedor(r, "vendas", (e.target as HTMLInputElement).value)}
                            className="w-full rounded-md border border-input px-2.5 py-1.5 text-right tabular-nums focus:ring-2 focus:ring-ring"
                          />
                        </td>
                        <td className="py-2 text-center">
                          <button
                            onClick={() => {
                              store.removerVendedor(r.loja, r.periodo, r.vendedor);
                              store.reordenarRanking(r.loja, r.periodo);
                              toast.success(`Vendedor "${r.vendedor}" removido.`);
                            }}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                            title="Remover vendedor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {ranking.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                          Nenhum vendedor cadastrado para esta loja e período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Adicionar vendedor */}
              <div className="mt-4 border-t border-border pt-4">
                <div className="kpi-label mb-2">Adicionar vendedor</div>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={novoVendedor.vendedor}
                    onChange={(e) => setNovoVendedor({ ...novoVendedor, vendedor: e.target.value })}
                    placeholder="Nome do vendedor"
                    onKeyDown={(e) => e.key === "Enter" && salvarNovoVendedor()}
                    className="flex-1 min-w-48 rounded-md border border-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                  />
                  <input
                    inputMode="decimal"
                    value={novoVendedor.vendas}
                    onChange={(e) => setNovoVendedor({ ...novoVendedor, vendas: e.target.value })}
                    placeholder="Vendas (ex.: 45000)"
                    onKeyDown={(e) => e.key === "Enter" && salvarNovoVendedor()}
                    className="w-40 rounded-md border border-input px-3 py-2 text-right text-sm tabular-nums focus:ring-2 focus:ring-ring"
                  />
                  <Button size="sm" onClick={salvarNovoVendedor}>
                    <Plus className="mr-1.5 h-4 w-4" /> Adicionar
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {aba === "importar" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Panel
                titulo="Colar relatório de vendas"
                subtitulo={`Cole o texto completo do relatório (ex.: "RELATÓRIO DE VENDAS ${String.fromCharCode(8212)} RICHESSE") e clique em Analisar. O sistema detecta o período, as lojas, metas, vendas e o ranking de vendedores automaticamente.`}
              >
                <textarea
                  value={textoRelatorio}
                  onChange={(e) => setTextoRelatorio(e.target.value)}
                  placeholder={`Período: JULHO

1. RICHESSE FLAMBOYANT
Meta: R$ 810.690,00
Total de vendas: R$ 707.000,00
Top 8 garçons:
1. Luciana — R$ 101 mil
2. Cintia — R$ 93 mil
…`}
                  className="h-56 w-full rounded-md border border-input p-3 text-sm font-mono focus:ring-2 focus:ring-ring"
                />
                <div className="mt-3 flex items-center gap-3">
                  <Button onClick={handleAnalisarRelatorio}>
                    Analisar relatório
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    O período é detectado automaticamente pelo cabeçalho "Período: …", mas pode ser ajustado na prévia.
                  </span>
                </div>
              </Panel>
            </div>

            <div className="lg:col-span-2">
              <Panel titulo="Prévia da extração" subtitulo="Confira os dados antes de importar para o painel.">
                {extraido ? (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="kpi-label">Período:</span>
                      <input
                        value={periodoImportacao}
                        onChange={(e) => setPeriodoImportacao(e.target.value)}
                        className="w-36 rounded-md border border-input px-2.5 py-1.5 text-sm font-semibold text-navy focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-xs text-muted-foreground">({extraido.periodoDetectado ?? "não detectado"} no texto)</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto rounded-md border border-border">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="px-2 py-1.5 font-semibold text-muted-foreground">Loja</th>
                            <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Vendas</th>
                            <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Meta</th>
                            <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Vend.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extraido.lojas.map((l) => (
                            <tr key={l.nomeNoRelatorio} className="border-b border-border/50 last:border-0">
                              <td className="px-2 py-1.5 font-medium">
                                {l.lojaOficial}
                                {!l.reconhecida && <span className="ml-1 rounded bg-warning/15 px-1 py-0.5 text-[10px] font-semibold text-[#8a5d00]">novo</span>}
                              </td>
                              <td className="px-2 py-1.5 text-right tabular-nums">{fmtMoeda(l.vendas)}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums">{fmtMoeda(l.meta)}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums">{l.vendedores.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {extraido.avisos.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {extraido.avisos.map((a, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-[#8a5d00]">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#8a5d00]" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                    {lojasJaImportadas.length > 0 && (
                      <p className="mt-2 rounded-md bg-warning/10 p-2 text-xs text-[#8a5d00]">
                        Atenção: estas lojas já possuem dados em "{periodoImportacao}" e serão <strong>sobrescritas</strong> com os valores do relatório colado: {lojasJaImportadas.join(", ")}.
                      </p>
                    )}
                    <div className="mt-3">
                      <Button onClick={handleConfirmarImportacao} disabled={!periodoImportacaoValido} className="w-full">
                        <Save className="mr-1.5 h-4 w-4" /> Importar para o painel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    A prévia aparecerá aqui após clicar em "Analisar relatório".
                  </p>
                )}
              </Panel>
            </div>
          </div>
        )}

        {/* Aviso de persistência */}
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
          <FileJson className="mt-0.5 h-4 w-4 shrink-0 text-[#8a5d00]" />
          <p className="text-muted-foreground">
            Todos os dados ficam salvos no banco de dados (na nuvem). Use{" "}
            <strong>Exportar backup</strong> para gerar uma cópia de segurança e{" "}
            <strong>Importar JSON</strong> para restaurar registros.
          </p>
        </div>
      </main>
    </div>
  );
}
