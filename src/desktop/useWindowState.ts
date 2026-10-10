import { useCallback, useEffect, useState } from "react";
import { clampRect, initialRect, type Rect } from "./geometry";

export const PANEL_HEIGHT = 28;
const COMPACT_BREAKPOINT = 640;

export type WindowMode = "normal" | "maximized" | "minimized" | "closed";

function desktopArea(): Rect {
  return {
    x: 0,
    y: PANEL_HEIGHT,
    width: window.innerWidth,
    height: window.innerHeight - PANEL_HEIGHT,
  };
}

/** The desktop area below the panel, tracked across browser resizes. */
export function useDesktopArea(): { desktop: Rect; compact: boolean } {
  const [desktop, setDesktop] = useState(desktopArea);
  useEffect(() => {
    const onResize = () => setDesktop(desktopArea());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { desktop, compact: desktop.width < COMPACT_BREAKPOINT };
}

export function useWindowState(desktop: Rect) {
  const [rect, setRect] = useState(() => initialRect(desktop));
  const [mode, setMode] = useState<WindowMode>("normal");
  // Bumped on close so the next open starts a fresh terminal session.
  const [sessionKey, setSessionKey] = useState(0);
  const [lastShown, setLastShown] = useState<"normal" | "maximized">("normal");

  useEffect(() => {
    setRect((r) => clampRect(r, desktop));
  }, [desktop]);

  const show = useCallback(() => {
    setMode((m) => (m === "minimized" || m === "closed" ? lastShown : m));
  }, [lastShown]);

  const minimize = useCallback(() => setMode("minimized"), []);

  const close = useCallback(() => {
    setMode("closed");
    setLastShown("normal");
    setSessionKey((k) => k + 1);
    setRect(initialRect(desktop));
  }, [desktop]);

  const toggleMaximize = useCallback(() => {
    const next = mode === "maximized" ? "normal" : "maximized";
    setMode(next);
    setLastShown(next);
  }, [mode]);

  return {
    rect,
    setRect,
    mode,
    visible: mode === "normal" || mode === "maximized",
    sessionKey,
    show,
    minimize,
    close,
    toggleMaximize,
  };
}
