import { useEffect, useReducer } from "react";
import HostBody from "../hosts/HostBody";
import { integrations, isWindowed } from "../lib/data";
import { siteMetadata } from "../lib/site-metadata";
import Terminal from "../terminal/Terminal";
import DesktopIcons from "./DesktopIcons";
import type { Rect } from "./geometry";
import HireForm from "./HireForm";
import { BriefcaseIcon, DocumentIcon, HostIcon, TerminalIcon } from "./icons";
import { WINDOW_IDS, type WindowId } from "./ids";
import { initialDesk } from "./layout";
import { profileItems } from "./links";
import Panel, { type MenuItem, type Task } from "./Panel";
import ReadmeBody from "./ReadmeBody";
import { zIndex } from "./stacking";
import Window from "./Window";
import { deskReducer, isVisible } from "./windows";

const windowed = integrations.filter(isWindowed);
const listed = integrations.filter((i) => !isWindowed(i));
const byId = new Map(windowed.map((i) => [i.id, i]));

type Frame = { domId: string; title: string; glyph: string; task: string };

const FRAMES = {
  readme: { domId: "readme-window", title: "README.txt", glyph: "i", task: "README" },
  term: { domId: "terminal-window", title: "xterm — guest@primor.me: ~", glyph: ">_", task: "xterm" },
  hire: { domId: "hire-window", title: "hire — tell me about your project", glyph: "@", task: "hire" },
  ...Object.fromEntries(
    windowed.map((i) => [
      i.id,
      { domId: `${i.id}-window`, title: i.window.title, glyph: "□", task: i.window.title.split(" — ")[0] },
    ]),
  ),
} as Record<WindowId, Frame>;

export default function FloatingDesktop({ desktop }: { desktop: Rect }) {
  const [desk, dispatch] = useReducer(deskReducer, desktop, initialDesk);

  useEffect(() => {
    dispatch({ type: "fit", desktop });
  }, [desktop]);

  const show = (id: WindowId) => dispatch({ type: "show", id });

  const hireItem: MenuItem = { label: "Hire me", icon: <BriefcaseIcon />, onSelect: () => show("hire") };
  const terminalItem: MenuItem = { label: "Terminal", icon: <TerminalIcon />, onSelect: () => show("term") };
  const listedItems: MenuItem[] = listed.map((i) => ({
    label: i.host,
    icon: <HostIcon color={i.icon} />,
    href: i.listing.url,
  }));

  const menu: MenuItem[] = [
    hireItem,
    { label: "README", icon: <DocumentIcon />, onSelect: () => show("readme") },
    ...windowed.map((i) => ({ label: i.host, icon: <HostIcon color={i.icon} />, onSelect: () => show(i.id) })),
    ...listedItems,
    terminalItem,
    ...profileItems(),
  ];
  const icons: MenuItem[] = [hireItem, terminalItem, ...listedItems];

  const tasks: Task[] = WINDOW_IDS.filter((id) => desk.windows[id].mode !== "closed").map((id) => ({
    label: FRAMES[id].task,
    pressed: isVisible(desk.windows[id]),
    onClick: () => dispatch({ type: "toggle", id }),
  }));

  function body(id: WindowId, session: number) {
    switch (id) {
      case "readme":
        return <ReadmeBody onHire={() => show("hire")} />;
      case "term":
        return (
          <Terminal
            key={session}
            active={desk.focused === "term" && isVisible(desk.windows.term)}
            onExit={() => dispatch({ type: "close", id: "term" })}
            onOpen={show}
          />
        );
      case "hire":
        return <HireForm key={session} />;
      default:
        return <HostBody integration={byId.get(id)!} />;
    }
  }

  return (
    <div
      className="wallpaper fixed inset-0 overflow-hidden"
      onPointerDown={(e) => e.target === e.currentTarget && dispatch({ type: "blur" })}
    >
      <h1 className="sr-only">
        {siteMetadata.author} — {siteMetadata.jobTitle}
      </h1>
      <Panel menu={menu} tasks={tasks} />
      <main>
        <DesktopIcons items={icons} />
        {WINDOW_IDS.map((id) => {
          const w = desk.windows[id];
          if (w.mode === "closed") return null;
          const frame = FRAMES[id];
          return (
            <Window
              key={id}
              id={frame.domId}
              title={frame.title}
              glyph={frame.glyph}
              zIndex={zIndex(desk.stack, id)}
              rect={w.rect}
              desktop={desktop}
              maximized={w.mode === "maximized"}
              compact={false}
              hidden={!isVisible(w)}
              focused={desk.focused === id && isVisible(w)}
              onRectChange={(rect) => dispatch({ type: "move", id, rect })}
              onFocus={() => dispatch({ type: "focus", id })}
              onMinimize={() => dispatch({ type: "minimize", id })}
              onToggleMaximize={() => dispatch({ type: "toggleMaximize", id })}
              onClose={() => dispatch({ type: "close", id })}
            >
              {body(id, w.session)}
            </Window>
          );
        })}
      </main>
    </div>
  );
}
