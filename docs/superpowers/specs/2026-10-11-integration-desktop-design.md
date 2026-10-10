# Integration desktop — design

Date: 2026-10-11
Branch: `feat/integration-desktop`, off `main`
Sketch: https://claude.ai/artifact/NUGTD2S3QQws7atGjDtqMv (private canvas: proposal,
live today, phone)

## Goal

The homepage should say "integrations engineer" without anyone typing a command.
Today it is an X11 desktop with one xterm in the middle. That reads as a Linux/CLI
developer, and hides the actual work: UI that runs inside other companies' apps.

Keep the X11 desktop, but make its windows the host apps Pedro builds for. Each
window has the same gray X11 frame, and inside it the host's own look, showing the
PageProof integration he shipped there. The frame is his; the inside is theirs.
The xterm stays as one window among several.

### Success criteria

- On a desktop browser with JavaScript on, the first screen shows, without
  interaction: a README window introducing Pedro, and four host windows
  (Photoshop, Jira, Canva, Word), each themed like its host.
- Every host window links to its marketplace listing and, once the service pages
  are live, to its service page.
- On phones the same content appears as a vertical stack of window cards.
- No new runtime dependencies. Lighthouse thresholds in `lighthouserc.json` still
  pass; accessibility stays at 1.0 (checked manually, as today).
- Every host theme's text/background pairs meet WCAG AA, enforced by a unit test.
- The terminal keeps working, including `hire`, and gains `open <window>`.

### Decisions

| Decision | Choice | Why |
|---|---|---|
| First focused window | README, not the xterm | Visitors who aren't developers should read first; the terminal is a bonus |
| Host windows on open | Photoshop, Jira, Canva, Word | The four services with their own pages |
| Other integrations | Desktop icons + README list; icons open the listing | InDesign, QuarkXPress, Final Cut Pro, Canto, Bynder |
| Window inside | Themed HTML, not screenshots | Crisp at any size, themeable, no remote images; screenshots can come later |
| Host themes | A few values copied by hand per host, sources cited | No design-system packages; licences differ (see Themes) |
| Mock UI semantics | Decorative (`aria-hidden`) with a text caption | No fake buttons in the tab order |
| Window frame | Unchanged X11 `Window` component | One consistent system around varied interiors |

### Out of scope

- Windows for InDesign, QuarkXPress, Final Cut Pro, Canto, Bynder.
- Working mini-demos inside host windows (proof creation etc.).
- Real host logos or recreated proprietary UI. Interiors suggest each host through
  colour, type, radius and layout only.
- Final README copy. The implementation drafts it; Pedro edits it in his voice.
- Pre-rendering the homepage. The service pages carry SEO.

## What the visitor sees

### Wide screens (≥ 1280 px desktop width)

```
┌ Applications │ README │ Photoshop │ Jira │ Canva │ Word │ xterm ──── 08:20 ┐
│ [icons]  ┌ README.txt ─────────┐ ┌ Photoshop ─┐ ┌ Jira — DES-142 ──────┐ │
│ Hire me  │ Pedro Primor —      │ │ dark UXP   │ │ issue + PageProof    │ │
│ ps.uxp   │ integrations eng.   │ │ panel      │ │ panel, Approved      │ │
│ id.uxp   │ [Hire][Services][CV]│ │            │ └──────────────────────┘ │
│ canva    └─────────────────────┘ │            │ ┌ Word — add-in ───────┐ │
│ office   ┌ Canva ──────┐         └────────────┘ │ doc │ taskpane       │ │
│ jira     │ send for    │   ┌ xterm (minimised  │     │                │ │
│ quark    │ review      │   │  to the panel)    └──────────────────────┘ │
│ fcp      └─────────────┘                                                │
```

- README is focused. The four host windows open behind it, tiled so none is
  hidden by another more than partly (positions in Layout below).
- The xterm starts **minimised**: its taskbar button is there, one click away.
- Each host window has an X11 status bar under its body:
  `<stack> · <listing link ↗>` and, when available, `Service page →`.

### Medium screens (640–1279 px)

README open and focused; host windows start minimised in the taskbar, cascaded
when opened. Tiling five windows at this width overlaps too much to read.

### Phones (< 640 px, the existing `compact` breakpoint)

No floating windows. A single scrolling column of window cards, each with an X11
title bar and no drag/resize: README, the four host cards, a "More windows" list
(the other integrations, linking to listings), then the xterm card with the
existing quick-command buttons. The panel keeps the Applications menu.

## README window

Plain white text area in an X11 frame, title `README.txt`. Draft copy:

> **Pedro Primor — integrations engineer**
> My code runs inside other people's apps. Each window on this desktop is one of
> them, running a PageProof integration I built and shipped.
> Photoshop · InDesign · Canva · Office · Jira · QuarkXPress · Final Cut Pro ·
> Canto · Bynder

Buttons (real links/buttons): **Hire me** (opens the hire window), **Services**
(`/services/`, plain `<a href>`), **CV.pdf**.

## Host windows

Each host window is the existing `Window` with:

- title `<Host> — <panel name>` (e.g. `Jira — DES-142`), unfocused grey title bar
  until clicked, as now;
- a body rendered by that host's panel component, inside the host theme;
- the X11 status bar.

The body is a `<figure>`: the mock panel is `aria-hidden="true"` and the
`<figcaption>` (visually hidden) says what it shows, e.g. "PageProof's Jira issue
panel: a linked proof marked approved by three reviewers, with the approved file
attached to the issue." Mock buttons are `<span>`s styled as buttons, so nothing
fake is focusable. The status-bar links are the only interactive content.

| Window | Panel content (sample data, generic names) | Status bar |
|---|---|---|
| Photoshop | Proofs / Comments tabs; three proof cards with Approved, Changes requested, In review pills; "Create proof from document" | UXP · React · TypeScript · Adobe Exchange ↗ |
| Jira | Issue key and title; PageProof panel: proof thumbnail placeholder, "Approved — 3 of 3 reviewers", "Approved file attached"; Open proof | Atlassian Forge · Azure Functions · TypeScript · Jira listing ↗ |
| Canva | "Send for review": reviewers and due-date fields, Create proof | Canva Apps SDK · React · Canva listing ↗ |
| Word | Document page placeholder; taskpane with two reviewer comments and "Upload new version" | Office.js · React · TypeScript · Microsoft Marketplace ↗ |

Listing URLs come from `content/experience.yaml`'s `plugins` entries, not
duplicated.

## Themes

`src/hosts/themes.ts` exports one theme per host:

```ts
type HostTheme = {
  surface: string;      // panel background
  raised: string;       // cards / inputs
  text: string;
  muted: string;
  accent: string;       // primary button
  onAccent: string;     // text on primary button
  border: string;
  radius: number;       // px
  font: string;         // CSS font stack, system fonts only
};
```

The host body sets these as CSS custom properties (`--host-surface`, …) on its
root; panel components use only those variables, so a panel never hard-codes a
colour.

Values are hand-copied from each host's public design system, with the source URL
in a comment:

| Host | Source | Licence note |
|---|---|---|
| Photoshop | Adobe Spectrum, dark theme | Spectrum CSS is Apache-2.0 |
| Jira | Atlassian Design System tokens | Copy colours and radius only |
| Canva | Canva App UI Kit | Believed licensed for Canva apps only — **confirm before merge**; if unclear, use a neutral light theme with a purple accent of our own choosing |
| Word | Microsoft Fluent 2 | Fluent UI is MIT |

No fonts are loaded: each theme uses a system stack (Segoe/system-ui etc.).

## Code structure

| Unit | Responsibility |
|---|---|
| `content/integrations.yaml` + schema in `src/lib/content/schemas.ts` | Per window: `id`, `host`, `title`, `stack`, `plugin` (name of the `experience.yaml` plugin, for its URL), optional `service` slug, `caption`, `onDesktop` (opens on load) |
| `src/hosts/themes.ts` | `HostTheme` values; `contrastRatio()` helper |
| `src/hosts/panels/*.tsx` | One static panel per host (`PhotoshopPanel`, `JiraPanel`, `CanvaPanel`, `WordPanel`) |
| `src/hosts/HostBody.tsx` | Applies theme variables, wraps the panel in `figure`/`figcaption`, renders the status bar |
| `src/desktop/ReadmeBody.tsx` | README content |
| `src/desktop/windows.ts` | Pure window-manager state: open, close, minimise, maximise, focus, stacking (absorbs `stacking.ts`) |
| `src/desktop/layout.ts` | Pure `initialLayout(desktop, ids)`: rect and starting mode per window for each width band |
| `src/desktop/Desktop.tsx` | Renders windows from the registry instead of hard-coded `term`/`hire` |
| `src/desktop/CompactDesktop.tsx` | The phone column |
| `src/terminal/commands.ts` | `open <id>` and `ls integrations`; `hire` keeps working |

### Targeted refactor

`Desktop.tsx` hard-codes two windows (`"term" | "hire"`), each with its own
`useWindowState` call and duplicated JSX. Seven windows need a registry:
`windows.ts` holds the state for all of them in one reducer (tested without React),
and `Desktop` maps over the registry. `useWindowState`'s session-key behaviour
(fresh terminal after close) moves into the reducer. `geometry.ts` stays as is.

### Terminal

`onOpen` becomes `onOpen(id: WindowId)`. New commands:

- `ls integrations` — lists the integration ids, as in the sketch.
- `open <id>` — opens and focuses that window; unknown id prints
  `open: <id>: no such window`.

## Layout (wide band)

Positions are fractions of the desktop area so they scale between 1280 and
2560 px; `layout.ts` clamps each rect with the existing `clampRect`.

| Window | x | y | w | h |
|---|---|---|---|---|
| README | 0.10 | 0.03 | 0.31 | 0.31 |
| Photoshop | 0.44 | 0.03 | 0.22 | 0.56 |
| Jira | 0.69 | 0.07 | 0.30 | 0.42 |
| Canva | 0.10 | 0.37 | 0.23 | 0.50 |
| Word | 0.69 | 0.53 | 0.30 | 0.40 |

Desktop icons keep their current column on the left (`x` < 0.09).

## Testing

TDD for every pure unit:

- `windows.test.ts`: open/close/minimise/maximise/focus; close bumps the session
  key; focus raises; minimising the focused window clears focus.
- `layout.test.ts`: each band gives the expected open/minimised set; wide-band
  rects stay inside the desktop at 1280×720 and 2560×1440; README is focused.
- `themes.test.ts`: for every theme, `text`, `muted` on `surface` and `raised`,
  and `onAccent` on `accent` are ≥ 4.5:1.
- `parse.test.ts`: `integrations.yaml` parses; every `plugin` names an existing
  `experience.yaml` plugin; ids are unique.
- `shell.test.ts`: `open jira` calls `onOpen("jira")`; unknown id error text;
  `ls integrations` output.

Then a manual browser pass at 1440×900, 1024×768 and 390×844 (keyboard-only too),
and Lighthouse via `npm run lighthouse`.

## Dependencies on other work

- `/services/` links depend on `feat/service-pages` merging. Until it does, the
  `service` fields in `integrations.yaml` stay unset: a status bar shows
  `Service page →` only when its entry has `service`, and the README's Services
  button shows only when at least one entry has it. Setting the fields is part
  of whichever branch merges second.
- Rebase on `main` before starting; `feat/hire-mobile-og` (hire window, quick
  commands, OG image) is already merged.
