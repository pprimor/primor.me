import type { CSSProperties } from "react";
import type { PanelId } from "./ids";

export type HostTheme = {
  surface: string;
  raised: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  border: string;
  positive: string;
  notice: string;
  info: string;
  radius: number;
  font: string;
};

const SYSTEM = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * A few values per host, copied by hand; no design-system packages.
 * Every text colour must pass AA on both surface and raised (themes.test.ts).
 */
export const themes: Record<PanelId, HostTheme> = {
  // Adobe Spectrum, dark theme as used by UXP panels: https://spectrum.adobe.com/page/color-palette/
  photoshop: {
    surface: "#252525",
    raised: "#323232",
    text: "#ebebeb",
    muted: "#b3b3b3",
    accent: "#0d66d0",
    onAccent: "#ffffff",
    border: "#4a4a4a",
    positive: "#4bc87c",
    notice: "#e8a33d",
    info: "#78bbfa",
    radius: 4,
    font: SYSTEM,
  },
  // Atlassian Design System colours and radius only: https://atlassian.design/foundations/color
  jira: {
    surface: "#ffffff",
    raised: "#f7f8f9",
    text: "#172b4d",
    muted: "#44546f",
    accent: "#0c66e4",
    onAccent: "#ffffff",
    border: "#dcdfe4",
    positive: "#216e4e",
    notice: "#a54800",
    info: "#0055cc",
    radius: 4,
    font: SYSTEM,
  },
  // Our own neutral light theme with a purple accent; not taken from Canva's kit.
  canva: {
    surface: "#ffffff",
    raised: "#f4f4f6",
    text: "#1b1b1f",
    muted: "#56565f",
    accent: "#6a2bd9",
    onAccent: "#ffffff",
    border: "#c8ccd1",
    positive: "#1d7a46",
    notice: "#9a5b00",
    info: "#2257c5",
    radius: 8,
    font: SYSTEM,
  },
  // Microsoft Fluent 2, light: https://fluent2.microsoft.design/color
  word: {
    surface: "#ffffff",
    raised: "#f5f5f5",
    text: "#242424",
    muted: "#616161",
    accent: "#0f6cbd",
    onAccent: "#ffffff",
    border: "#d1d1d1",
    positive: "#0e700e",
    notice: "#8a3707",
    info: "#115ea3",
    radius: 4,
    font: '"Segoe UI", system-ui, -apple-system, sans-serif',
  },
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function themeStyle(t: HostTheme): CSSProperties {
  return {
    "--host-surface": t.surface,
    "--host-raised": t.raised,
    "--host-text": t.text,
    "--host-muted": t.muted,
    "--host-accent": t.accent,
    "--host-on-accent": t.onAccent,
    "--host-border": t.border,
    "--host-positive": t.positive,
    "--host-notice": t.notice,
    "--host-info": t.info,
    "--host-radius": `${t.radius}px`,
    fontFamily: t.font,
    color: t.text,
    background: t.surface,
  } as CSSProperties;
}
