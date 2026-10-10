import type { WindowedIntegration } from "../lib/data";
import { openInDesktop } from "../lib/link-intercept";
import { servicePath } from "../lib/service-paths";
import { panels } from "./panels";
import { themes, themeStyle } from "./themes";

const linkClass = "shrink-0 text-[#000080] underline hover:text-[#1084d0]";

/** A host window's inside: the themed mock panel, then an X11 status bar with the real links. */
type HostBodyProps = {
  integration: WindowedIntegration;
  /** Shows a same-site page in the desktop browser window. */
  onOpenPath?: (path: string) => void;
};

export default function HostBody({ integration, onOpenPath }: HostBodyProps) {
  const Panel = panels[integration.id];
  return (
    <div className="flex h-full flex-col">
      <figure className="m-0 min-h-0 flex-1 overflow-hidden" style={themeStyle(themes[integration.id])}>
        <div aria-hidden="true" className="h-full">
          <Panel />
        </div>
        <figcaption className="sr-only">{integration.window.caption}</figcaption>
      </figure>
      <p className="bevel-in m-0 mt-[3px] flex shrink-0 items-center gap-3 bg-x11-face px-2 py-1 font-ui text-[11px] text-black">
        <span className="min-w-0 flex-1 truncate">{integration.stack}</span>
        <a href={integration.listing.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {integration.listing.label} ↗
        </a>
        {integration.service && (
          <a
            href={servicePath(integration.service)}
            className={linkClass}
            onClick={openInDesktop(onOpenPath, servicePath(integration.service))}
          >
            Service page →
          </a>
        )}
      </p>
    </div>
  );
}
