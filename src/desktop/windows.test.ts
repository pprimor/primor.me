import { describe, expect, it } from "vitest";
import type { Rect } from "./geometry";
import { deskReducer, isVisible, windowState, type Desk } from "./windows";

const at = (x: number): Rect => ({ x, y: 40, width: 300, height: 200 });

function desk(): Desk {
  return {
    windows: {
      readme: windowState(at(100)),
      photoshop: windowState(at(110)),
      jira: windowState(at(120)),
      canva: windowState(at(130)),
      word: windowState(at(140)),
      term: windowState(at(150), "minimized"),
      hire: windowState(at(160), "closed"),
      web: windowState(at(170), "closed"),
    },
    stack: ["photoshop", "jira", "canva", "word", "readme"],
    focused: "readme",
  };
}

describe("windowState", () => {
  it("starts at its home rect with session 0", () => {
    const w = windowState(at(10));
    expect(w).toEqual({ rect: at(10), home: at(10), mode: "normal", lastShown: "normal", session: 0 });
    expect(isVisible(w)).toBe(true);
    expect(isVisible(windowState(at(10), "minimized"))).toBe(false);
  });
});

describe("deskReducer", () => {
  it("show restores a minimised window, focuses and raises it", () => {
    const next = deskReducer(desk(), { type: "show", id: "term" });
    expect(next.windows.term.mode).toBe("normal");
    expect(next.focused).toBe("term");
    expect(next.stack.at(-1)).toBe("term");
  });

  it("show reopens a closed window", () => {
    const next = deskReducer(desk(), { type: "show", id: "hire" });
    expect(next.windows.hire.mode).toBe("normal");
    expect(next.focused).toBe("hire");
  });

  it("show keeps a maximised window maximised", () => {
    const max = deskReducer(desk(), { type: "toggleMaximize", id: "jira" });
    const next = deskReducer(max, { type: "show", id: "jira" });
    expect(next.windows.jira.mode).toBe("maximized");
  });

  it("minimise clears focus only when the window had it", () => {
    const a = deskReducer(desk(), { type: "minimize", id: "readme" });
    expect(a.windows.readme.mode).toBe("minimized");
    expect(a.focused).toBeNull();
    const b = deskReducer(desk(), { type: "minimize", id: "jira" });
    expect(b.focused).toBe("readme");
  });

  it("close resets the window to its home, bumps its session and clears focus", () => {
    const moved = deskReducer(desk(), { type: "move", id: "readme", rect: at(500) });
    const next = deskReducer(moved, { type: "close", id: "readme" });
    expect(next.windows.readme).toMatchObject({ mode: "closed", rect: at(100), session: 1, lastShown: "normal" });
    expect(next.focused).toBeNull();
  });

  it("toggle minimises the focused visible window and shows anything else", () => {
    const a = deskReducer(desk(), { type: "toggle", id: "readme" });
    expect(a.windows.readme.mode).toBe("minimized");
    const b = deskReducer(desk(), { type: "toggle", id: "jira" });
    expect(b.windows.jira.mode).toBe("normal");
    expect(b.focused).toBe("jira");
    const c = deskReducer(desk(), { type: "toggle", id: "term" });
    expect(c.windows.term.mode).toBe("normal");
    expect(c.focused).toBe("term");
  });

  it("toggleMaximize flips the mode, and a minimised window comes back as it was", () => {
    const max = deskReducer(desk(), { type: "toggleMaximize", id: "canva" });
    expect(max.windows.canva.mode).toBe("maximized");
    const min = deskReducer(max, { type: "minimize", id: "canva" });
    expect(deskReducer(min, { type: "show", id: "canva" }).windows.canva.mode).toBe("maximized");
    expect(deskReducer(max, { type: "toggleMaximize", id: "canva" }).windows.canva.mode).toBe("normal");
  });

  it("focus on the window already focused and on top changes nothing", () => {
    const d = desk();
    expect(deskReducer(d, { type: "focus", id: "readme" })).toBe(d);
    expect(deskReducer(d, { type: "focus", id: "jira" }).stack.at(-1)).toBe("jira");
  });

  it("move updates only the rect", () => {
    const next = deskReducer(desk(), { type: "move", id: "jira", rect: at(400) });
    expect(next.windows.jira.rect).toEqual(at(400));
    expect(next.windows.jira.home).toEqual(at(120));
  });

  it("blur clears focus", () => {
    expect(deskReducer(desk(), { type: "blur" }).focused).toBeNull();
  });

  it("fit keeps where a window reopens fully inside a smaller desktop", () => {
    const wide = { ...desk(), windows: { ...desk().windows, word: windowState({ x: 994, y: 400, width: 432, height: 300 }) } };
    const small: Rect = { x: 0, y: 28, width: 900, height: 572 };
    const { home } = deskReducer(wide, { type: "fit", desktop: small }).windows.word;
    expect(home.x).toBeGreaterThanOrEqual(small.x);
    expect(home.x + home.width).toBeLessThanOrEqual(small.x + small.width);
    expect(home.y + home.height).toBeLessThanOrEqual(small.y + small.height);
  });

  it("fit pulls every window, and where it reopens, back inside a smaller desktop", () => {
    const far = deskReducer(desk(), { type: "move", id: "word", rect: { x: 1300, y: 900, width: 400, height: 300 } });
    const small: Rect = { x: 0, y: 28, width: 800, height: 572 };
    const next = deskReducer(far, { type: "fit", desktop: small });
    for (const w of Object.values(next.windows)) {
      expect(w.rect.x).toBeLessThanOrEqual(small.width - 80);
      expect(w.rect.y).toBeLessThanOrEqual(small.y + small.height - 24);
      expect(w.home.x).toBeLessThanOrEqual(small.width - 80);
    }
  });
});
