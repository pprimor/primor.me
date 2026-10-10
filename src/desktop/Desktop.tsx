import { useMemo, useState } from "react";
import { siteMetadata } from "../lib/site-metadata";
import Terminal from "../terminal/Terminal";
import DesktopIcons from "./DesktopIcons";
import { CardIcon, DocumentIcon, FolderIcon, MailIcon, TerminalIcon } from "./icons";
import Panel, { type MenuItem } from "./Panel";
import { useDesktopArea, useWindowState } from "./useWindowState";
import Window from "./Window";

const TITLE = "xterm — guest@primor.me: ~";

export default function Desktop() {
  const { desktop, compact } = useDesktopArea();
  const term = useWindowState(desktop);
  const [focused, setFocused] = useState(true);
  const { show } = term;

  const items: MenuItem[] = useMemo(
    () => [
      {
        label: "Terminal",
        icon: <TerminalIcon />,
        onSelect: () => {
          show();
          setFocused(true);
        },
      },
      { label: "CV.pdf", icon: <DocumentIcon />, href: siteMetadata.cvUrl },
      { label: "GitHub", icon: <FolderIcon />, href: siteMetadata.profiles.github },
      { label: "LinkedIn", icon: <CardIcon />, href: siteMetadata.profiles.linkedin },
      { label: "Email", icon: <MailIcon />, href: `mailto:${siteMetadata.contactEmail}` },
    ],
    [show],
  );

  return (
    <div
      className="wallpaper fixed inset-0 overflow-hidden"
      onPointerDown={(e) => e.target === e.currentTarget && setFocused(false)}
    >
      <h1 className="sr-only">
        {siteMetadata.author} — {siteMetadata.jobTitle}
      </h1>
      <Panel
        menu={items}
        task={
          term.mode === "closed"
            ? null
            : {
                label: "xterm",
                pressed: term.visible,
                onClick: () => {
                  if (term.visible && focused) {
                    term.minimize();
                  } else {
                    term.show();
                    setFocused(true);
                  }
                },
              }
        }
      />
      <main>
        <DesktopIcons items={items} />
        {term.mode !== "closed" && (
          <Window
            id="terminal-window"
            title={TITLE}
            rect={term.rect}
            desktop={desktop}
            maximized={term.mode === "maximized"}
            compact={compact}
            hidden={!term.visible}
            focused={focused && term.visible}
            onRectChange={term.setRect}
            onFocus={() => setFocused(true)}
            onMinimize={term.minimize}
            onToggleMaximize={term.toggleMaximize}
            onClose={term.close}
          >
            <Terminal
              key={term.sessionKey}
              active={term.visible && focused}
              onExit={term.close}
            />
          </Window>
        )}
      </main>
    </div>
  );
}
