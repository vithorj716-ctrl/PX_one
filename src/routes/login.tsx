import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { gsap } from "gsap";
import { AnimatedLogo } from "@/components/motion/animated-logo";
import { GrupoPxLogo } from "@/components/pxlog-logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Acesso — Grupo PX" },
    { name: "description", content: "Acesso seguro à plataforma operacional do Grupo PX." },
    { property: "og:title", content: "Acesso — Grupo PX" },
    { property: "og:description", content: "Acesso seguro à plataforma operacional do Grupo PX." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
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
      const timeline = gsap.timeline({ delay: reduced ? 0 : 0.54, defaults: { ease: "power3.out" } });
      timeline
        .fromTo("[data-login-copy]", { opacity: 0, y: reduced ? 0 : 8 }, { opacity: 1, y: 0, duration: reduced ? 0.08 : 0.28 }, 0.06)
        .fromTo("[data-login-rule]", { scaleX: 0 }, { scaleX: 1, duration: reduced ? 0.08 : 0.3 }, 0.08)
        .fromTo("[data-login-field='user']", { opacity: 0, y: reduced ? 0 : 12 }, { opacity: 1, y: 0, duration: reduced ? 0.08 : 0.28 }, 0.12)
        .fromTo("[data-login-field='password']", { opacity: 0, y: reduced ? 0 : 12 }, { opacity: 1, y: 0, duration: reduced ? 0.08 : 0.28 }, 0.17)
        .fromTo("[data-login-submit]", { opacity: 0, y: reduced ? 0 : 8 }, { opacity: 1, y: 0, duration: reduced ? 0.08 : 0.26 }, 0.23)
        .set("[data-login-copy], [data-login-rule], [data-login-field], [data-login-submit]", { opacity: 1, transform: "none" });
    }, root);
    return () => {
      ctx.kill();
      ctx.revert();
    };
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
      <form onSubmit={onSubmit} className="panel w-full max-w-sm space-y-5 p-6 sm:p-8">
        <AnimatedLogo className="mx-auto mb-4 w-36 rounded-sm">
          <GrupoPxLogo height={92} priority className="w-full" />
        </AnimatedLogo>
        <div data-login-copy className="text-center space-y-1">
          <h1 className="text-lg font-semibold">PX One</h1>
          <p className="text-xs text-muted-foreground">Acesso operacional seguro</p>
        </div>
        <div data-login-rule className="brand-rule" />

        <div data-login-field="user" className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Usuário</label>
          <input
            autoFocus
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="input min-h-11"
            autoComplete="username"
          />
        </div>
        <div data-login-field="password" className="space-y-1.5">
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
