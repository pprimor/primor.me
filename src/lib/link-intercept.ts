import { SERVICES_PATH } from "./service-paths";

type Click = {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
};

/** An unmodified primary click; anything else (new tab, new window, download) belongs to the browser. */
export function isPlainLeftClick(click: Click): boolean {
  return (
    !click.defaultPrevented &&
    click.button === 0 &&
    !click.metaKey &&
    !click.ctrlKey &&
    !click.shiftKey &&
    !click.altKey
  );
}

/** Same-site service pages, which the desktop can show in its browser window. */
export function isServicesPath(href: string): boolean {
  return href.startsWith(SERVICES_PATH);
}

/**
 * A link click handler: a plain click shows `path` in the desktop's browser window;
 * modified clicks, or a page with no desktop (`onOpen` undefined), navigate as usual.
 */
export function openInDesktop(onOpen: ((path: string) => void) | undefined, path: string) {
  return (event: Click & { preventDefault: () => void }) => {
    if (onOpen && isPlainLeftClick(event)) {
      event.preventDefault();
      onOpen(path);
    }
  };
}
