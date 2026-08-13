import { useState } from "react";
import { useLocation } from "wouter";
import { LockKeyhole, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = trpc.auth.loginExternal.useMutation({
    onSuccess: () => navigate("/admin"),
    onError: () => setError("E-mail ou senha inválidos. Tente novamente."),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    login.mutate({ email, password });
  }

  return (
    <main className="min-h-screen bg-[#f3f5f7] px-5 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/10">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-[#14263d] text-white">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b5202a]">BI Richesse</p>
        <h1 className="font-serif text-3xl font-bold text-[#14263d]">Acesso administrativo</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Entre para importar relatórios, editar metas, consultar a auditoria e gerar backups.</p>

        <form className="mt-7 space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button className="w-full bg-[#14263d] hover:bg-[#0f1d2f]" type="submit" disabled={login.isPending}>
            {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Entrar no Admin"}
          </Button>
        </form>
      </section>
    </main>
  );
}
