import { useEffect, useState } from "react";
import type { Rect } from "./geometry";
import { COMPACT_MAX } from "./layout";

export const PANEL_HEIGHT = 28;

function desktopArea(): Rect {
  return {
    x: 0,
    y: PANEL_HEIGHT,
    width: window.innerWidth,
    height: window.innerHeight - PANEL_HEIGHT,
  };
}

/**
 * The desktop area below the panel, tracked across browser resizes.
 * `compact` is decided once per page load: switching layouts unmounts every window,
 * so rotating a phone would otherwise throw away a half-written hire form.
 */
export function useDesktopArea(): { desktop: Rect; compact: boolean } {
  const [desktop, setDesktop] = useState(desktopArea);
  const [compact] = useState(() => window.innerWidth < COMPACT_MAX);
  useEffect(() => {
    const onResize = () => setDesktop(desktopArea());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { desktop, compact };
}
