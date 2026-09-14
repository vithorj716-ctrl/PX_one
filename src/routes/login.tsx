import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { gsap } from "gsap";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "PX Platform — Acesso" }] }),
  component: LoginPage,
});

const INTERNAL_DOMAIN = "@px.local";

function LoginPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .from("[data-login-panel]", { opacity: 0, y: reduced ? 0 : 10, duration: reduced ? 0.18 : 0.45 })
        .from("[data-login-logo]", { opacity: 0, y: reduced ? 0 : 18, scale: reduced ? 1 : 0.86, filter: reduced ? "blur(0px)" : "blur(10px)", duration: reduced ? 0.18 : 0.9 }, "-=0.18")
        .from("[data-login-copy]", { opacity: 0, y: reduced ? 0 : 14, duration: reduced ? 0.16 : 0.6 }, "-=0.5")
        .from("[data-login-rule]", { scaleX: 0, duration: reduced ? 0.16 : 0.7 }, "-=0.35")
        .from("[data-login-field]", { opacity: 0, y: reduced ? 0 : 16, stagger: reduced ? 0 : 0.1, duration: reduced ? 0.16 : 0.5 }, "-=0.4")
        .from("[data-login-submit]", { opacity: 0, y: reduced ? 0 : 10, duration: reduced ? 0.16 : 0.4 }, "-=0.2");
    }, root);
    return () => ctx.revert();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const email = login.trim().toLowerCase() + INTERNAL_DOMAIN;
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      navigate({ to: "/launcher" });
    } catch (err: any) {
      setErro("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={rootRef} className="min-h-screen grid-etch flex items-center justify-center bg-background/70 px-4 py-10">
      <form data-login-panel onSubmit={onSubmit} className="panel w-full max-w-sm space-y-5 p-6 sm:p-8">
        <div data-login-copy className="text-center space-y-1">
          <div data-login-logo className="px-sheen mx-auto size-10 rounded-md flex items-center justify-center mb-3 bg-[image:var(--gradient-brand)]">
            <span className="text-sm font-bold text-brand-foreground">PX</span>
          </div>
          <h1 className="text-lg font-semibold">PX One</h1>
          <p className="text-xs text-muted-foreground">Acesso operacional seguro</p>
        </div>
        <div data-login-rule className="brand-rule" />

        <div data-login-field className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Usuário</label>
          <input
            autoFocus
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="input min-h-11"
            autoComplete="username"
          />
        </div>
        <div data-login-field className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Senha</label>
          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input min-h-11 pr-12"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              className="press absolute right-1 top-1/2 -translate-y-1/2 size-11 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        {erro && <div role="alert" className="text-xs text-destructive">{erro}</div>}
        <button
          data-login-submit
          type="submit"
          disabled={loading || !login || !senha}
          className="press px-sheen w-full min-h-11 rounded-md bg-[image:var(--gradient-brand)] text-sm font-semibold text-brand-foreground disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
