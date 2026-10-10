import { describe, expect, it } from "vitest";
import { contrastRatio } from "../hosts/themes";
import { TITLE_INACTIVE } from "./chrome";

describe("window chrome", () => {
  it("white title text on an unfocused title bar meets AA", () => {
    expect(contrastRatio("#ffffff", TITLE_INACTIVE)).toBeGreaterThanOrEqual(4.5);
  });
});
