import { describe, expect, it } from "vitest";
import { back, canGoBack, canGoForward, current, forward, startHistory, visit } from "./browserHistory";

describe("browser history", () => {
  it("starts at the opening page with nowhere to go", () => {
    const h = startHistory("/services/");
    expect(current(h)).toBe("/services/");
    expect(canGoBack(h)).toBe(false);
    expect(canGoForward(h)).toBe(false);
  });

  it("records visits and walks back and forward", () => {
    let h = visit(startHistory("/services/"), "/services/canva-apps/");
    expect(canGoBack(h)).toBe(true);
    h = back(h);
    expect(current(h)).toBe("/services/");
    expect(canGoForward(h)).toBe(true);
    h = forward(h);
    expect(current(h)).toBe("/services/canva-apps/");
  });

  it("ignores a load of the page it is already on, e.g. after Back or Reload", () => {
    const h = visit(startHistory("/services/"), "/services/canva-apps/");
    const afterBack = back(h);
    expect(visit(afterBack, "/services/")).toBe(afterBack);
  });

  it("drops forward entries when a new page is visited", () => {
    let h = visit(startHistory("/services/"), "/services/canva-apps/");
    h = visit(back(h), "/services/office-add-ins/");
    expect(canGoForward(h)).toBe(false);
    expect(h.entries).toEqual(["/services/", "/services/office-add-ins/"]);
  });

  it("does nothing past either end", () => {
    const h = startHistory("/services/");
    expect(back(h)).toBe(h);
    expect(forward(h)).toBe(h);
  });
});
