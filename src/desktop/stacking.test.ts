import { describe, expect, it } from "vitest";
import { raise, zIndex } from "./stacking";

describe("stacking", () => {
  it("moves a window to the top", () => {
    expect(raise(["term", "hire"], "term")).toEqual(["hire", "term"]);
  });

  it("adds a window that isn't stacked yet", () => {
    expect(raise(["term"], "hire")).toEqual(["term", "hire"]);
  });

  it("leaves the order alone when the window is already on top", () => {
    const order = ["term", "hire"] as const;
    expect(raise(order, "hire")).toBe(order);
  });

  it("gives later windows higher z-indexes", () => {
    expect(zIndex(["hire", "term"], "term")).toBeGreaterThan(zIndex(["hire", "term"], "hire"));
  });
});
