import { useState } from "react";
import HostBody from "../hosts/HostBody";
import { integrations, isWindowed } from "../lib/data";
import { SERVICES_PATH } from "../lib/service-paths";
import { siteMetadata } from "../lib/site-metadata";
import Terminal from "../terminal/Terminal";
import type { App } from "../terminal/types";
import Browser, { type BrowserRequest } from "./Browser";
import Card from "./Card";
import type { Rect } from "./geometry";
import HireForm from "./HireForm";
import { MIN_HEIGHT } from "./layout";
import { BriefcaseIcon, PuzzleIcon, TerminalIcon } from "./icons";
import { profileItems } from "./links";
import Panel, { type MenuItem } from "./Panel";
import ReadmeBody from "./ReadmeBody";
import { PANEL_HEIGHT } from "./useDesktopArea";
import Window from "./Window";

const windowed = integrations.filter(isWindowed);
const listed = integrations.filter((i) => !isWindowed(i));

function reveal(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Phones: the same windows as a scrolling column of cards. */
export default function CompactDesktop({ desktop }: { desktop: Rect }) {
  const [hire, setHire] = useState({ open: false, session: 0 });
  const openHire = () => setHire((h) => ({ ...h, open: true }));
  const closeHire = () => setHire((h) => ({ open: false, session: h.session + 1 }));
  const [web, setWeb] = useState({ open: false, session: 0, title: "" });
  const [webRequest, setWebRequest] = useState<BrowserRequest>({ path: SERVICES_PATH, n: 0 });
  const openWeb = (path: string = SERVICES_PATH) => {
    setWebRequest((r) => ({ path, n: r.n + 1 }));
    setWeb((w) => ({ ...w, open: true }));
  };
  const closeWeb = () => setWeb((w) => ({ open: false, session: w.session + 1, title: "" }));
  const onOpen = (app: App, path?: string) =>
    app === "hire" ? openHire() : app === "web" ? openWeb(path) : reveal(`${app}-card`);

  const menu: MenuItem[] = [
    { label: "Hire me", icon: <BriefcaseIcon />, onSelect: openHire },
    { label: "Services", icon: <PuzzleIcon />, href: SERVICES_PATH, onOpen: () => openWeb() },
    { label: "Terminal", icon: <TerminalIcon />, onSelect: () => reveal("term-card") },
    ...profileItems(),
  ];

  return (
    <div className="wallpaper fixed inset-0">
      <h1 className="sr-only">
        {siteMetadata.author} — {siteMetadata.jobTitle}
      </h1>
      <Panel menu={menu} tasks={[]} />
      <main className="absolute inset-x-0 bottom-0 overflow-y-auto" style={{ top: PANEL_HEIGHT }}>
        <div className="flex flex-col gap-4 p-4">
          <Card id="readme-card" title="README.txt" glyph="i" active>
            <ReadmeBody onHire={openHire} onOpenPath={openWeb} />
          </Card>
          {windowed.map((i) => (
            <Card key={i.id} id={`${i.id}-card`} title={i.window.title} height={MIN_HEIGHT[i.id]}>
              <HostBody integration={i} onOpenPath={openWeb} />
            </Card>
          ))}
          <Card id="more-card" title="More windows">
            <ul className="m-0 list-none bg-white p-1">
              {listed.map((i) => (
                <li key={i.id}>
                  <a
                    href={i.listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-between gap-2 border-b border-[#e0e0e0] px-2.5 font-ui text-[13px] text-black no-underline"
                  >
                    <span>{i.host}</span>
                    <span className="text-[11px] text-[#404040]">{i.stack}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>
          <Card id="term-card" title="xterm" glyph=">_" className="h-[70dvh]">
            <Terminal compact active={false} onOpen={onOpen} />
          </Card>
        </div>
      </main>
      {hire.open && (
        <Window
          id="hire-window"
          title="hire — tell me about your project"
          glyph="@"
          zIndex={50}
          rect={desktop}
          desktop={desktop}
          maximized={false}
          compact
          hidden={false}
          focused
          onRectChange={() => {}}
          onFocus={() => {}}
          onMinimize={closeHire}
          onToggleMaximize={() => {}}
          onClose={closeHire}
        >
          <HireForm key={hire.session} />
        </Window>
      )}
      {web.open && (
        <Window
          id="web-window"
          title={`browser — ${web.title || "primor.me"}`}
          glyph="www"
          zIndex={50}
          rect={desktop}
          desktop={desktop}
          maximized={false}
          compact
          hidden={false}
          focused
          onRectChange={() => {}}
          onFocus={() => {}}
          onMinimize={closeWeb}
          onToggleMaximize={() => {}}
          onClose={closeWeb}
        >
          <Browser
            key={web.session}
            request={webRequest}
            onTitle={(title) => setWeb((w) => ({ ...w, title }))}
          />
        </Window>
      )}
    </div>
  );
}
