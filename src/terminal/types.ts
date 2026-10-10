import type { ExperienceEntry, Project, Skills } from "../lib/data";
import type { siteMetadata } from "../lib/site-metadata";
import type { Line } from "./lines";

export type Content = {
  projects: readonly Project[];
  experience: readonly ExperienceEntry[];
  skills: Skills;
  site: typeof siteMetadata;
};

export type ShellContext = {
  content: Content;
  /** Previously entered commands, oldest first, not including the current one. */
  history: readonly string[];
  now: () => Date;
};

/** Desktop windows a command can ask to open. */
export type App = "hire";

export type RunResult = { lines: Line[]; clear?: true; exit?: true; open?: App };

export type Command = {
  name: string;
  summary: string;
  hidden?: boolean;
  run: (args: readonly string[], ctx: ShellContext) => RunResult;
};
