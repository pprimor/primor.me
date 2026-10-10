import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PANEL_IDS } from "../ids";
import { panels } from "./index";

describe("host panels", () => {
  for (const id of PANEL_IDS) {
    it(`${id} renders and draws nothing focusable`, () => {
      const html = renderToStaticMarkup(createElement(panels[id]));
      expect(html.length).toBeGreaterThan(100);
      expect(html).not.toMatch(/<(a|button|input|select|textarea)[\s>]/);
      expect(html).not.toMatch(/tabindex/i);
    });
  }
});
