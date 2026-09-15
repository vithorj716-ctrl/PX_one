import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/acesso-negado")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    sistema: typeof search.sistema === "string" ? search.sistema : undefined,
    modulo: typeof search.modulo === "string" ? search.modulo : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Acesso não autorizado — Grupo PX" },
      { name: "description", content: "Você não possui acesso a esta área da plataforma do Grupo PX." },
      { property: "og:title", content: "Acesso não autorizado — Grupo PX" },
      { property: "og:description", content: "Você não possui acesso a esta área da plataforma do Grupo PX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AcessoNegado,
});

function AcessoNegado() {
  const { sistema, modulo } = useSearch({ from: "/acesso-negado" });
  return (
    <div className="min-h-screen grid-etch bg-background/75 text-foreground flex items-center justify-center px-4">
      <div className="panel-slab max-w-md w-full p-8 text-center">
        <div className="size-12 rounded-xl bg-surface/60 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="size-6 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold">Acesso não autorizado</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Você não possui acesso a esta área
          {sistema ? <> ({sistema}{modulo ? ` › ${modulo}` : ""})</> : null}. Solicite ao administrador
          da plataforma a liberação do sistema, módulo ou ação necessária.
        </p>
        <Link
          to="/launcher"
          className="inline-flex mt-6 px-4 py-2 rounded-md ring-1 ring-border text-sm hover:bg-surface/60"
        >
          Voltar para a seleção de sistemas
        </Link>
      </div>
    </div>
  );
}
