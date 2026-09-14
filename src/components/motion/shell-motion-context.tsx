import { createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react";

export type ShellHeader = {
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  rightPanel?: ReactNode;
};

type ShellMotionContextValue = {
  header: ShellHeader;
  register: (header: ShellHeader) => void;
  persistent: boolean;
};

const ShellMotionContext = createContext<ShellMotionContextValue | null>(null);

export function ShellMotionProvider({ children, initialHeader, persistent = true }: { children: ReactNode; initialHeader: ShellHeader; persistent?: boolean }) {
  const [header, setHeader] = useState(initialHeader);
  const value = useMemo<ShellMotionContextValue>(() => ({
    header,
    persistent,
    register: (next) => setHeader((current) => {
      if (
        current.title === next.title
        && current.subtitle === next.subtitle
        && current.headerActions === next.headerActions
        && current.rightPanel === next.rightPanel
      ) return current;
      return next;
    }),
  }), [header, persistent]);

  return <ShellMotionContext.Provider value={value}>{children}</ShellMotionContext.Provider>;
}

export function useShellMotion() {
  return useContext(ShellMotionContext);
}

export function ShellPage({ children, header }: { children: ReactNode; header: ShellHeader }) {
  const shell = useShellMotion();
  useLayoutEffect(() => {
    shell?.register(header);
  }, [shell, header.title, header.subtitle, header.headerActions, header.rightPanel]);
  return <>{children}</>;
}