import { commandNames, commands, files } from "./commands";
import { line, tone } from "./lines";
import type { RunResult, ShellContext } from "./types";

export type { Content, RunResult, ShellContext } from "./types";

/** Splits on whitespace, keeping "double" or 'single' quoted runs together. */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  for (const match of input.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }
  return tokens;
}

export function run(input: string, ctx: ShellContext): RunResult {
  const [name, ...args] = tokenize(input);
  if (name === undefined) return { lines: [] };
  const command = commands.get(name.toLowerCase());
  if (!command) {
    return {
      lines: [line(tone(`command not found: ${name} — try 'help'`, "error"))],
    };
  }
  return command.run(args, ctx);
}

function commonPrefix(words: readonly string[]): string {
  return words.reduce((prefix, word) => {
    let i = 0;
    while (i < prefix.length && prefix[i] === word[i]) i++;
    return prefix.slice(0, i);
  });
}

export type Completion = { value: string; options: string[] };

/** Bash-style completion: a unique match completes; several extend to their common prefix. */
export function complete(input: string): Completion {
  const catMatch = /^(\s*cat\s+)(\S*)$/.exec(input);
  const [head, partial, candidates, suffix] = catMatch
    ? [catMatch[1], catMatch[2], Object.keys(files), ""]
    : /^\S*$/.test(input)
      ? ["", input, commandNames, " "]
      : [input, null, [], ""];
  if (partial === null) return { value: input, options: [] };

  const matches = candidates.filter((c) => c.startsWith(partial.toLowerCase()));
  if (matches.length === 0) return { value: input, options: [] };
  if (matches.length === 1) return { value: head + matches[0] + suffix, options: [] };
  return { value: head + commonPrefix(matches), options: matches };
}

/** Moves through history; `cursor === history.length` is the live (empty) line. */
export function stepHistory(
  history: readonly string[],
  cursor: number,
  direction: "up" | "down",
): { cursor: number; value: string } {
  const next =
    direction === "up"
      ? Math.max(0, cursor - 1)
      : Math.min(history.length, cursor + 1);
  return { cursor: next, value: history[next] ?? "" };
}
