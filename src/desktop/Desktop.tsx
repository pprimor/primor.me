import { useCallback, useMemo, useState } from "react";
import { SERVICES_PATH } from "../lib/service-paths";
import { siteMetadata } from "../lib/site-metadata";
import Terminal from "../terminal/Terminal";
import Browser, { type BrowserRequest } from "./Browser";
import DesktopIcons from "./DesktopIcons";
import HireForm from "./HireForm";
import { BriefcaseIcon, CardIcon, DocumentIcon, FolderIcon, MailIcon, PuzzleIcon, TerminalIcon } from "./icons";
import Panel, { type MenuItem, type Task } from "./Panel";
import { raise, zIndex, type Stack } from "./stacking";
import { useDesktopArea, useWindowState } from "./useWindowState";
import Window from "./Window";

type WindowId = "term" | "hire" | "web";

const HIRE_WINDOW = { size: { width: 480, height: 480 }, offset: 40, initialMode: "closed" } as const;
const WEB_WINDOW = { size: { width: 820, height: 600 }, offset: 70, initialMode: "closed" } as const;

export default function Desktop() {
  const { desktop, compact } = useDesktopArea();
  const term = useWindowState(desktop);
  const hire = useWindowState(desktop, HIRE_WINDOW);
  const web = useWindowState(desktop, WEB_WINDOW);
  const [webRequest, setWebRequest] = useState<BrowserRequest>({ path: SERVICES_PATH, n: 0 });
  const [webTitle, setWebTitle] = useState("");
  const [focused, setFocused] = useState<WindowId | null>("term");
  const [stack, setStack] = useState<Stack<WindowId>>(["term"]);

  const focus = useCallback((id: WindowId) => {
    setFocused(id);
    setStack((s) => raise(s, id));
  }, []);

  const showTerm = term.show;
  const showHire = hire.show;
  const openTerm = useCallback(() => {
    showTerm();
    focus("term");
  }, [showTerm, focus]);
  const openHire = useCallback(() => {
    showHire();
    focus("hire");
  }, [showHire, focus]);
  const showWeb = web.show;
  const openWeb = useCallback(
    (path: string = SERVICES_PATH) => {
      setWebRequest((r) => ({ path, n: r.n + 1 }));
      showWeb();
      focus("web");
    },
    [showWeb, focus],
  );

  const items: MenuItem[] = useMemo(
    () => [
      { label: "Hire me", icon: <BriefcaseIcon />, onSelect: openHire },
      { label: "Services", icon: <PuzzleIcon />, href: SERVICES_PATH, onOpen: () => openWeb() },
      { label: "Terminal", icon: <TerminalIcon />, onSelect: openTerm },
      { label: "CV.pdf", icon: <DocumentIcon />, href: siteMetadata.cvUrl },
      { label: "GitHub", icon: <FolderIcon />, href: siteMetadata.profiles.github },
      { label: "LinkedIn", icon: <CardIcon />, href: siteMetadata.profiles.linkedin },
      { label: "Email", icon: <MailIcon />, href: `mailto:${siteMetadata.contactEmail}` },
    ],
    [openHire, openTerm, openWeb],
  );

  const windows = { term, hire, web };
  const tasks: Task[] = (["term", "hire", "web"] as const)
    .filter((id) => windows[id].mode !== "closed")
    .map((id) => {
      const w = windows[id];
      return {
        label: { term: "xterm", hire: "hire", web: "browser" }[id],
        pressed: w.visible,
        onClick: () => {
          if (w.visible && focused === id) {
            w.minimize();
          } else {
            w.show();
            focus(id);
          }
        },
      };
    });

  return (
    <div
      className="wallpaper fixed inset-0 overflow-hidden"
      onPointerDown={(e) => e.target === e.currentTarget && setFocused(null)}
    >
      <h1 className="sr-only">
        {siteMetadata.author} — {siteMetadata.jobTitle}
      </h1>
      <Panel menu={items} tasks={tasks} />
      <main>
        {!compact && <DesktopIcons items={items} />}
        {term.mode !== "closed" && (
          <Window
            id="terminal-window"
            title="xterm — guest@primor.me: ~"
            glyph=">_"
            zIndex={zIndex(stack, "term")}
            rect={term.rect}
            desktop={desktop}
            maximized={term.mode === "maximized"}
            compact={compact}
            hidden={!term.visible}
            focused={focused === "term" && term.visible}
            onRectChange={term.setRect}
            onFocus={() => focus("term")}
            onMinimize={term.minimize}
            onToggleMaximize={term.toggleMaximize}
            onClose={term.close}
          >
            <Terminal
              key={term.sessionKey}
              active={term.visible && focused === "term"}
              onExit={term.close}
              onOpen={(app, path) => (app === "hire" ? openHire() : openWeb(path))}
              compact={compact}
            />
          </Window>
        )}
        {hire.mode !== "closed" && (
          <Window
            id="hire-window"
            title="hire — tell me about your project"
            glyph="@"
            zIndex={zIndex(stack, "hire")}
            rect={hire.rect}
            desktop={desktop}
            maximized={hire.mode === "maximized"}
            compact={compact}
            hidden={!hire.visible}
            focused={focused === "hire" && hire.visible}
            onRectChange={hire.setRect}
            onFocus={() => focus("hire")}
            onMinimize={hire.minimize}
            onToggleMaximize={hire.toggleMaximize}
            onClose={hire.close}
          >
            <HireForm key={hire.sessionKey} />
          </Window>
        )}
        {web.mode !== "closed" && (
          <Window
            id="web-window"
            title={`browser — ${webTitle || "primor.me"}`}
            glyph="www"
            zIndex={zIndex(stack, "web")}
            rect={web.rect}
            desktop={desktop}
            maximized={web.mode === "maximized"}
            compact={compact}
            hidden={!web.visible}
            focused={focused === "web" && web.visible}
            onRectChange={web.setRect}
            onFocus={() => focus("web")}
            onMinimize={web.minimize}
            onToggleMaximize={web.toggleMaximize}
            onClose={web.close}
          >
            <Browser key={web.sessionKey} request={webRequest} onTitle={setWebTitle} />
          </Window>
        )}
      </main>
    </div>
  );
}
