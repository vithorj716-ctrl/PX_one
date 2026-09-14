export function PxLogLogo({ className = "", height = 28 }: { className?: string; height?: number }) {
  return (
    <span className={`inline-flex items-baseline font-bold leading-none tracking-normal ${className}`} style={{ fontSize: height * 0.72 }} aria-label="PXLog">
      <span className="text-brand">PX</span><span className="text-background">Log</span>
    </span>
  );
}

