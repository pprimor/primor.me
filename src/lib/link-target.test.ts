import { describe, expect, it } from "vitest";
import { linkTargetProps } from "./link-target";

describe("linkTargetProps", () => {
  it("opens off-site links in a new tab", () => {
    expect(linkTargetProps("https://github.com/pprimor")).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });

  it("keeps same-site paths and mailto in the same tab", () => {
    expect(linkTargetProps("/services/")).toEqual({});
    expect(linkTargetProps("mailto:hello@primor.me")).toEqual({});
  });
});
