/**
 * Estilo: Executive Ledger — Modal de apresentação em tela cheia.
 * Overlay escuro navy sobre toda a janela, com título, botão de fechar
 * e dicas de atalho (ESC para sair). Usado pela seção "Evolução mensal".
 */
import { useEffect } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";

export default function ModalApresentacao({
  aberto,
  onFechar,
  titulo,
  subtitulo,
  children,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "f" || e.key === "F") {
        onFechar();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = antes;
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#0d2240] p-4 text-white sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={onFechar}
    >
      <div className="mx-auto max-w-7xl" onClick={(e) => e.stopPropagation()}>
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{titulo}</h2>
            {subtitulo && <p className="mt-1 text-sm text-white/60">{subtitulo}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded bg-white/10 px-2.5 py-1.5 text-xs text-white/80 sm:block">
              ESC para sair
            </span>
            <button
              type="button"
              onClick={onFechar}
              className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/25 transition-colors hover:bg-white/20 active:scale-[0.97]"
            >
              <Minimize2 className="h-4 w-4" />
              Sair da apresentação
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

/** Botão "Apresentar" usado no cabeçalho do Panel da seção */
export function BotaoApresentar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-navy ring-1 ring-navy/20 transition-colors hover:bg-navy/5 active:scale-[0.97]"
      aria-label="Abrir em modo apresentação"
    >
      <Maximize2 className="h-3.5 w-3.5" />
      Apresentar
    </button>
  );
}
