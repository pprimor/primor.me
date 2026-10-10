/** The browser window's own back/forward list of site paths. */
export type BrowserHistory = { entries: readonly string[]; index: number };

export function startHistory(path: string): BrowserHistory {
  return { entries: [path], index: 0 };
}

export function current(history: BrowserHistory): string {
  return history.entries[history.index]!;
}

/** Records a page load; loading the current page again (Back, Reload) changes nothing. */
export function visit(history: BrowserHistory, path: string): BrowserHistory {
  if (current(history) === path) return history;
  const entries = [...history.entries.slice(0, history.index + 1), path];
  return { entries, index: entries.length - 1 };
}

export function canGoBack(history: BrowserHistory): boolean {
  return history.index > 0;
}

export function canGoForward(history: BrowserHistory): boolean {
  return history.index < history.entries.length - 1;
}

export function back(history: BrowserHistory): BrowserHistory {
  return canGoBack(history) ? { ...history, index: history.index - 1 } : history;
}

export function forward(history: BrowserHistory): BrowserHistory {
  return canGoForward(history) ? { ...history, index: history.index + 1 } : history;
}
