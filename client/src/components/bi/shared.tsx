/**
 * Estilo: Executive Ledger — componentes compartilhados do dashboard.
 * Azul-marinho #17365D, semáforo só em status de meta, serifada em títulos.
 */
import { Link, useLocation } from "wouter";
import {
  Filtros,
  lojasDisponiveis,
  periodosDisponiveis,
  fmtMoeda,
  fmtPercentual,
  statusMeta,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

/* ----------------------------------------------------------------------------
 * Header com monograma "R." e navegação entre páginas
 * --------------------------------------------------------------------------*/
export function Header({ titulo }: { titulo: string }) {
  const [location] = useLocation();
  const nav = [
    { path: "/", label: "Visão Geral" },
    { path: "/loja", label: "Detalhe da Loja" },
    { path: "/resumo", label: "Resumo Executivo" },
    { path: "/admin", label: "Administrar dados" },
  ];
  return (
    <header className="bg-navy text-primary-foreground">
      <div className="container flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20">
            <span className="font-display text-lg font-bold tracking-tight">R<span className="text-warning">.</span></span>
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold">BI Comercial Richesse</div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-white/60">Painel de desempenho comercial</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.path}
              href={n.path}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                location === n.path
                  ? "bg-white/15 text-white ring-1 ring-white/25"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------------------
 * Segmentações (equivalente aos filtros do Power BI)
 * --------------------------------------------------------------------------*/
export function Segmentacao({
  label,
  valor,
  opcoes,
  onChange,
  mostrarTodos = false,
}: {
  label: string;
  valor?: string;
  opcoes: string[];
  onChange: (v?: string) => void;
  mostrarTodos?: boolean;
}) {
  return (
    <label className="block">
      <span className="kpi-label mb-1.5 block">{label}</span>
      <select
        className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
        value={valor ?? "__todos"}
        onChange={(e) => onChange(e.target.value === "__todos" ? undefined : e.target.value)}
      >
        {mostrarTodos && (
          <option value="__todos">
            {mostrarTodos === true && opcoes.length > 1 ? `Todos (${opcoes.length})` : "Todos"}
          </option>
        )}
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FiltrosDashboard({
  filtros,
  setFiltros,
  compact = false,
  periodos,
  lojas,
}: {
  filtros: Filtros;
  setFiltros: (f: Filtros) => void;
  compact?: boolean;
  /** Lista viva de períodos (vem do DataStore; inclui Junho, Julho etc.) */
  periodos?: string[];
  /** Lista viva de lojas (vem do DataStore, respeita o período selecionado) */
  lojas?: string[];
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        compact ? "sm:flex-row" : "",
      )}
    >
      <Segmentacao
        label="Período"
        valor={filtros.periodo}
        opcoes={periodos ?? periodosDisponiveis()}
        mostrarTodos={false}
        onChange={(v) => setFiltros({ ...filtros, periodo: v })}
      />
      <Segmentacao
        label="Loja"
        valor={filtros.loja}
        opcoes={lojas ?? lojasDisponiveis()}
        mostrarTodos
        onChange={(v) => setFiltros({ ...filtros, loja: v })}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Cartão KPI
 * --------------------------------------------------------------------------*/
export function KpiCard({
  label,
  valor,
  sub,
  status,
  destaque = false,
  delay = 0,
}: {
  label: string;
  valor: string;
  sub?: string;
  status?: "success" | "warning" | "danger" | "neutral";
  destaque?: boolean;
  delay?: number;
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
    <div
      className="rise-in relative overflow-hidden rounded-lg border bg-card p-5 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      {destaque && (
        <span className="absolute right-0 top-0 flex h-1.5 w-full items-center">
          <span
            className={cn(
              "h-1.5 w-full",
              status === "success"
                ? "bg-success"
                : status === "warning"
                  ? "bg-warning"
                  : status === "danger"
                    ? "bg-danger"
                    : "bg-navy",
            )}
          />
        </span>
      )}
      <div className="kpi-label">{label}</div>
      <div
        className={cn(
          "mt-2 font-display text-2xl font-semibold tabular-nums",
          statusColor,
        )}
      >
        {valor}
      </div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Chip de status de meta (semáforo)
 * --------------------------------------------------------------------------*/
export function StatusChip({ atingimento }: { atingimento: number }) {
  const s = statusMeta(atingimento);
  const cls =
    s === "Acima da meta"
      ? "bg-success/15 text-success ring-success/40"
      : s === "Meta atingida"
        ? "bg-success/10 text-success ring-success/30"
        : s === "Próximo da meta"
          ? "bg-warning/15 text-[#8a5d00] ring-warning/40"
          : s === "Abaixo da meta"
            ? "bg-warning/10 text-[#b45309] ring-warning/30"
            : "bg-danger/10 text-danger ring-danger/30";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", cls)}>
      <TrendingUp className="h-3 w-3" />
      {s}
    </span>
  );
}

/* ----------------------------------------------------------------------------
 * Data bar (formatação condicional do atingimento, como no Power BI)
 * --------------------------------------------------------------------------*/
export function DataBar({
  valor,
  cor,
  className,
  maximo = 1.2,
}: {
  valor: number; // 0..~1.2 (pode passar de 100%)
  cor?: string;
  className?: string;
  /** Referência visual da barra; 1 significa 100% da largura disponível. */
  maximo?: number;
}) {
  const referencia = maximo > 0 ? maximo : 1.2;
  const pct = Math.min(Math.max(valor, 0), referencia) / referencia;
  const clampedPct = Math.min(pct * 100, 100);
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="data-bar h-full rounded-full"
        style={{ width: `${clampedPct}%`, backgroundColor: cor }}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Cartão de painel padrão
 * --------------------------------------------------------------------------*/
export function Panel({
  titulo,
  subtitulo,
  children,
  className,
  acaoDireita,
}: {
  titulo?: string;
  subtitulo?: string;
  children: React.ReactNode;
  className?: string;
  acaoDireita?: React.ReactNode;
}) {
  return (
    <section className={cn("rise-in rounded-lg border bg-card p-5 shadow-sm", className)}>
      {(titulo || subtitulo) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            {titulo && <h3 className="font-display text-base font-semibold text-navy">{titulo}</h3>}
            {subtitulo && <p className="mt-0.5 text-xs text-muted-foreground">{subtitulo}</p>}
          </div>
          {acaoDireita}
        </header>
      )}
      {children}
    </section>
  );
}

export function fmtBRL(v: number): string {
  return fmtMoeda(v);
}

export function fmtPct(v: number): string {
  return fmtPercentual(v);
}

/** Cor de status do atingimento conforme a regra (verde/âmbar/vermelho) */
export function corStatus(atingimento: number): string {
  const s = statusMeta(atingimento);
  if (s === "Acima da meta" || s === "Meta atingida") return "#2E7D32";
  if (s === "Próximo da meta") return "#F9A825";
  return "#C62828";
}
