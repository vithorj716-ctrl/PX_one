import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect on the client, useEffect during SSR.
 * GSAP timelines must never run (or warn) while rendering on the server.
 */
export const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;
