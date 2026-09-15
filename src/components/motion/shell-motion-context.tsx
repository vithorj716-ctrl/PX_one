import { useRouterState } from "@tanstack/react-router";
import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

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

/**
 * Publishes a page's header into the persistent shell.
 *
 * Two rules keep this loop-free while the route transition overlaps pages:
 * 1) Ownership — the page only publishes while ITS pathname is the current one,
 *    so the outgoing page never fights the incoming one for the header.
 * 2) Stable deps — `headerActions`/`rightPanel` are fresh JSX objects on every
 *    render, so they must NOT be effect dependencies; they are read from a ref at
 *    publish time instead. Using them as deps re-published on every render and
 *    React aborted with "Maximum update depth exceeded".
 */
export function ShellPage({ children, header }: { children: ReactNode; header: ShellHeader }) {
  const shell = useShellMotion();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const ownPath = useRef(pathname);
  const latest = useRef(header);
  latest.current = header;

  useLayoutEffect(() => {
    if (ownPath.current !== pathname) return;
    shell?.register(latest.current);
  }, [shell, pathname, header.title, header.subtitle]);

  return <>{children}</>;
}
