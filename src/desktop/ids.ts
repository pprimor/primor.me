import { PANEL_IDS } from "../hosts/ids";

/** Every desktop window, in taskbar order. */
export const WINDOW_IDS = ["readme", ...PANEL_IDS, "term", "hire"] as const;

export type WindowId = (typeof WINDOW_IDS)[number];
