import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import * as Icons from "lucide-react";
import { useSystem } from "@/px-platform/system-context";
import { supabase } from "@/integrations/supabase/client";
import { Settings, LogOut } from "lucide-react";
import { AnimatedLogo } from "@/components/motion/animated-logo";
import { GrupoPxLogo } from "@/components/pxlog-logo";

export const Route = createFileRoute("/_authenticated/launcher")({
  head: () => ({ meta: [
    { title: "Selecionar sistema — Grupo PX" },
    { name: "description", content: "Selecione um sistema da plataforma operacional do Grupo PX." },
    { property: "og:title", content: "Selecionar sistema — Grupo PX" },
    { property: "og:description", content: "Selecione um sistema da plataforma operacional do Grupo PX." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LauncherPage,
});

function LauncherPage() {
  const { loading, allowedSystems, setActiveSystem, touchLastAccess } = useSystem();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  // Auto-enter se só houver 1 sistema
  useEffect(() => {
    if (loading) return;
    if (allowedSystems.length === 1) {
      const s = allowedSystems[0];
      setActiveSystem(s.key);
      void touchLastAccess(s.key);
      navigate({ to: s.rota as any });
    }
  }, [loading, allowedSystems, navigate, setActiveSystem, touchLastAccess]);

  async function logout() {
    setActiveSystem(null);
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  function enter(key: string, rota: string) {
    setActiveSystem(key);
    void touchLastAccess(key);
    navigate({ to: rota as any });
  }

  return (
    <div className="min-h-screen grid-etch bg-background/75 text-foreground">
      <header className="h-14 px-4 sm:px-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AnimatedLogo wordmark="PX Platform" submark="Selecionar Sistema" className="min-w-0 shrink-0"><GrupoPxLogo height={40} priority className="w-16" /></AnimatedLogo>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/admin" })}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface/60"
            title="Administração"
          >
            <Settings className="size-4" />
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface/60"
            title="Sair"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold">Bem-vindo</h1>
          <p className="text-sm text-muted-foreground mt-1">Escolha o sistema que deseja acessar.</p>
        </div>

        {loading ? (
          <div className="text-center text-sm text-muted-foreground">Carregando sistemas…</div>
        ) : allowedSystems.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            Você ainda não possui acesso a nenhum sistema. Procure o administrador.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allowedSystems.map((s, index) => {
              const Icon = (Icons as any)[s.icone] ?? Icons.AppWindow;
              return (
                <motion.button
                  key={s.key}
                  onClick={() => enter(s.key, s.rota)}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: reduced ? 0 : index * 0.055, ease: [0.22, 1, 0.36, 1] }} whileTap={reduced ? undefined : { scale: 0.985 }}
                  className="text-left panel-slab hover:bg-surface/70 transition-colors p-5 group"
                >
                  <div
                    className="size-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: s.cor + "22", color: s.cor }}
                  >
                    <Icon className="size-6" />
                  </div>
                  <div className="font-semibold">{s.nome}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.descricao}</div>
                  <div className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">Entrar →</div>
                </motion.button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
