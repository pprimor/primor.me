# Integration Desktop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the primor.me X11 desktop from "one xterm" into a desktop whose windows are the host apps Pedro builds integrations for (Photoshop, Jira, Canva, Word), each themed like its host, with a README window focused on load.

**Architecture:** Integration data lives in `content/integrations.yaml` (listing URLs resolved from `experience.yaml`). A pure reducer (`src/desktop/windows.ts`) manages all seven windows; a pure `initialDesk()` (`src/desktop/layout.ts`) decides where they start per width band. Host panels are static, decorative React components themed through CSS custom properties from `src/hosts/themes.ts`. Phones get a separate scrolling `CompactDesktop`.

**Tech Stack:** React 19, TypeScript, Tailwind 3, Vite, Vitest on `@cloudflare/vitest-pool-workers` (tests are `*.test.ts`, no DOM), zod 4, `yaml`.

**Spec:** `docs/superpowers/specs/2026-10-11-integration-desktop-design.md`

**Work in:** `/Users/primor/Developer/primor.me-integration-desktop` (branch `feat/integration-desktop`). Run every command from there.

## Global Constraints

- No new runtime dependencies (`package.json` `dependencies` unchanged).
- Lighthouse thresholds in `lighthouserc.json` keep passing; accessibility stays 1.0 (manual check).
- Every host theme's text/background pairs ≥ 4.5:1 (WCAG AA), enforced by `src/hosts/themes.test.ts`.
- No host logos, no recreated proprietary UI, no web fonts: interiors use colour, radius, layout and system font stacks only.
- Mock panels are decorative: no `<a>`, `<button>`, `<input>`, `<select>`, `<textarea>` or `tabindex` inside them.
- The terminal keeps working, including `hire`.
- `service` fields in `integrations.yaml` stay unset on this branch (service pages aren't merged).
- TDD: failing test first for every pure unit.
- Commit messages: conventional (`feat(desktop): …`), ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never add "Generated with Claude Code".

### Deviations from the spec (decided while planning)

- `stacking.ts` is kept and reused by `windows.ts` rather than absorbed. Same behaviour, less churn.
- `integrations.yaml` lists all nine integrations; the four with windows carry a `window` block (instead of an `onDesktop` flag).
- Desktop icons: Hire me, xterm, and the five integrations without windows. CV, GitHub, LinkedIn and Email move to the Applications menu only (and CV to the README). Fifteen icons don't fit one column at 1280×720 and a second column would sit under the README.
- Canva theme uses our own neutral values (white, greys, a purple of our choosing), so the Canva UI Kit licence question doesn't arise.
- Unfocused title bars darken from `#7b7b7b` to `#6b6b6b`: white on `#7b7b7b` is 4.2:1, and four unfocused windows now show on load.

## Review Focus

1. **Browser resized across width bands after load** (e.g. 1440 → 900 wide): every window must stay grabbable, and reopen inside the new desktop. Pinned in Task 3 (`fit` test).
2. **Short wide screens (1280×720):** host windows must fit vertically and stay clear of the icon column. Pinned in Task 4.
3. **Unfocused title bars visible on load:** white title text on inactive grey must pass AA. Pinned in Task 6 (`chrome` contrast test).
4. **`open` with an integration that has no window** (`open indesign`): should offer the listing link, not "no such window". Pinned in Task 5.
5. **Keyboard users tabbing through the desktop:** focus must never land inside a decorative mock panel. Pinned in Task 6 (`panels.test.ts`).

---

### Task 1: Integration content

**Files:**
- Create: `src/hosts/ids.ts`, `src/desktop/ids.ts`, `content/integrations.yaml`
- Modify: `src/lib/content/schemas.ts`, `src/lib/content/parse.ts`, `src/lib/content/index.ts`, `src/lib/data.ts`
- Test: `src/lib/content/parse.test.ts`

**Interfaces:**
- Produces:
  - `src/hosts/ids.ts`: `PANEL_IDS = ["photoshop", "jira", "canva", "word"] as const`, `type PanelId`
  - `src/desktop/ids.ts`: `WINDOW_IDS = ["readme", ...PANEL_IDS, "term", "hire"] as const`, `type WindowId`
  - `src/lib/data.ts` exports `integrations: Integration[]`, `isWindowed(i): i is WindowedIntegration`, types `Integration`, `WindowedIntegration`
  - `type Integration = { id: string; host: string; stack: string; icon: string; listing: { label: string; url: string }; service?: string; window?: { title: string; caption: string } }`
  - `type WindowedIntegration = Integration & { id: PanelId; window: { title: string; caption: string } }`
  - `parseIntegrationsYaml(raw: string, plugins: readonly { name: string; url: string }[]): Integration[]`

- [ ] **Step 1: Create the id modules**

`src/hosts/ids.ts`:

```ts
/** Host apps that get a themed window on the desktop. */
export const PANEL_IDS = ["photoshop", "jira", "canva", "word"] as const;

export type PanelId = (typeof PANEL_IDS)[number];
```

`src/desktop/ids.ts`:

```ts
import { PANEL_IDS } from "../hosts/ids";

/** Every desktop window, in taskbar order. */
export const WINDOW_IDS = ["readme", ...PANEL_IDS, "term", "hire"] as const;

export type WindowId = (typeof WINDOW_IDS)[number];
```

- [ ] **Step 2: Write `content/integrations.yaml`**

```yaml
# Integrations shown on the desktop. `plugin` names an entry in experience.yaml's
# plugins, which supplies the listing URL. Entries with `window` get a themed
# host window; their id must be one of src/hosts/ids.ts PANEL_IDS.
- id: photoshop
  host: Adobe Photoshop
  plugin: PageProof for Adobe Photoshop
  listing: Adobe Exchange
  stack: UXP · React · TypeScript
  icon: "#31a8ff"
  window:
    title: Photoshop — PageProof
    caption: "PageProof's Photoshop panel: three proofs of the open document, one approved, one with four change requests and one in review, with a button to create a proof from the document."
- id: jira
  host: Jira
  plugin: PageProof for Jira
  listing: pageproof.com
  stack: Atlassian Forge · Azure Functions · TypeScript
  icon: "#0c66e4"
  window:
    title: Jira — DES-142
    caption: "PageProof's Jira issue panel: a linked proof approved by three of three reviewers, with the approved file attached to the issue."
- id: canva
  host: Canva
  plugin: PageProof for Canva
  listing: pageproof.com
  stack: Canva Apps SDK · React · TypeScript
  icon: "#7d2ae8"
  window:
    title: Canva — PageProof app
    caption: "PageProof's Canva app: sending the open design for review, with reviewers and a due date."
- id: word
  host: Microsoft Word
  plugin: PageProof for Microsoft Office
  listing: Microsoft Marketplace
  stack: Office.js · React · TypeScript
  icon: "#d83b01"
  window:
    title: Word — PageProof add-in
    caption: "PageProof's Office add-in in Word: a taskpane beside the document with reviewer comments and a button to upload a new version."
- id: indesign
  host: Adobe InDesign
  plugin: PageProof for Adobe InDesign
  listing: Adobe Exchange
  stack: UXP · React · TypeScript
  icon: "#ff3366"
- id: quarkxpress
  host: QuarkXPress
  plugin: PageProof for QuarkXPress
  listing: pageproof.com
  stack: Native XTension · React · TypeScript
  icon: "#008a4b"
- id: finalcut
  host: Final Cut Pro
  plugin: PageProof for Final Cut Pro
  listing: pageproof.com
  stack: Swift · SwiftUI
  icon: "#5a5a5a"
- id: canto
  host: Canto
  plugin: PageProof for Canto
  listing: pageproof.com
  stack: FinalFile delivery
  icon: "#c2410c"
- id: bynder
  host: Bynder
  plugin: PageProof for Bynder
  listing: pageproof.com
  stack: FinalFile delivery
  icon: "#1f3c88"
```

- [ ] **Step 3: Write the failing tests**

Append to `src/lib/content/parse.test.ts`. Add `parseIntegrationsYaml` to the existing `./parse` import, and add these imports at the top:

```ts
import { parse as parseYaml, stringify } from "yaml";
import { PANEL_IDS } from "../../hosts/ids";
```

```ts
describe("parseIntegrationsYaml", () => {
  const plugins = parseExperienceYaml(readContent("experience")).flatMap(
    (e) => e.plugins ?? [],
  );
  const base = () =>
    parseYaml(readContent("integrations")) as Record<string, unknown>[];

  it("parses production integrations.yaml, resolving listing URLs from experience.yaml", () => {
    const integrations = parseIntegrationsYaml(readContent("integrations"), plugins);
    expect(integrations).toHaveLength(9);
    const jira = integrations.find((i) => i.id === "jira");
    expect(jira?.listing.url).toBe(
      plugins.find((p) => p.name === "PageProof for Jira")?.url,
    );
    const windowed = integrations.filter((i) => i.window).map((i) => i.id);
    expect([...windowed].sort()).toEqual([...PANEL_IDS].sort());
  });

  it("rejects a plugin name experience.yaml doesn't have", () => {
    const entries = base();
    entries[0]!.plugin = "PageProof for Nothing";
    expect(() => parseIntegrationsYaml(stringify(entries), plugins)).toThrow(
      /unknown plugin/,
    );
  });

  it("rejects duplicate ids", () => {
    const entries = base();
    entries.push({ ...entries.at(-1)! });
    expect(() => parseIntegrationsYaml(stringify(entries), plugins)).toThrow(ZodError);
  });

  it("rejects a window on an integration that has no panel", () => {
    const entries = base();
    const indesign = entries.find((e) => e.id === "indesign")!;
    indesign.window = { title: "InDesign", caption: "x" };
    expect(() => parseIntegrationsYaml(stringify(entries), plugins)).toThrow(ZodError);
  });

  it("rejects a panel integration without its window", () => {
    const entries = base();
    delete entries.find((e) => e.id === "jira")!.window;
    expect(() => parseIntegrationsYaml(stringify(entries), plugins)).toThrow(ZodError);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test -- src/lib/content/parse.test.ts`
Expected: FAIL: `parseIntegrationsYaml` is not exported.

- [ ] **Step 5: Add the schema**

Append to `src/lib/content/schemas.ts` (add `import { PANEL_IDS } from "../../hosts/ids";` at the top):

```ts
export const integrationSchema = z.object({
  id: z.string().regex(/^[a-z]+$/),
  host: z.string().min(1),
  plugin: z.string().min(1),
  listing: z.string().min(1),
  stack: z.string().min(1),
  icon: z.string().regex(/^#[0-9a-f]{6}$/i),
  service: z.string().regex(/^[a-z0-9-]+$/).optional(),
  window: z
    .object({ title: z.string().min(1), caption: z.string().min(1) })
    .optional(),
});

const panelIds: readonly string[] = PANEL_IDS;

export const integrationsFileSchema = z
  .array(integrationSchema)
  .min(1)
  .superRefine((entries, ctx) => {
    const seen = new Set<string>();
    entries.forEach((entry, i) => {
      if (seen.has(entry.id)) {
        ctx.addIssue({ code: "custom", path: [i, "id"], message: `Duplicate id ${entry.id}` });
      }
      seen.add(entry.id);
      const isPanel = panelIds.includes(entry.id);
      if (isPanel !== Boolean(entry.window)) {
        ctx.addIssue({
          code: "custom",
          path: [i, "window"],
          message: isPanel ? `${entry.id} needs a window` : `${entry.id} has no panel, so no window`,
        });
      }
    });
    for (const id of PANEL_IDS) {
      if (!seen.has(id)) {
        ctx.addIssue({ code: "custom", path: [], message: `Missing integration for panel ${id}` });
      }
    }
  });

export type IntegrationYaml = z.infer<typeof integrationSchema>;
```

- [ ] **Step 6: Add the parser**

Append to `src/lib/content/parse.ts` (add `integrationsFileSchema` to the `./schemas` import, and `import { PANEL_IDS, type PanelId } from "../../hosts/ids";`):

```ts
type PluginLink = { name: string; url: string };

export function parseIntegrationsYaml(raw: string, plugins: readonly PluginLink[]) {
  const entries = integrationsFileSchema.parse(parseYaml(raw));
  return entries.map((entry) => {
    const plugin = plugins.find((p) => p.name === entry.plugin);
    if (!plugin) {
      throw new Error(`integrations.yaml: ${entry.id} names unknown plugin "${entry.plugin}"`);
    }
    return {
      id: entry.id,
      host: entry.host,
      stack: entry.stack,
      icon: entry.icon,
      listing: { label: entry.listing, url: plugin.url },
      service: entry.service,
      window: entry.window,
    };
  });
}

export type Integration = ReturnType<typeof parseIntegrationsYaml>[number];

export type WindowedIntegration = Integration & {
  id: PanelId;
  window: NonNullable<Integration["window"]>;
};

const panelIds: readonly string[] = PANEL_IDS;

export function isWindowed(integration: Integration): integration is WindowedIntegration {
  return integration.window !== undefined && panelIds.includes(integration.id);
}
```

- [ ] **Step 7: Export from the content index and data module**

In `src/lib/content/index.ts`, add `parseIntegrationsYaml` to the `./parse` import, and after the `skills` export:

```ts
export const integrations = parseIntegrationsYaml(
  getContentYaml("integrations"),
  experienceData.flatMap((entry) => entry.plugins ?? []),
);

export { isWindowed } from "./parse";
```

and extend the type export line to:

```ts
export type { Project, ExperienceEntry, SkillCategory, Skills, Integration, WindowedIntegration } from "./parse";
```

Replace `src/lib/data.ts` with:

```ts
export { projects, experienceData, skills, integrations, isWindowed } from "./content";

export type {
  Project,
  ExperienceEntry,
  SkillCategory,
  Skills,
  Integration,
  WindowedIntegration,
} from "./content";
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test -- src/lib/content/parse.test.ts`
Expected: PASS (all parse tests, including the existing ones).

- [ ] **Step 9: Typecheck and commit**

Run: `npm run typecheck`
Expected: no errors.

```bash
git add content/integrations.yaml src/hosts/ids.ts src/desktop/ids.ts src/lib
git commit -m "feat(content): integrations list with host windows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Host themes

**Files:**
- Create: `src/hosts/themes.ts`
- Test: `src/hosts/themes.test.ts`

**Interfaces:**
- Consumes: `PanelId`, `PANEL_IDS` from `src/hosts/ids.ts`
- Produces:
  - `type HostTheme = { surface; raised; text; muted; accent; onAccent; border; positive; notice; info: string; radius: number; font: string }`
  - `themes: Record<PanelId, HostTheme>`
  - `contrastRatio(a: string, b: string): number` (hex `#rrggbb`)
  - `themeStyle(theme: HostTheme): CSSProperties`, which sets `--host-surface`, `--host-raised`, `--host-text`, `--host-muted`, `--host-accent`, `--host-on-accent`, `--host-border`, `--host-positive`, `--host-notice`, `--host-info`, `--host-radius` plus `fontFamily`, `color`, `background`

- [ ] **Step 1: Write the failing test**

`src/hosts/themes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PANEL_IDS } from "./ids";
import { contrastRatio, themes, themeStyle } from "./themes";

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a colour on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBe(1);
  });
});

describe("themes", () => {
  for (const id of PANEL_IDS) {
    const t = themes[id];
    for (const fg of ["text", "muted", "positive", "notice", "info"] as const) {
      for (const bg of ["surface", "raised"] as const) {
        it(`${id}: ${fg} on ${bg} meets AA`, () => {
          expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
    it(`${id}: onAccent on accent meets AA`, () => {
      expect(contrastRatio(t.onAccent, t.accent)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("exposes theme values as CSS custom properties", () => {
    const style = themeStyle(themes.jira) as Record<string, string>;
    expect(style["--host-accent"]).toBe(themes.jira.accent);
    expect(style["--host-radius"]).toBe(`${themes.jira.radius}px`);
    expect(style.fontFamily).toBe(themes.jira.font);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/hosts/themes.test.ts`
Expected: FAIL: cannot resolve `./themes`.

- [ ] **Step 3: Implement**

`src/hosts/themes.ts`:

```ts
import type { CSSProperties } from "react";
import type { PanelId } from "./ids";

export type HostTheme = {
  surface: string;
  raised: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  border: string;
  positive: string;
  notice: string;
  info: string;
  radius: number;
  font: string;
};

const SYSTEM = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * A few values per host, copied by hand; no design-system packages.
 * Every text colour must pass AA on both surface and raised (themes.test.ts).
 */
export const themes: Record<PanelId, HostTheme> = {
  // Adobe Spectrum, dark theme as used by UXP panels: https://spectrum.adobe.com/page/color-palette/
  photoshop: {
    surface: "#252525",
    raised: "#323232",
    text: "#ebebeb",
    muted: "#b3b3b3",
    accent: "#0d66d0",
    onAccent: "#ffffff",
    border: "#4a4a4a",
    positive: "#4bc87c",
    notice: "#e8a33d",
    info: "#78bbfa",
    radius: 4,
    font: SYSTEM,
  },
  // Atlassian Design System colours and radius only: https://atlassian.design/foundations/color
  jira: {
    surface: "#ffffff",
    raised: "#f7f8f9",
    text: "#172b4d",
    muted: "#44546f",
    accent: "#0c66e4",
    onAccent: "#ffffff",
    border: "#dcdfe4",
    positive: "#216e4e",
    notice: "#a54800",
    info: "#0055cc",
    radius: 4,
    font: SYSTEM,
  },
  // Our own neutral light theme with a purple accent; not taken from Canva's kit.
  canva: {
    surface: "#ffffff",
    raised: "#f4f4f6",
    text: "#1b1b1f",
    muted: "#56565f",
    accent: "#6a2bd9",
    onAccent: "#ffffff",
    border: "#c8ccd1",
    positive: "#1d7a46",
    notice: "#9a5b00",
    info: "#2257c5",
    radius: 8,
    font: SYSTEM,
  },
  // Microsoft Fluent 2, light: https://fluent2.microsoft.design/color
  word: {
    surface: "#ffffff",
    raised: "#f5f5f5",
    text: "#242424",
    muted: "#616161",
    accent: "#0f6cbd",
    onAccent: "#ffffff",
    border: "#d1d1d1",
    positive: "#0e700e",
    notice: "#8a3707",
    info: "#115ea3",
    radius: 4,
    font: '"Segoe UI", system-ui, -apple-system, sans-serif',
  },
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function themeStyle(t: HostTheme): CSSProperties {
  return {
    "--host-surface": t.surface,
    "--host-raised": t.raised,
    "--host-text": t.text,
    "--host-muted": t.muted,
    "--host-accent": t.accent,
    "--host-on-accent": t.onAccent,
    "--host-border": t.border,
    "--host-positive": t.positive,
    "--host-notice": t.notice,
    "--host-info": t.info,
    "--host-radius": `${t.radius}px`,
    fontFamily: t.font,
    color: t.text,
    background: t.surface,
  } as CSSProperties;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/hosts/themes.test.ts`
Expected: PASS. If a pair fails, darken the foreground colour (or lighten a dark theme's) in small steps until it passes. Don't change the test.

- [ ] **Step 5: Commit**

```bash
git add src/hosts/themes.ts src/hosts/themes.test.ts
git commit -m "feat(hosts): per-host themes with an AA contrast check

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Window manager reducer

**Files:**
- Create: `src/desktop/windows.ts`
- Test: `src/desktop/windows.test.ts`

**Interfaces:**
- Consumes: `WindowId` (`src/desktop/ids.ts`), `Rect`, `clampRect` (`src/desktop/geometry.ts`), `raise`, `Stack` (`src/desktop/stacking.ts`)
- Produces:
  - `type WindowMode = "normal" | "maximized" | "minimized" | "closed"`
  - `type WindowState = { rect: Rect; home: Rect; mode: WindowMode; lastShown: "normal" | "maximized"; session: number }`
  - `type Desk = { windows: Record<WindowId, WindowState>; stack: Stack<WindowId>; focused: WindowId | null }`
  - `type DeskAction = { type: "show" | "focus" | "toggle" | "minimize" | "close" | "toggleMaximize"; id: WindowId } | { type: "move"; id: WindowId; rect: Rect } | { type: "blur" } | { type: "fit"; desktop: Rect }`
  - `windowState(rect: Rect, mode?: WindowMode): WindowState`
  - `isVisible(w: WindowState): boolean`
  - `deskReducer(desk: Desk, action: DeskAction): Desk`

- [ ] **Step 1: Write the failing test**

`src/desktop/windows.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/desktop/windows.test.ts`
Expected: FAIL: cannot resolve `./windows`.

- [ ] **Step 3: Implement**

`src/desktop/windows.ts`:

```ts
import { clampRect, type Rect } from "./geometry";
import type { WindowId } from "./ids";
import { raise, type Stack } from "./stacking";

export type WindowMode = "normal" | "maximized" | "minimized" | "closed";

export type WindowState = {
  rect: Rect;
  /** Where the window reopens after being closed. */
  home: Rect;
  mode: WindowMode;
  lastShown: "normal" | "maximized";
  /** Bumped on close so the next open starts fresh (terminal session, form). */
  session: number;
};

export type Desk = {
  windows: Record<WindowId, WindowState>;
  stack: Stack<WindowId>;
  focused: WindowId | null;
};

export type DeskAction =
  | { type: "show" | "focus" | "toggle" | "minimize" | "close" | "toggleMaximize"; id: WindowId }
  | { type: "move"; id: WindowId; rect: Rect }
  | { type: "blur" }
  | { type: "fit"; desktop: Rect };

export function windowState(rect: Rect, mode: WindowMode = "normal"): WindowState {
  return { rect, home: rect, mode, lastShown: "normal", session: 0 };
}

export function isVisible(w: WindowState): boolean {
  return w.mode === "normal" || w.mode === "maximized";
}

function update(desk: Desk, id: WindowId, patch: Partial<WindowState>): Desk {
  return { ...desk, windows: { ...desk.windows, [id]: { ...desk.windows[id], ...patch } } };
}

function focus(desk: Desk, id: WindowId): Desk {
  return { ...desk, focused: id, stack: raise(desk.stack, id) };
}

function show(desk: Desk, id: WindowId): Desk {
  const w = desk.windows[id];
  return focus(update(desk, id, { mode: isVisible(w) ? w.mode : w.lastShown }), id);
}

function hide(desk: Desk, id: WindowId, patch: Partial<WindowState>): Desk {
  const next = update(desk, id, patch);
  return desk.focused === id ? { ...next, focused: null } : next;
}

export function deskReducer(desk: Desk, action: DeskAction): Desk {
  switch (action.type) {
    case "show":
      return show(desk, action.id);
    case "focus":
      return desk.focused === action.id && desk.stack.at(-1) === action.id
        ? desk
        : focus(desk, action.id);
    case "toggle":
      return isVisible(desk.windows[action.id]) && desk.focused === action.id
        ? hide(desk, action.id, { mode: "minimized" })
        : show(desk, action.id);
    case "minimize":
      return hide(desk, action.id, { mode: "minimized" });
    case "close": {
      const w = desk.windows[action.id];
      return hide(desk, action.id, { mode: "closed", lastShown: "normal", session: w.session + 1, rect: w.home });
    }
    case "toggleMaximize": {
      const next = desk.windows[action.id].mode === "maximized" ? "normal" : "maximized";
      return focus(update(desk, action.id, { mode: next, lastShown: next }), action.id);
    }
    case "move":
      return update(desk, action.id, { rect: action.rect });
    case "blur":
      return desk.focused === null ? desk : { ...desk, focused: null };
    case "fit": {
      const windows = Object.fromEntries(
        Object.entries(desk.windows).map(([id, w]) => [
          id,
          { ...w, rect: clampRect(w.rect, action.desktop), home: clampRect(w.home, action.desktop) },
        ]),
      ) as Record<WindowId, WindowState>;
      return { ...desk, windows };
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/desktop/windows.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/desktop/windows.ts src/desktop/windows.test.ts
git commit -m "feat(desktop): one reducer for every window's state

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Initial layout and width bands

**Files:**
- Create: `src/desktop/layout.ts`
- Rename: `src/desktop/useWindowState.ts` → `src/desktop/useDesktopArea.ts` (keep `useDesktopArea` and `PANEL_HEIGHT`; drop `useWindowState`)
- Modify: `src/desktop/Panel.tsx` (import path)
- Test: `src/desktop/layout.test.ts`

**Interfaces:**
- Consumes: `windowState`, `Desk`, `WindowState` (Task 3); `PANEL_IDS`, `PanelId`; `initialRect`, `clampRect`, `Rect`, `Size` (geometry)
- Produces:
  - `type Band = "compact" | "medium" | "wide"`, `COMPACT_MAX = 640`, `WIDE_MIN = 1280`, `ICON_COLUMN = 96`
  - `bandFor(width: number): Band`
  - `initialDesk(desktop: Rect): Desk`
  - `src/desktop/useDesktopArea.ts`: `PANEL_HEIGHT`, `useDesktopArea(): { desktop: Rect; compact: boolean }`

`Desktop.tsx` still imports `useWindowState` after the rename. That's fixed in Task 7, so this task's typecheck step expects exactly that one error.

- [ ] **Step 1: Write the failing test**

`src/desktop/layout.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PANEL_IDS } from "../hosts/ids";
import type { Rect } from "./geometry";
import { ICON_COLUMN, bandFor, initialDesk } from "./layout";
import { isVisible } from "./windows";

const screen = (width: number, height: number): Rect => ({ x: 0, y: 28, width, height: height - 28 });

function inside(rect: Rect, desktop: Rect) {
  expect(rect.x).toBeGreaterThanOrEqual(desktop.x + ICON_COLUMN);
  expect(rect.x + rect.width).toBeLessThanOrEqual(desktop.x + desktop.width);
  expect(rect.y).toBeGreaterThanOrEqual(desktop.y);
  expect(rect.y + rect.height).toBeLessThanOrEqual(desktop.y + desktop.height);
}

describe("bandFor", () => {
  it("splits at 640 and 1280", () => {
    expect(bandFor(639)).toBe("compact");
    expect(bandFor(640)).toBe("medium");
    expect(bandFor(1279)).toBe("medium");
    expect(bandFor(1280)).toBe("wide");
  });
});

describe("initialDesk", () => {
  it("wide: README focused on top, host windows open, terminal minimised, hire closed", () => {
    const d = initialDesk(screen(1440, 900));
    expect(d.focused).toBe("readme");
    expect(d.stack.at(-1)).toBe("readme");
    for (const id of PANEL_IDS) expect(d.windows[id].mode).toBe("normal");
    expect(d.windows.term.mode).toBe("minimized");
    expect(d.windows.hire.mode).toBe("closed");
  });

  for (const [w, h] of [[1280, 720], [1440, 900], [2560, 1440]] as const) {
    it(`wide ${w}×${h}: open windows fit the desktop, clear of the icon column`, () => {
      const desktop = screen(w, h);
      const d = initialDesk(desktop);
      for (const id of ["readme", ...PANEL_IDS] as const) inside(d.windows[id].rect, desktop);
    });
  }

  it("medium: only README is open; host windows wait in the taskbar", () => {
    const d = initialDesk(screen(1024, 768));
    expect(isVisible(d.windows.readme)).toBe(true);
    expect(d.focused).toBe("readme");
    for (const id of PANEL_IDS) expect(d.windows[id].mode).toBe("minimized");
  });

  it("medium: README stays clear of the icons on a narrow desktop", () => {
    const desktop = screen(700, 800);
    inside(initialDesk(desktop).windows.readme.rect, desktop);
  });

  it("every window starts at its home with session 0", () => {
    for (const w of Object.values(initialDesk(screen(1440, 900)).windows)) {
      expect(w.home).toEqual(w.rect);
      expect(w.session).toBe(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/desktop/layout.test.ts`
Expected: FAIL: cannot resolve `./layout`.

- [ ] **Step 3: Implement `layout.ts`**

```ts
import { PANEL_IDS, type PanelId } from "../hosts/ids";
import { clampRect, initialRect, type Rect, type Size } from "./geometry";
import { windowState, type Desk, type WindowState } from "./windows";

export type Band = "compact" | "medium" | "wide";

export const COMPACT_MAX = 640;
export const WIDE_MIN = 1280;
/** Room kept clear on the left for the desktop icon column. */
export const ICON_COLUMN = 96;
const MARGIN = 16;

export function bandFor(width: number): Band {
  return width < COMPACT_MAX ? "compact" : width < WIDE_MIN ? "medium" : "wide";
}

type Fraction = { x: number; y: number; w: number; h: number };

/** Wide-band tiling, as fractions of the desktop area. */
const WIDE: Record<"readme" | PanelId, Fraction> = {
  readme: { x: 0.1, y: 0.03, w: 0.31, h: 0.33 },
  photoshop: { x: 0.44, y: 0.03, w: 0.22, h: 0.56 },
  jira: { x: 0.69, y: 0.07, w: 0.3, h: 0.42 },
  canva: { x: 0.1, y: 0.39, w: 0.23, h: 0.52 },
  word: { x: 0.69, y: 0.53, w: 0.3, h: 0.4 },
};

const README_SIZE: Size = { width: 560, height: 340 };
const HIRE_SIZE: Size = { width: 480, height: 480 };
const PANEL_SIZE: Record<PanelId, Size> = {
  photoshop: { width: 320, height: 520 },
  jira: { width: 460, height: 380 },
  canva: { width: 340, height: 460 },
  word: { width: 480, height: 360 },
};

function fromFraction(desktop: Rect, f: Fraction): Rect {
  return clampRect(
    {
      x: desktop.x + Math.round(desktop.width * f.x),
      y: desktop.y + Math.round(desktop.height * f.y),
      width: Math.round(desktop.width * f.w),
      height: Math.round(desktop.height * f.h),
    },
    desktop,
  );
}

function besideIcons(rect: Rect, desktop: Rect): Rect {
  const left = desktop.x + ICON_COLUMN;
  if (rect.x >= left) return rect;
  return { ...rect, x: left, width: Math.min(rect.width, desktop.x + desktop.width - left - MARGIN) };
}

/** Where every window starts: tiled on wide screens, README alone below that. */
export function initialDesk(desktop: Rect): Desk {
  const wide = bandFor(desktop.width) === "wide";
  const panels = Object.fromEntries(
    PANEL_IDS.map((id, i) => [
      id,
      wide
        ? windowState(fromFraction(desktop, WIDE[id]))
        : windowState(besideIcons(initialRect(desktop, PANEL_SIZE[id], 32 * (i + 1)), desktop), "minimized"),
    ]),
  ) as Record<PanelId, WindowState>;
  const readme = windowState(
    wide ? fromFraction(desktop, WIDE.readme) : besideIcons(initialRect(desktop, README_SIZE), desktop),
  );
  return {
    windows: {
      readme,
      ...panels,
      term: windowState(besideIcons(initialRect(desktop), desktop), "minimized"),
      hire: windowState(besideIcons(initialRect(desktop, HIRE_SIZE, 40), desktop), "closed"),
    },
    stack: wide ? [...PANEL_IDS, "readme"] : ["readme"],
    focused: "readme",
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/desktop/layout.test.ts`
Expected: PASS.

- [ ] **Step 5: Rename the hook module**

```bash
git mv src/desktop/useWindowState.ts src/desktop/useDesktopArea.ts
```

Replace the contents of `src/desktop/useDesktopArea.ts` with:

```ts
import { useEffect, useState } from "react";
import type { Rect } from "./geometry";
import { COMPACT_MAX } from "./layout";

export const PANEL_HEIGHT = 28;

function desktopArea(): Rect {
  return {
    x: 0,
    y: PANEL_HEIGHT,
    width: window.innerWidth,
    height: window.innerHeight - PANEL_HEIGHT,
  };
}

/** The desktop area below the panel, tracked across browser resizes. */
export function useDesktopArea(): { desktop: Rect; compact: boolean } {
  const [desktop, setDesktop] = useState(desktopArea);
  useEffect(() => {
    const onResize = () => setDesktop(desktopArea());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { desktop, compact: desktop.width < COMPACT_MAX };
}
```

In `src/desktop/Panel.tsx`, change `import { PANEL_HEIGHT } from "./useWindowState";` to `import { PANEL_HEIGHT } from "./useDesktopArea";`.

- [ ] **Step 6: Check nothing else imports the old module**

Run: `grep -rn "useWindowState" src App.tsx`
Expected: only `src/desktop/Desktop.tsx` (rewritten in Task 7).

- [ ] **Step 7: Commit**

```bash
git add src/desktop/layout.ts src/desktop/layout.test.ts src/desktop/useDesktopArea.ts src/desktop/Panel.tsx
git commit -m "feat(desktop): starting layout per width band

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Terminal: `ls integrations` and `open`

**Files:**
- Modify: `src/terminal/types.ts`, `src/terminal/commands.ts`, `src/terminal/Terminal.tsx:8-14` (content constant)
- Test: `src/terminal/shell.test.ts`

**Interfaces:**
- Consumes: `integrations`, `isWindowed`, `Integration` (Task 1); `WindowId` (Task 1)
- Produces:
  - `Content.integrations: readonly Integration[]`
  - `type App = Exclude<WindowId, "term">` (was `"hire"`). `Terminal`'s `onOpen(app: App)` now receives `"readme" | "hire" | PanelId`

- [ ] **Step 1: Write the failing tests**

In `src/terminal/shell.test.ts`, change the data import to `import { experienceData, integrations, projects, skills } from "../lib/data";` and the context to:

```ts
const ctx: ShellContext = {
  content: { projects, experience: experienceData, skills, site: siteMetadata, integrations },
  history: ["help", "whoami"],
  now: () => new Date(2026, 9, 11, 9, 30),
};
```

Add after the existing `hrefs` helper:

```ts
function segmentsOf(lines: readonly Line[]) {
  return lines.flatMap((line) => ("segments" in line ? line.segments : []));
}
```

Add inside `describe("run", …)`:

```ts
  it("ls shows an integrations folder you can click into", () => {
    expect(segmentsOf(run("ls", ctx).lines)).toContainEqual(
      expect.objectContaining({ text: "integrations/", run: "ls integrations" }),
    );
  });

  it("ls integrations lists every integration: windows open, the rest link out", () => {
    const result = run("ls integrations/", ctx);
    const text = linesToText(result.lines);
    for (const i of integrations) expect(text).toContain(i.id);
    expect(segmentsOf(result.lines)).toContainEqual(expect.objectContaining({ run: "open jira" }));
    const indesign = integrations.find((i) => i.id === "indesign")!;
    expect(hrefs(result.lines)).toContain(indesign.listing.url);
  });

  it("ls reports directories that don't exist", () => {
    expect(output("ls nope")).toContain("ls: cannot access 'nope': No such file or directory");
  });

  it("open asks the desktop to open a window", () => {
    expect(run("open jira", ctx).open).toBe("jira");
    expect(run("open README", ctx).open).toBe("readme");
    expect(run("open hire", ctx).open).toBe("hire");
  });

  it("open links to the listing for integrations without a window", () => {
    const result = run("open indesign", ctx);
    expect(result.open).toBeUndefined();
    const indesign = integrations.find((i) => i.id === "indesign")!;
    expect(hrefs(result.lines)).toContain(indesign.listing.url);
  });

  it("open reports unknown windows and missing operands", () => {
    expect(output("open nope")).toContain("open: nope: no such window");
    expect(output("open")).toContain("open: missing operand");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/terminal/shell.test.ts`
Expected: FAIL: type error on `integrations` in `Content` and/or `open` not found (`command not found`).

- [ ] **Step 3: Update the types**

In `src/terminal/types.ts`:

```ts
import type { WindowId } from "../desktop/ids";
import type { ExperienceEntry, Integration, Project, Skills } from "../lib/data";
import type { siteMetadata } from "../lib/site-metadata";
import type { Line } from "./lines";

export type Content = {
  projects: readonly Project[];
  experience: readonly ExperienceEntry[];
  skills: Skills;
  site: typeof siteMetadata;
  integrations: readonly Integration[];
};
```

and replace the `App` type with:

```ts
/** Desktop windows a command can ask to open. */
export type App = Exclude<WindowId, "term">;
```

(Leave `ShellContext`, `RunResult`, `Command` as they are.)

- [ ] **Step 4: Implement the commands**

In `src/terminal/commands.ts`, add `import { isWindowed } from "../lib/data";` and change the types import to `import type { Command, Content, RunResult, ShellContext } from "./types";`.

Replace the `ls` command with:

```ts
function integrationsListing(content: Content): Line {
  return line(
    ...content.integrations.flatMap((i, n) => [
      n ? "  " : "",
      isWindowed(i)
        ? { text: i.id, run: `open ${i.id}`, tone: "accent" as const }
        : { text: i.id, href: i.listing.url },
    ]),
  );
}

const ls: Command = {
  name: "ls",
  summary: "list files",
  run: (args, { content }) => {
    const [dir] = args;
    if (dir === undefined) {
      return out([
        line(
          ...Object.keys(files).flatMap((f, i) => [i ? "  " : "", { text: f, run: `cat ${f}`, tone: "accent" as const }]),
          "  ",
          { text: "integrations/", run: "ls integrations", tone: "accent" },
        ),
      ]);
    }
    if (dir.replace(/\/$/, "") === "integrations") return out([integrationsListing(content)]);
    return error(`ls: cannot access '${dir}': No such file or directory`);
  },
};
```

Add after the `hire` command:

```ts
const open: Command = {
  name: "open",
  summary: "open a desktop window",
  run: (args, { content }) => {
    const [target] = args;
    if (target === undefined) return error("open: missing operand — try 'ls integrations'");
    const id = target.toLowerCase();
    if (id === "readme" || id === "hire") return { lines: [], open: id };
    const integration = content.integrations.find((i) => i.id === id);
    if (integration && isWindowed(integration)) return { lines: [], open: integration.id };
    if (integration) {
      return out([
        line(`${integration.host} has no window here: `, link(displayUrl(integration.listing.url), integration.listing.url)),
      ]);
    }
    return error(`open: ${target}: no such window`);
  },
};
```

Add `open` to the registry right after `hire`:

```ts
const registry: readonly Command[] = [
  help, whoami, about, experience, projects, skills, contact, hire, open, cv,
  ls, cat, history, clear, echo, date, exit, sudo,
];
```

- [ ] **Step 5: Pass integrations into the live terminal**

In `src/terminal/Terminal.tsx`, change the data import to `import { experienceData, integrations, projects, skills } from "../lib/data";` and the constant to:

```ts
const content = { projects, experience: experienceData, skills, site: siteMetadata, integrations };
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- src/terminal/shell.test.ts`
Expected: PASS, including the existing `help`, `ls`, `hire` and `quickCommands` tests.

- [ ] **Step 7: Commit**

```bash
git add src/terminal
git commit -m "feat(terminal): ls integrations and open <window>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Host panels, host body and window chrome

**Files:**
- Create: `src/hosts/panels/Pill.tsx`, `src/hosts/panels/MockButton.tsx`, `src/hosts/panels/PhotoshopPanel.tsx`, `src/hosts/panels/JiraPanel.tsx`, `src/hosts/panels/CanvaPanel.tsx`, `src/hosts/panels/WordPanel.tsx`, `src/hosts/panels/index.ts`, `src/hosts/HostBody.tsx`, `src/desktop/chrome.ts`
- Modify: `src/desktop/Window.tsx` (title bar colours), `src/desktop/icons.tsx` (add `HostIcon`)
- Test: `src/hosts/panels/panels.test.ts`, `src/desktop/chrome.test.ts`

**Interfaces:**
- Consumes: `themes`, `themeStyle`, `contrastRatio` (Task 2); `WindowedIntegration` (Task 1); `PANEL_IDS`, `PanelId`
- Produces:
  - `panels: Record<PanelId, ComponentType>` from `src/hosts/panels/index.ts`
  - `HostBody({ integration }: { integration: WindowedIntegration })`, default export of `src/hosts/HostBody.tsx`
  - `src/desktop/chrome.ts`: `TITLE_ACTIVE` (CSS gradient string), `TITLE_INACTIVE = "#6b6b6b"`
  - `HostIcon({ color }: { color: string })` from `src/desktop/icons.tsx`

- [ ] **Step 1: Write the failing tests**

`src/desktop/chrome.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio } from "../hosts/themes";
import { TITLE_INACTIVE } from "./chrome";

describe("window chrome", () => {
  it("white title text on an unfocused title bar meets AA", () => {
    expect(contrastRatio("#ffffff", TITLE_INACTIVE)).toBeGreaterThanOrEqual(4.5);
  });
});
```

`src/hosts/panels/panels.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/desktop/chrome.test.ts src/hosts/panels/panels.test.ts`
Expected: FAIL: cannot resolve `./chrome` and `./index`.

- [ ] **Step 3: Add the chrome constants and use them in `Window`**

`src/desktop/chrome.ts`:

```ts
/** Title bar of the focused window. */
export const TITLE_ACTIVE = "linear-gradient(90deg, #000080, #1084d0)";
/** Unfocused title bars; dark enough for white text to pass AA. */
export const TITLE_INACTIVE = "#6b6b6b";
```

In `src/desktop/Window.tsx`, add `import { TITLE_ACTIVE, TITLE_INACTIVE } from "./chrome";` and change the title bar style to:

```tsx
          background: focused ? TITLE_ACTIVE : TITLE_INACTIVE,
```

- [ ] **Step 4: Write the shared mock pieces**

`src/hosts/panels/Pill.tsx`:

```tsx
import type { ReactNode } from "react";

export type PillTone = "positive" | "notice" | "info";

/** A status badge: coloured text and outline on the panel's own background. */
export default function Pill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return (
    <span
      className="rounded-full border border-current px-2 text-[10px] leading-4"
      style={{ color: `var(--host-${tone})` }}
    >
      {children}
    </span>
  );
}
```

`src/hosts/panels/MockButton.tsx`:

```tsx
import type { ReactNode } from "react";

type MockButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  block?: boolean;
};

/** Looks like the host's button; a span, so it never takes focus. */
export default function MockButton({ children, variant = "primary", block = false }: MockButtonProps) {
  const colours =
    variant === "primary"
      ? "bg-[var(--host-accent)] text-[var(--host-on-accent)]"
      : "bg-[var(--host-raised)] text-[var(--host-text)]";
  return (
    <span
      className={`inline-flex h-8 items-center justify-center rounded-[var(--host-radius)] px-3 text-xs font-semibold ${colours} ${block ? "w-full" : ""}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Write the four panels**

`src/hosts/panels/PhotoshopPanel.tsx`:

```tsx
import MockButton from "./MockButton";
import Pill, { type PillTone } from "./Pill";

const proofs: { name: string; status: string; tone: PillTone }[] = [
  { name: "Spring hero — v3", status: "Approved", tone: "positive" },
  { name: "Retail banner 728×90", status: "Changes requested · 4", tone: "notice" },
  { name: "Social square — v1", status: "In review", tone: "info" },
];

export default function PhotoshopPanel() {
  return (
    <div className="flex h-full flex-col bg-[var(--host-surface)] text-[var(--host-text)]">
      <div className="flex gap-4 border-b border-[var(--host-border)] px-3 pt-2 text-[11px]">
        <span className="border-b-2 border-[var(--host-text)] pb-2">Proofs</span>
        <span className="pb-2 text-[var(--host-muted)]">Comments</span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-3">
        {proofs.map((p) => (
          <li
            key={p.name}
            className="flex flex-col items-start gap-1.5 rounded-[var(--host-radius)] bg-[var(--host-raised)] p-2.5"
          >
            <span className="text-xs">{p.name}</span>
            <Pill tone={p.tone}>{p.status}</Pill>
          </li>
        ))}
      </ul>
      <div className="mt-auto p-3">
        <MockButton block>Create proof from document</MockButton>
      </div>
    </div>
  );
}
```

`src/hosts/panels/JiraPanel.tsx`:

```tsx
import MockButton from "./MockButton";

export default function JiraPanel() {
  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden bg-[var(--host-surface)] p-4 text-[var(--host-text)]">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-[var(--host-muted)]">DES-142</span>
        <span className="text-lg font-semibold leading-tight">Spring campaign hero banner</span>
      </div>
      <div className="flex items-center gap-3 rounded-[var(--host-radius)] border border-[var(--host-border)] p-3">
        <span className="grid h-[54px] w-[72px] shrink-0 place-items-center rounded-[var(--host-radius)] bg-[var(--host-raised)] text-[10px] text-[var(--host-muted)]">
          proof
        </span>
        <span className="flex min-w-0 flex-col gap-1 text-[11px]">
          <span className="text-xs font-semibold">PageProof · Spring hero v3</span>
          <span className="text-[var(--host-positive)]">Approved — 3 of 3 reviewers</span>
          <span className="text-[var(--host-muted)]">Approved file attached to this issue</span>
        </span>
      </div>
      <div className="flex gap-2">
        <MockButton>Open proof</MockButton>
        <MockButton variant="secondary">Link another</MockButton>
      </div>
    </div>
  );
}
```

`src/hosts/panels/CanvaPanel.tsx`:

```tsx
import MockButton from "./MockButton";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col gap-1 text-xs">
      <span>{label}</span>
      <span className="flex h-9 items-center rounded-[var(--host-radius)] border border-[var(--host-border)] px-2.5 text-[13px]">
        {value}
      </span>
    </span>
  );
}

export default function CanvaPanel() {
  return (
    <div className="flex h-full flex-col gap-3 bg-[var(--host-surface)] p-4 text-[var(--host-text)]">
      <span className="text-[15px] font-semibold">Send for review</span>
      <Field label="Reviewers" value="marketing@, legal@" />
      <Field label="Due" value="Fri 16 Oct" />
      <span className="text-[11px] text-[var(--host-muted)]">
        Reviewers get a link to comment on this design.
      </span>
      <div className="mt-auto">
        <MockButton block>Create proof</MockButton>
      </div>
    </div>
  );
}
```

`src/hosts/panels/WordPanel.tsx`:

```tsx
import MockButton from "./MockButton";

const bars = ["70%", "100%", "100%", "80%", "100%", "60%"];

function Comment({ who, text, active = false }: { who: string; text: string; active?: boolean }) {
  return (
    <span
      className="block border-l-[3px] pl-2 text-[11px] leading-snug"
      style={{ borderColor: active ? "var(--host-accent)" : "var(--host-border)" }}
    >
      <span className="block font-semibold">{who}</span>
      {text}
    </span>
  );
}

export default function WordPanel() {
  return (
    <div className="flex h-full bg-[var(--host-surface)] text-[var(--host-text)]">
      <div className="flex min-w-0 flex-1 bg-[var(--host-raised)] p-3">
        <div className="flex flex-1 flex-col gap-2 bg-[var(--host-surface)] p-4">
          {bars.map((width, i) => (
            <span
              key={i}
              className="block"
              style={{
                width,
                height: i === 0 ? 10 : 6,
                background: i === 0 ? "var(--host-text)" : "var(--host-border)",
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex w-44 shrink-0 flex-col gap-2.5 border-l border-[var(--host-border)] p-3">
        <span className="text-[13px] font-semibold">PageProof</span>
        <Comment who="Legal" text="Add the trademark mark here." active />
        <Comment who="Marketing" text="Shorter headline?" />
        <div className="mt-auto">
          <MockButton block>Upload new version</MockButton>
        </div>
      </div>
    </div>
  );
}
```

`src/hosts/panels/index.ts`:

```ts
import type { ComponentType } from "react";
import type { PanelId } from "../ids";
import CanvaPanel from "./CanvaPanel";
import JiraPanel from "./JiraPanel";
import PhotoshopPanel from "./PhotoshopPanel";
import WordPanel from "./WordPanel";

export const panels: Record<PanelId, ComponentType> = {
  photoshop: PhotoshopPanel,
  jira: JiraPanel,
  canva: CanvaPanel,
  word: WordPanel,
};
```

- [ ] **Step 6: Run the tests**

Run: `npm test -- src/desktop/chrome.test.ts src/hosts/panels/panels.test.ts`
Expected: PASS. Two possible failures and their fixes:
- `react-dom/server` won't resolve under the Workers pool: import `renderToStaticMarkup` from `"react-dom/server.edge"` instead.
- JSX isn't transformed in the test: add `esbuild: { jsx: "automatic" }` at the top level of the object passed to `defineWorkersConfig` in `vitest.config.ts`.

- [ ] **Step 7: Write `HostBody`**

`src/hosts/HostBody.tsx`:

```tsx
import type { WindowedIntegration } from "../lib/data";
import { panels } from "./panels";
import { themes, themeStyle } from "./themes";

const linkClass = "shrink-0 text-[#000080] underline hover:text-[#1084d0]";

/** A host window's inside: the themed mock panel, then an X11 status bar with the real links. */
export default function HostBody({ integration }: { integration: WindowedIntegration }) {
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
          <a href={`/services/${integration.service}/`} className={linkClass}>
            Service page →
          </a>
        )}
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Add `HostIcon`**

Append to `src/desktop/icons.tsx`:

```tsx
/** A generic app window, its title band in the host's colour. */
export function HostIcon({ color }: { color: string }) {
  return (
    <Pixels>
      {rects([
        [3, 4, 26, 22, "#1f1f1f"],
        [4, 5, 24, 20, "#c0c0c0"],
        [4, 5, 24, 5, color],
        [7, 13, 18, 2, "#808080"],
        [7, 17, 12, 2, "#808080"],
      ])}
    </Pixels>
  );
}
```

- [ ] **Step 9: Lint and commit**

Run: `npm run lint && npm test`
Expected: lint clean; all tests pass. (`npm run typecheck` still reports the `Desktop.tsx` import from Task 4; Task 7 fixes it.)

```bash
git add src/hosts src/desktop/chrome.ts src/desktop/chrome.test.ts src/desktop/Window.tsx src/desktop/icons.tsx vitest.config.ts
git commit -m "feat(hosts): themed host panels and AA-safe title bars

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Floating desktop with README and host windows

**Files:**
- Create: `src/desktop/FloatingDesktop.tsx`, `src/desktop/ReadmeBody.tsx`, `src/desktop/links.tsx`
- Modify: `src/desktop/Desktop.tsx` (becomes a thin switch)

**Interfaces:**
- Consumes: `deskReducer`, `isVisible` (Task 3); `initialDesk` (Task 4); `useDesktopArea` (Task 4); `HostBody`, `HostIcon` (Task 6); `integrations`, `isWindowed` (Task 1); `App` (Task 5); existing `Window`, `Panel`, `DesktopIcons`, `HireForm`, `Terminal`, `zIndex`
- Produces:
  - `FloatingDesktop({ desktop }: { desktop: Rect })`
  - `ReadmeBody({ onHire }: { onHire: () => void })`
  - `profileItems(): MenuItem[]` (CV.pdf, GitHub, LinkedIn, Email)

- [ ] **Step 1: Write `links.tsx`**

```tsx
import { siteMetadata } from "../lib/site-metadata";
import { CardIcon, DocumentIcon, FolderIcon, MailIcon } from "./icons";
import type { MenuItem } from "./Panel";

/** CV and profiles, shared by every desktop layout's Applications menu. */
export function profileItems(): MenuItem[] {
  return [
    { label: "CV.pdf", icon: <DocumentIcon />, href: siteMetadata.cvUrl },
    { label: "GitHub", icon: <FolderIcon />, href: siteMetadata.profiles.github },
    { label: "LinkedIn", icon: <CardIcon />, href: siteMetadata.profiles.linkedin },
    { label: "Email", icon: <MailIcon />, href: `mailto:${siteMetadata.contactEmail}` },
  ];
}
```

- [ ] **Step 2: Write `ReadmeBody.tsx`**

The copy is a draft; Pedro edits it before merge.

```tsx
import { integrations } from "../lib/data";
import { siteMetadata } from "../lib/site-metadata";

const hosts = integrations.map((i) => i.host).join(" · ");
const hasServices = integrations.some((i) => i.service);
const linkButton = "x11-button inline-flex h-7 items-center px-3.5 font-normal no-underline";

export default function ReadmeBody({ onHire }: { onHire: () => void }) {
  return (
    <div className="flex h-full flex-col gap-2.5 overflow-y-auto bg-white px-4 py-3 font-ui text-black">
      <p className="m-0 text-lg font-bold">{siteMetadata.author} — integrations engineer</p>
      <p className="m-0 text-[13px] leading-normal">
        My code runs inside other people’s apps. Each window on this desktop is one of them,
        running a PageProof integration I built and shipped.
      </p>
      <p className="m-0 text-xs leading-normal text-[#404040]">{hosts}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={onHire} className="x11-button h-7 px-3.5">
          Hire me
        </button>
        {hasServices && (
          <a href="/services/" className={linkButton}>
            Services
          </a>
        )}
        <a href={siteMetadata.cvUrl} target="_blank" rel="noopener noreferrer" className={linkButton}>
          CV.pdf
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `FloatingDesktop.tsx`**

```tsx
import { useEffect, useReducer } from "react";
import HostBody from "../hosts/HostBody";
import { integrations, isWindowed } from "../lib/data";
import { siteMetadata } from "../lib/site-metadata";
import Terminal from "../terminal/Terminal";
import DesktopIcons from "./DesktopIcons";
import type { Rect } from "./geometry";
import HireForm from "./HireForm";
import { BriefcaseIcon, DocumentIcon, HostIcon, TerminalIcon } from "./icons";
import { WINDOW_IDS, type WindowId } from "./ids";
import { initialDesk } from "./layout";
import { profileItems } from "./links";
import Panel, { type MenuItem, type Task } from "./Panel";
import ReadmeBody from "./ReadmeBody";
import { zIndex } from "./stacking";
import Window from "./Window";
import { deskReducer, isVisible } from "./windows";

const windowed = integrations.filter(isWindowed);
const listed = integrations.filter((i) => !isWindowed(i));
const byId = new Map(windowed.map((i) => [i.id, i]));

type Frame = { domId: string; title: string; glyph: string; task: string };

const FRAMES = {
  readme: { domId: "readme-window", title: "README.txt", glyph: "i", task: "README" },
  term: { domId: "terminal-window", title: "xterm — guest@primor.me: ~", glyph: ">_", task: "xterm" },
  hire: { domId: "hire-window", title: "hire — tell me about your project", glyph: "@", task: "hire" },
  ...Object.fromEntries(
    windowed.map((i) => [
      i.id,
      { domId: `${i.id}-window`, title: i.window.title, glyph: "□", task: i.window.title.split(" — ")[0] },
    ]),
  ),
} as Record<WindowId, Frame>;

export default function FloatingDesktop({ desktop }: { desktop: Rect }) {
  const [desk, dispatch] = useReducer(deskReducer, desktop, initialDesk);

  useEffect(() => {
    dispatch({ type: "fit", desktop });
  }, [desktop]);

  const show = (id: WindowId) => dispatch({ type: "show", id });

  const hireItem: MenuItem = { label: "Hire me", icon: <BriefcaseIcon />, onSelect: () => show("hire") };
  const terminalItem: MenuItem = { label: "Terminal", icon: <TerminalIcon />, onSelect: () => show("term") };
  const listedItems: MenuItem[] = listed.map((i) => ({
    label: i.host,
    icon: <HostIcon color={i.icon} />,
    href: i.listing.url,
  }));

  const menu: MenuItem[] = [
    hireItem,
    { label: "README", icon: <DocumentIcon />, onSelect: () => show("readme") },
    ...windowed.map((i) => ({ label: i.host, icon: <HostIcon color={i.icon} />, onSelect: () => show(i.id) })),
    ...listedItems,
    terminalItem,
    ...profileItems(),
  ];
  const icons: MenuItem[] = [hireItem, terminalItem, ...listedItems];

  const tasks: Task[] = WINDOW_IDS.filter((id) => desk.windows[id].mode !== "closed").map((id) => ({
    label: FRAMES[id].task,
    pressed: isVisible(desk.windows[id]),
    onClick: () => dispatch({ type: "toggle", id }),
  }));

  function body(id: WindowId, session: number) {
    switch (id) {
      case "readme":
        return <ReadmeBody onHire={() => show("hire")} />;
      case "term":
        return (
          <Terminal
            key={session}
            active={desk.focused === "term" && isVisible(desk.windows.term)}
            onExit={() => dispatch({ type: "close", id: "term" })}
            onOpen={show}
          />
        );
      case "hire":
        return <HireForm key={session} />;
      default:
        return <HostBody integration={byId.get(id)!} />;
    }
  }

  return (
    <div
      className="wallpaper fixed inset-0 overflow-hidden"
      onPointerDown={(e) => e.target === e.currentTarget && dispatch({ type: "blur" })}
    >
      <h1 className="sr-only">
        {siteMetadata.author} — {siteMetadata.jobTitle}
      </h1>
      <Panel menu={menu} tasks={tasks} />
      <main>
        <DesktopIcons items={icons} />
        {WINDOW_IDS.map((id) => {
          const w = desk.windows[id];
          if (w.mode === "closed") return null;
          const frame = FRAMES[id];
          return (
            <Window
              key={id}
              id={frame.domId}
              title={frame.title}
              glyph={frame.glyph}
              zIndex={zIndex(desk.stack, id)}
              rect={w.rect}
              desktop={desktop}
              maximized={w.mode === "maximized"}
              compact={false}
              hidden={!isVisible(w)}
              focused={desk.focused === id && isVisible(w)}
              onRectChange={(rect) => dispatch({ type: "move", id, rect })}
              onFocus={() => dispatch({ type: "focus", id })}
              onMinimize={() => dispatch({ type: "minimize", id })}
              onToggleMaximize={() => dispatch({ type: "toggleMaximize", id })}
              onClose={() => dispatch({ type: "close", id })}
            >
              {body(id, w.session)}
            </Window>
          );
        })}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Make `Desktop.tsx` a switch (floating everywhere for now)**

Replace `src/desktop/Desktop.tsx` with:

```tsx
import FloatingDesktop from "./FloatingDesktop";
import { useDesktopArea } from "./useDesktopArea";

export default function Desktop() {
  const { desktop } = useDesktopArea();
  return <FloatingDesktop desktop={desktop} />;
}
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all clean and passing.

Run: `npm run dev` and open http://localhost:5173 at 1440×900. Check:
- README focused (blue title bar) on top; Photoshop, Jira, Canva, Word tiled around it with grey title bars; no window covers the icon column.
- Taskbar: README, Photoshop, Jira, Canva, Word, xterm. Clicking xterm opens the terminal; `open jira` focuses Jira; `ls integrations` lists all nine; `hire` opens the form.
- Closing a host window removes its taskbar button; Applications menu reopens it.
- Each status-bar link opens the right listing in a new tab.
At 1024×768: only README open; the four hosts wait in the taskbar and open cascaded.

- [ ] **Step 6: Commit**

```bash
git add src/desktop
git commit -m "feat(desktop): README and host windows on the desktop

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Phone layout

**Files:**
- Create: `src/desktop/Card.tsx`, `src/desktop/CompactDesktop.tsx`
- Modify: `src/desktop/Desktop.tsx`

**Interfaces:**
- Consumes: `HostBody` (Task 6), `ReadmeBody`, `profileItems` (Task 7), `TITLE_ACTIVE`, `TITLE_INACTIVE` (Task 6), `PANEL_HEIGHT`, `useDesktopArea` (Task 4), `App` (Task 5)
- Produces: `CompactDesktop({ desktop }: { desktop: Rect })`; `Card({ id, title, glyph?, active?, className?, children })`

- [ ] **Step 1: Write `Card.tsx`**

```tsx
import type { ReactNode } from "react";
import { TITLE_ACTIVE, TITLE_INACTIVE } from "./chrome";

type CardProps = {
  id: string;
  title: string;
  glyph?: string;
  active?: boolean;
  className?: string;
  children: ReactNode;
};

/** A window frame that sits in the page flow: no dragging, resizing or title buttons. */
export default function Card({ id, title, glyph, active = false, className = "", children }: CardProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="bevel-out scroll-mt-4 bg-x11-face p-[3px]">
      <div
        className="flex h-[22px] items-center gap-1 px-1.5 font-ui text-xs font-bold text-white"
        style={{ background: active ? TITLE_ACTIVE : TITLE_INACTIVE }}
      >
        {glyph && (
          <span aria-hidden="true" className="font-mono text-[11px]">
            {glyph}
          </span>
        )}
        <h2 id={`${id}-title`} className="m-0 truncate text-xs">
          {title}
        </h2>
      </div>
      <div className={`bevel-in mt-[3px] p-[2px] ${className}`}>{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: Write `CompactDesktop.tsx`**

```tsx
import { useState } from "react";
import HostBody from "../hosts/HostBody";
import { integrations, isWindowed } from "../lib/data";
import { siteMetadata } from "../lib/site-metadata";
import Terminal from "../terminal/Terminal";
import type { App } from "../terminal/types";
import Card from "./Card";
import type { Rect } from "./geometry";
import HireForm from "./HireForm";
import { BriefcaseIcon, TerminalIcon } from "./icons";
import { profileItems } from "./links";
import Panel, { type MenuItem } from "./Panel";
import ReadmeBody from "./ReadmeBody";
import { PANEL_HEIGHT } from "./useDesktopArea";
import Window from "./Window";

const windowed = integrations.filter(isWindowed);
const listed = integrations.filter((i) => !isWindowed(i));

function reveal(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Phones: the same windows as a scrolling column of cards. */
export default function CompactDesktop({ desktop }: { desktop: Rect }) {
  const [hire, setHire] = useState({ open: false, session: 0 });
  const openHire = () => setHire((h) => ({ ...h, open: true }));
  const closeHire = () => setHire((h) => ({ open: false, session: h.session + 1 }));
  const onOpen = (app: App) => (app === "hire" ? openHire() : reveal(`${app}-card`));

  const menu: MenuItem[] = [
    { label: "Hire me", icon: <BriefcaseIcon />, onSelect: openHire },
    { label: "Terminal", icon: <TerminalIcon />, onSelect: () => reveal("term-card") },
    ...profileItems(),
  ];

  return (
    <div className="wallpaper fixed inset-0">
      <h1 className="sr-only">
        {siteMetadata.author} — {siteMetadata.jobTitle}
      </h1>
      <Panel menu={menu} tasks={[]} />
      <main className="absolute inset-x-0 bottom-0 overflow-y-auto" style={{ top: PANEL_HEIGHT }}>
        <div className="flex flex-col gap-4 p-4">
          <Card id="readme-card" title="README.txt" glyph="i" active>
            <ReadmeBody onHire={openHire} />
          </Card>
          {windowed.map((i) => (
            <Card key={i.id} id={`${i.id}-card`} title={i.window.title} className="h-80">
              <HostBody integration={i} />
            </Card>
          ))}
          <Card id="more-card" title="More windows">
            <ul className="m-0 list-none bg-white p-1">
              {listed.map((i) => (
                <li key={i.id}>
                  <a
                    href={i.listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-between gap-2 border-b border-[#e0e0e0] px-2.5 font-ui text-[13px] text-black no-underline"
                  >
                    <span>{i.host}</span>
                    <span className="text-[11px] text-[#404040]">{i.stack}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>
          <Card id="term-card" title="xterm" glyph=">_" className="h-[70dvh]">
            <Terminal compact active={false} onOpen={onOpen} />
          </Card>
        </div>
      </main>
      {hire.open && (
        <Window
          id="hire-window"
          title="hire — tell me about your project"
          glyph="@"
          zIndex={50}
          rect={desktop}
          desktop={desktop}
          maximized={false}
          compact
          hidden={false}
          focused
          onRectChange={() => {}}
          onFocus={() => {}}
          onMinimize={closeHire}
          onToggleMaximize={() => {}}
          onClose={closeHire}
        >
          <HireForm key={hire.session} />
        </Window>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Switch on width in `Desktop.tsx`**

```tsx
import CompactDesktop from "./CompactDesktop";
import FloatingDesktop from "./FloatingDesktop";
import { useDesktopArea } from "./useDesktopArea";

export default function Desktop() {
  const { desktop, compact } = useDesktopArea();
  return compact ? <CompactDesktop desktop={desktop} /> : <FloatingDesktop desktop={desktop} />;
}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all clean and passing.

With `npm run dev`, at 390×844 (device toolbar): README card first, then Photoshop, Jira, Canva, Word cards (themed, 320px tall), "More windows" with five rows ≥ 44px tall, then the xterm with quick commands. `hire` (quick command or README button) opens the full-screen form; its close button returns to the column. `open canva` in the terminal scrolls to the Canva card.

- [ ] **Step 5: Commit**

```bash
git add src/desktop
git commit -m "feat(desktop): phone layout as a column of window cards

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Verification

**Files:** none expected; fix anything the checks turn up in the file that owns it.

- [ ] **Step 1: Full checks**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass; `dist/index.html` built.

- [ ] **Step 2: Keyboard pass at 1440×900**

From page load, press Tab repeatedly. Expected order: Applications, taskbar buttons, desktop icons, then each window's title buttons and real links (README buttons, status-bar links). Focus never lands inside a mock panel. Every focused element shows a visible outline.

- [ ] **Step 3: Resize pass**

Load at 1440×900, then narrow the window to 900 px and back. Expected: every window's title bar stays reachable (Review Focus 1). Load at 1280×720: no window overlaps the icon column or runs off the bottom (Review Focus 2).

- [ ] **Step 4: Lighthouse**

Run: `npm run lighthouse`
Expected: assertions in `lighthouserc.json` pass. Then run Chrome DevTools Lighthouse on `npm run preview` at desktop size and confirm Accessibility is 100; if not, fix the reported element and re-run.

- [ ] **Step 5: Hand over for copy review**

Tell Pedro the README text in `src/desktop/ReadmeBody.tsx` and the window captions in `content/integrations.yaml` are drafts for him to put in his own voice before merge. Don't push or open a PR until he says so (superpowers:finishing-a-development-branch).
