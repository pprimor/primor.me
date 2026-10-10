import { useCallback, useEffect, useRef, useState } from "react";
import { SERVICES_PATH } from "../lib/service-paths";
import { siteMetadata } from "../lib/site-metadata";
import { back, canGoBack, canGoForward, current, forward, startHistory, visit } from "./browserHistory";

/** A page to show; bump `n` to navigate an already-open window. */
export type BrowserRequest = { path: string; n: number };

type BrowserProps = {
  request: BrowserRequest;
  /** The loaded page's <title>, for the window's title bar. */
  onTitle: (title: string) => void;
};

const host = siteMetadata.siteUrl.replace(/^https:/, "http:");

/** A retro web browser showing the site's own pages in a same-origin iframe. */
export default function Browser({ request, onTitle }: BrowserProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [initialPath] = useState(request.path);
  const [history, setHistory] = useState(() => startHistory(request.path));
  const [title, setTitle] = useState("Services");
  const handled = useRef(request.n);

  // replace() so the iframe doesn't grow the visitor's real tab history.
  const go = useCallback((path: string) => {
    frame.current?.contentWindow?.location.replace(path);
  }, []);

  useEffect(() => {
    if (request.n === handled.current) return;
    handled.current = request.n;
    go(request.path);
  }, [request, go]);

  const onLoad = () => {
    const win = frame.current?.contentWindow;
    if (!win) return;
    setHistory((h) => visit(h, win.location.pathname));
    setTitle(win.document.title);
    onTitle(win.document.title);
  };

  const step = (move: typeof back) => {
    const next = move(history);
    if (next === history) return;
    setHistory(next);
    go(current(next));
  };

  return (
    <div className="flex h-full flex-col bg-x11-face">
      <div role="toolbar" aria-label="Browser" className="flex items-center gap-1 p-1">
        <button type="button" className="x11-button h-[22px] px-2 disabled:font-normal disabled:text-x11-shadow" disabled={!canGoBack(history)} onClick={() => step(back)}>
          Back
        </button>
        <button type="button" className="x11-button h-[22px] px-2 disabled:font-normal disabled:text-x11-shadow" disabled={!canGoForward(history)} onClick={() => step(forward)}>
          Forward
        </button>
        <button type="button" className="x11-button h-[22px] px-2 disabled:font-normal disabled:text-x11-shadow" onClick={() => frame.current?.contentWindow?.location.reload()}>
          Reload
        </button>
        <button type="button" className="x11-button h-[22px] px-2 disabled:font-normal disabled:text-x11-shadow" onClick={() => go(SERVICES_PATH)}>
          Home
        </button>
        <label className="ml-1 flex min-w-0 flex-1 items-center gap-1 font-ui text-xs text-black">
          <span className="hidden sm:inline">Location:</span>
          <input
            readOnly
            aria-label="Address"
            value={`${host}${current(history)}`}
            className="bevel-in min-w-0 flex-1 bg-white px-1 py-[2px] font-mono text-xs text-black"
          />
        </label>
      </div>
      <iframe
        ref={frame}
        src={initialPath}
        title={title}
        onLoad={onLoad}
        className="bevel-in min-h-0 w-full flex-1 border-0 bg-term-bg"
      />
    </div>
  );
}
