import logoAsset from "@/assets/grupo-px-logo.png.asset.json";
import { cn } from "@/lib/utils";

type GrupoPxLogoProps = {
  className?: string;
  height?: number;
  priority?: boolean;
};

export function GrupoPxLogo({ className = "", height = 28, priority = false }: GrupoPxLogoProps) {
  return (
    <span className={cn("logo-surface inline-flex max-w-full items-center justify-center", className)} style={{ height }}>
      <img
        src={logoAsset.url}
        alt="Grupo PX"
        width={Math.round(height * 1.56)}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="block h-full max-w-full object-contain"
      />
    </span>
  );
}

export const PxLogLogo = GrupoPxLogo;

