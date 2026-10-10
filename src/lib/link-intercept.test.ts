import { describe, expect, it } from "vitest";
import { isPlainLeftClick, isServicesPath, openInDesktop } from "./link-intercept";

const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };

describe("isPlainLeftClick", () => {
  it("accepts an unmodified primary click", () => {
    expect(isPlainLeftClick(click)).toBe(true);
  });

  it("leaves new-tab and new-window clicks to the browser", () => {
    for (const mod of ["metaKey", "ctrlKey", "shiftKey", "altKey"] as const) {
      expect(isPlainLeftClick({ ...click, [mod]: true })).toBe(false);
    }
    expect(isPlainLeftClick({ ...click, button: 1 })).toBe(false);
    expect(isPlainLeftClick({ ...click, defaultPrevented: true })).toBe(false);
  });
});

describe("isServicesPath", () => {
  it("matches the overview and service pages only", () => {
    expect(isServicesPath("/services/")).toBe(true);
    expect(isServicesPath("/services/canva-apps/")).toBe(true);
    expect(isServicesPath("/")).toBe(false);
    expect(isServicesPath("https://primor.me/services/")).toBe(false);
    expect(isServicesPath("mailto:hello@primor.me")).toBe(false);
  });
});

describe("openInDesktop", () => {
  it("opens the path in the desktop on a plain click and stops the navigation", () => {
    const opened: string[] = [];
    let prevented = false;
    openInDesktop((path) => opened.push(path), "/services/canva-apps/")({ ...click, preventDefault: () => (prevented = true) });
    expect(opened).toEqual(["/services/canva-apps/"]);
    expect(prevented).toBe(true);
  });

  it("leaves modified clicks, and pages without a desktop, to the browser", () => {
    const opened: string[] = [];
    let prevented = false;
    const preventDefault = () => (prevented = true);
    openInDesktop((path) => opened.push(path), "/services/")({ ...click, metaKey: true, preventDefault });
    openInDesktop(undefined, "/services/")({ ...click, preventDefault });
    expect(opened).toEqual([]);
    expect(prevented).toBe(false);
  });
});
