import logoAsset from "@/assets/grupo-px-logo.png.asset.json";
import { cn } from "@/lib/utils";

type GrupoPxLogoProps = {
  className?: string;
  height?: number;
  priority?: boolean;
};

export function GrupoPxLogo({ className = "", height = 28, priority = false }: GrupoPxLogoProps) {
  return (
    <img
      src={logoAsset.url}
      alt="Grupo PX"
      width={Math.round(height * 1.56)}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn("block h-auto max-w-full object-contain", className)}
      style={{ height }}
    />
  );
}

export const PxLogLogo = GrupoPxLogo;

