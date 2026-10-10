export type Tone = "muted" | "accent" | "heading" | "error" | "warn";

/** A run of text on one line; `href` makes it a link, `run` makes it a clickable command. */
export type Segment = {
  text: string;
  tone?: Tone;
  href?: string;
  run?: string;
};

/** Output is data, not JSX, so commands stay testable without a DOM. */
export type Line =
  /** `hang` indents wrapped continuation lines by that many characters. */
  | { segments: readonly Segment[]; hang?: number }
  | { art: string; label: string };

export function line(...segments: (Segment | string)[]): Line {
  return {
    segments: segments.map((s) => (typeof s === "string" ? { text: s } : s)),
  };
}

/** A line whose wrapped continuations align under the text after its first `indent` characters. */
export function hanging(indent: number, ...segments: (Segment | string)[]): Line {
  return { ...line(...segments), hang: indent };
}

export const blank: Line = { segments: [] };

export function tone(text: string, t: Tone): Segment {
  return { text, tone: t };
}

export function link(text: string, href: string): Segment {
  return { text, href };
}

export function cmd(name: string): Segment {
  return { text: name, run: name, tone: "accent" };
}

export function linesToText(lines: readonly Line[]): string {
  return lines
    .map((l) => ("art" in l ? l.label : l.segments.map((s) => s.text).join("")))
    .join("\n");
}
