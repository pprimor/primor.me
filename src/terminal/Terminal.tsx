import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { experienceData, projects, skills } from "../lib/data";
import { siteMetadata } from "../lib/site-metadata";
import { blank, line, tone, type Line, type Segment } from "./lines";
import { quickCommands } from "./commands";
import Prompt from "./Prompt";
import { complete, run, stepHistory, type ShellContext } from "./shell";
import type { App } from "./types";

const content = { projects, experience: experienceData, skills, site: siteMetadata };

const BANNER = String.raw`            _
 _ __  _ __(_)_ __ ___   ___  _ __
| '_ \| '__| | '_ ${"`"} _ \ / _ \| '__|
| |_) | |  | | | | | | | (_) | |
| .__/|_|  |_|_| |_| |_|\___/|_|
|_|`;

type Entry = { id: number; input?: string; lines: readonly Line[] };

let nextId = 0;

function entry(lines: readonly Line[], input?: string): Entry {
  return { id: nextId++, input, lines };
}

function initialEntries(): Entry[] {
  const ctx: ShellContext = { content, history: [], now: () => new Date() };
  return [
    entry([
      { art: BANNER, label: "primor" },
      blank,
      line(tone("*** primor.me is being rebuilt. This terminal is what's here for now. ***", "warn")),
    ]),
    entry(run("whoami", ctx).lines, "whoami"),
    entry(run("help", ctx).lines, "help"),
  ];
}

const toneClass: Record<NonNullable<Segment["tone"]>, string> = {
  muted: "text-term-muted",
  accent: "text-term-accent",
  heading: "font-bold text-term-heading",
  error: "text-term-error",
  warn: "text-term-warn",
};

const interactiveClass =
  "underline decoration-term-muted underline-offset-2 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-fg";

function SegmentView({
  segment,
  onRun,
}: {
  segment: Segment;
  onRun: (command: string) => void;
}) {
  const className = segment.tone ? toneClass[segment.tone] : undefined;
  if (segment.href) {
    const external = !segment.href.startsWith("mailto:");
    return (
      <a
        href={segment.href}
        className={`text-term-link ${interactiveClass}`}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {segment.text}
      </a>
    );
  }
  if (segment.run) {
    const command = segment.run;
    return (
      <button
        type="button"
        onClick={() => onRun(command)}
        className={`indent-0 ${className ?? ""} ${interactiveClass}`}
      >
        {segment.text}
      </button>
    );
  }
  return <span className={className}>{segment.text}</span>;
}

function LineView({
  value,
  onRun,
}: {
  value: Line;
  onRun: (command: string) => void;
}) {
  if ("art" in value) {
    return (
      <div>
        <pre
          aria-hidden="true"
          className="overflow-x-auto text-[11px] text-term-accent sm:text-[13px]"
        >
          {value.art}
        </pre>
        <span className="sr-only">{value.label}</span>
      </div>
    );
  }
  return (
    <div
      className="min-h-[1lh] whitespace-pre-wrap break-words"
      style={
        value.hang
          ? { paddingLeft: `${value.hang}ch`, textIndent: `-${value.hang}ch` }
          : undefined
      }
    >
      {value.segments.map((segment, i) => (
        <SegmentView key={i} segment={segment} onRun={onRun} />
      ))}
    </div>
  );
}

type TerminalProps = {
  /** Called when the visitor runs `exit`. */
  onExit?: () => void;
  /** Called when a command asks the desktop to open a window, e.g. `hire`. */
  onOpen?: (app: App) => void;
  /** Focus the prompt whenever this becomes true (pointer devices only). */
  active?: boolean;
  /** Small screens: show tappable shortcuts under the output. */
  compact?: boolean;
};

export default function Terminal({ onExit, onOpen, active = true, compact = false }: TerminalProps) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    // Keep the banner in view on load; follow the prompt once the visitor starts typing.
    const scroller = scrollRef.current;
    if (hasInteracted.current && scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [entries]);

  useEffect(() => {
    // Avoid popping the on-screen keyboard on touch devices.
    if (active && window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [active]);

  function execute(command: string) {
    hasInteracted.current = true;
    const ctx: ShellContext = { content, history, now: () => new Date() };
    const result = run(command, ctx);
    if (result.exit) {
      onExit?.();
      return;
    }
    const nextHistory = command.trim() ? [...history, command] : history;
    setHistory(nextHistory);
    setCursor(nextHistory.length);
    setInput("");
    setEntries((prev) =>
      result.clear ? [] : [...prev, entry(result.lines, command)],
    );
    if (result.open) onOpen?.(result.open);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      execute(input);
    } else if (event.key === "Tab") {
      event.preventDefault();
      const { value, options } = complete(input);
      if (options.length > 0) {
        hasInteracted.current = true;
        setEntries((prev) => [
          ...prev,
          entry([line(tone(options.join("  "), "muted"))], input),
        ]);
      }
      setInput(value);
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const step = stepHistory(
        history,
        cursor,
        event.key === "ArrowUp" ? "up" : "down",
      );
      setCursor(step.cursor);
      setInput(step.value);
    } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      setEntries([]);
    } else if (event.ctrlKey && event.key.toLowerCase() === "c") {
      if (window.getSelection()?.toString()) return;
      event.preventDefault();
      hasInteracted.current = true;
      setEntries((prev) => [...prev, entry([], `${input}^C`)]);
      setInput("");
      setCursor(history.length);
    }
  }

  function focusInput(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest("a, button") || window.getSelection()?.toString()) {
      return;
    }
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-full flex-col bg-term-bg">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 cursor-text overflow-y-auto overscroll-contain px-3 py-2 font-mono text-base leading-snug text-term-fg sm:text-[13px] sm:leading-[1.2]"
        onClick={focusInput}
      >
        <div role="log" aria-live="polite" aria-label="Terminal output">
          {entries.map((e) => (
            <div key={e.id}>
              {e.input !== undefined && (
                <div className="whitespace-pre-wrap break-words">
                  <Prompt /> {e.input}
                </div>
              )}
              {e.lines.map((l, i) => (
                <LineView key={i} value={l} onRun={execute} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-baseline gap-[1ch]">
          <label htmlFor="terminal-input" className="shrink-0">
            <Prompt />
            <span className="sr-only"> Type a command, or "help"</span>
          </label>
          <input
            id="terminal-input"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            className="min-w-0 flex-1 bg-transparent text-term-fg caret-term-accent outline-none"
          />
        </div>
      </div>
      {compact && (
        <nav
          aria-label="Quick commands"
          className="flex shrink-0 gap-2 overflow-x-auto border-t border-term-muted/40 px-3 py-2 font-mono text-sm"
        >
          {quickCommands.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => execute(name)}
              className={`shrink-0 border px-3 py-1.5 ${
                name === "hire"
                  ? "border-term-accent text-term-accent"
                  : "border-term-muted text-term-fg"
              } active:bg-term-fg/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-term-fg`}
            >
              {name}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
