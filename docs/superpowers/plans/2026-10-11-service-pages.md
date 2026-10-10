# Service Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five crawlable, pre-rendered service pages (`/services/` plus four service pages) to primor.me, each with a working contact form, linked from the X11 desktop homepage.

**Architecture:** Page text lives in `content/services.yaml`, validated by zod and joined to the shipped plugins in `experience.yaml`. React page components are rendered to complete HTML documents by `src/services/render.tsx`. In production, an SSR build of that module is run by `scripts/prerender-services.mjs` after the normal client build, which writes `dist/services/**/index.html`. In dev, a Vite plugin serves the same output through `ssrLoadModule`. Only the contact form hydrates, via a small `src/services/island.tsx` entry. Head tags (title, meta, OG, JSON-LD) come from one shared builder used by both the homepage and the service pages.

**Tech Stack:** Vite 6, React 19 (`react-dom/server`, `hydrateRoot`), TypeScript 5.8, Tailwind 3, zod 4, yaml, Vitest 3 on `@cloudflare/vitest-pool-workers`, Cloudflare Pages (+ Functions), Lighthouse CI.

**Spec:** `docs/superpowers/specs/2026-10-11-service-pages-design.md`

## Global Constraints

- No new npm dependencies.
- Tests are `*.test.ts` files only (vitest `include` is `**/*.{test,spec}.ts`). They run in the Workers runtime, so there is **no DOM**. Test React components with `renderToString` from `react-dom/server` and `createElement` (no JSX in `.ts` files). Put DOM-free logic in plain functions and test those.
- Service URLs: `/services/`, `/services/adobe-uxp-plugins/`, `/services/canva-apps/`, `/services/atlassian-forge-apps/`, `/services/office-add-ins/`. Always with a trailing slash.
- `metaDescription` is 50–160 characters; `metaTitle` is at most 60. Slugs are lowercase kebab-case and unique.
- Every `shipped` entry must match a `plugins[].name` in `experience.yaml`, or the build fails with a message naming the service and the plugin.
- The honeypot field is named `company`. The contact handler rejects any submission where it is non-empty. **No real form field may be named `company`.**
- The contact endpoint's `service` field is optional and is ignored when it is longer than 64 characters.
- The homepage's existing head tags must not change, apart from the updated description (Task 8) and the `Person` `@id` (Task 2).
- Same-site links (`/…`) and `mailto:` links open in the same tab; only off-site `http(s)://` links get `target="_blank"`.
- Colours come from the existing `term.*` Tailwind tokens (dark only, as on the rest of the site). Single column, `max-w-2xl`, 16px side gutter (`px-4`), no horizontal scroll at 320px.
- Lighthouse on the service pages: SEO ≥ 0.95 and performance ≥ 0.9, both as CI errors.
- Commit messages are conventional (`feat(services): …`) and end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never add a "Generated with Claude Code" line.

## Review Focus

1. **Hydration mismatch.** The props the island hydrates with must equal the props used for the server render, or React re-renders the form on top of itself. Task 6 parses the embedded props JSON back out of the HTML and compares it to the expected props.
2. **Content that contains `<`, `</script>` or `&`.** FAQ answers or pitches with these characters must not break out of the JSON-LD or props `<script>` tags. Task 2 tests `safeJson` against `</script><!--`.
3. **A `service` value with newlines or control characters.** It must not reach the email subject as-is. Task 4 tests that whitespace is collapsed to single spaces.
4. **Failure responses from the endpoint.** A 400 with a JSON error, a 502 with a plain-text body, or a network failure must all show a useful message, keep what the visitor typed, and let them retry. Task 5 tests all three in `submitInquiry`. The component resets Turnstile on error.
5. **A renamed plugin in `experience.yaml`.** It must fail the build loudly, not silently drop the proof link. Task 1 tests the error message.

---

## File map

| File | Responsibility |
|---|---|
| `content/services.yaml` (new) | Draft page text for the overview and four services |
| `src/lib/content/schemas.ts` | + `servicesFileSchema` |
| `src/lib/content/parse.ts` | + `parseServicesYaml(raw, plugins)` that resolves `shipped` |
| `src/lib/content/index.ts`, `src/lib/data.ts` | + export `services` |
| `src/lib/head-tags.ts` (new) | `buildHeadTags`, `renderHeadTags`, `safeJson`, `analyticsTag`, `personNode`, `homePageMeta` |
| `src/lib/service-paths.ts` (new) | `SERVICES_PATH`, `servicePath`, `sitePaths` |
| `src/lib/sitemap.ts` (new) | `buildSitemap` |
| `src/lib/link-target.ts` (new) | `linkTargetProps(href)` |
| `src/lib/service-pages-plugin.ts` (new) | Vite plugin: dev middleware + emits `sitemap.xml` |
| `src/services/meta.ts` (new) | `servicePageMeta`, `overviewPageMeta` (JSON-LD graphs) |
| `src/services/inquiry.ts` (new) | `submitInquiry` and the error copy (pure) |
| `src/services/turnstile.ts` (new) | Lazy Turnstile script loader (DOM) |
| `src/services/ContactForm.tsx` (new) | Form component; `FORM_ROOT_ID`, `FORM_PROPS_ID` |
| `src/services/ContactSection.tsx` (new) | Heading + form root + embedded props JSON |
| `src/services/ui.tsx` (new) | `H1`, `H2`, `linkClass` |
| `src/services/PageShell.tsx` (new) | Breadcrumb header and footer |
| `src/services/ServicePage.tsx`, `ServicesOverview.tsx` (new) | Page bodies |
| `src/services/document.ts` (new) | `renderDocument` → full HTML string |
| `src/services/render.tsx` (new) | `renderServicePages(options)` → `{ path, html }[]` |
| `src/services/island.tsx` (new) | Client entry that hydrates the form |
| `scripts/prerender-services.mjs` (new) | Runs the SSR bundle and writes `dist/services/**` |
| `functions/lib/contact/{helpers,handler}.ts`, `email.tsx`, `render-email.tsx` | Optional `service` field |
| `vite.config.ts`, `package.json`, `eslint.config.js`, `vitest.config.ts`, `lighthouserc.json` | Wiring |
| `src/desktop/{Desktop,DesktopIcons,Panel,icons}.tsx`, `src/terminal/{commands,types}.ts`, `Terminal.tsx`, `index.html`, `src/lib/site-metadata.ts` | Homepage links |
| `public/sitemap.xml` | Deleted; generated at build |

---

### Task 1: Services content and schema

**Files:**
- Create: `content/services.yaml`
- Modify: `src/lib/content/schemas.ts`, `src/lib/content/parse.ts`, `src/lib/content/index.ts`, `src/lib/data.ts`
- Test: `src/lib/content/parse.test.ts`

**Interfaces:**
- Produces:
  - `parseServicesYaml(raw: string, plugins: readonly ExperiencePluginYaml[]): ServicesContent`
  - `type ServicesContent = { overview: { title; metaTitle; metaDescription; pitch; also: { name; description }[] }; process: string[]; services: Service[] }`
  - `type Service = { slug; name; title; metaTitle; metaDescription; summary; pitch; shipped: ExperiencePluginYaml[]; handles: string[]; faq: { q: string; a: string }[] }`
  - `services` (parsed production content) exported from `src/lib/content` and `src/lib/data`.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/content/parse.test.ts` (add `parseServicesYaml` to the existing `./parse` import, and add `import { stringify } from "yaml";` at the top):

```ts
const plugins = [
  { name: "PageProof for Canva", url: "https://example.com/canva", description: "Canva app" },
  { name: "PageProof for Jira", url: "https://example.com/jira" },
];

function validServicesFile() {
  return {
    overview: {
      title: "Plugin & integration development",
      metaTitle: "Plugin & Integration Developer · Pedro Primor",
      metaDescription: "I build plugins and integrations for Adobe, Canva, Microsoft Office and Jira.",
      pitch: "Pitch.",
      also: [{ name: "QuarkXPress XTensions", description: "Native extensions." }],
    },
    process: ["Call", "Quote"],
    services: [
      {
        slug: "canva-apps",
        name: "Canva Apps",
        title: "Canva app development",
        metaTitle: "Canva App Developer · Pedro Primor",
        metaDescription: "I build Canva Apps with React, TypeScript and the Canva Apps SDK for your product.",
        summary: "Summary.",
        pitch: "Pitch.",
        shipped: ["PageProof for Canva"],
        handles: ["App UI"],
        faq: [{ q: "Q?", a: "A." }],
      },
    ],
  };
}

describe("parseServicesYaml", () => {
  it("parses production services.yaml against production plugins", () => {
    const allPlugins = parseExperienceYaml(readContent("experience")).flatMap((e) => e.plugins ?? []);
    const { services } = parseServicesYaml(readContent("services"), allPlugins);
    expect(services.map((s) => s.slug)).toEqual([
      "adobe-uxp-plugins",
      "canva-apps",
      "atlassian-forge-apps",
      "office-add-ins",
    ]);
    const uxp = services[0]!;
    expect(uxp.shipped.map((p) => p.name)).toEqual([
      "PageProof for Adobe Photoshop",
      "PageProof for Adobe InDesign",
    ]);
    expect(uxp.shipped[0]?.url).toMatch(/^https:\/\/exchange\.adobe\.com\//);
  });

  it("resolves shipped names to the full plugin record", () => {
    const { services } = parseServicesYaml(stringify(validServicesFile()), plugins);
    expect(services[0]?.shipped).toEqual([plugins[0]]);
  });

  it("rejects a shipped plugin missing from experience.yaml, naming both", () => {
    const file = validServicesFile();
    file.services[0]!.shipped = ["PageProof for Nothing"];
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(
      /canva-apps.*PageProof for Nothing/,
    );
  });

  it("rejects duplicate slugs", () => {
    const file = validServicesFile();
    file.services.push({ ...file.services[0]! });
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(/Duplicate slug.*canva-apps/);
  });

  it("rejects a metaDescription over 160 characters", () => {
    const file = validServicesFile();
    file.services[0]!.metaDescription = "x".repeat(161);
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(ZodError);
  });

  it("rejects a metaTitle over 60 characters", () => {
    const file = validServicesFile();
    file.services[0]!.metaTitle = "x".repeat(61);
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(ZodError);
  });

  it("rejects a non-kebab-case slug", () => {
    const file = validServicesFile();
    file.services[0]!.slug = "Canva Apps";
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(ZodError);
  });

  it("rejects a service with no FAQ", () => {
    const file = validServicesFile();
    file.services[0]!.faq = [];
    expect(() => parseServicesYaml(stringify(file), plugins)).toThrow(ZodError);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/content/parse.test.ts`
Expected: FAIL, `parseServicesYaml` is not exported.

- [ ] **Step 3: Add the schema**

Append to `src/lib/content/schemas.ts`, before the `export type` lines:

```ts
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const metaTitleSchema = z.string().min(1).max(60);
const metaDescriptionSchema = z.string().min(50).max(160);

export const serviceSchema = z.object({
  slug: z.string().regex(slugRegex, "Expected a lowercase kebab-case slug"),
  name: z.string().min(1),
  title: z.string().min(1),
  metaTitle: metaTitleSchema,
  metaDescription: metaDescriptionSchema,
  summary: z.string().min(1),
  pitch: z.string().min(1),
  shipped: z.array(z.string().min(1)).min(1),
  handles: z.array(z.string().min(1)).min(1),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(1),
});

export const servicesFileSchema = z
  .object({
    overview: z.object({
      title: z.string().min(1),
      metaTitle: metaTitleSchema,
      metaDescription: metaDescriptionSchema,
      pitch: z.string().min(1),
      also: z
        .array(z.object({ name: z.string().min(1), description: z.string().min(1) }))
        .min(1),
    }),
    process: z.array(z.string().min(1)).min(1),
    services: z.array(serviceSchema).min(1),
  })
  .superRefine((file, ctx) => {
    const seen = new Set<string>();
    file.services.forEach((service, index) => {
      if (seen.has(service.slug)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate slug "${service.slug}"`,
          path: ["services", index, "slug"],
        });
      }
      seen.add(service.slug);
    });
  });

export type ExperiencePluginYaml = z.infer<typeof experiencePluginSchema>;
```

- [ ] **Step 4: Add the parser**

Append to `src/lib/content/parse.ts`. Add `servicesFileSchema` and `type ExperiencePluginYaml` to the `./schemas` import.

```ts
export function parseServicesYaml(
  raw: string,
  plugins: readonly ExperiencePluginYaml[],
) {
  const file = servicesFileSchema.parse(parseYaml(raw));
  const byName = new Map(plugins.map((plugin) => [plugin.name, plugin]));
  return {
    overview: file.overview,
    process: file.process,
    services: file.services.map((service) => ({
      ...service,
      shipped: service.shipped.map((name) => {
        const plugin = byName.get(name);
        if (!plugin) {
          throw new Error(
            `services.yaml: "${service.slug}" lists shipped plugin "${name}", which is not in experience.yaml`,
          );
        }
        return plugin;
      }),
    })),
  };
}

export type ServicesContent = ReturnType<typeof parseServicesYaml>;
export type Service = ServicesContent["services"][number];
```

`ZodError.message` is the JSON-encoded issue list, so the quotes around the slug arrive escaped. That is why the duplicate-slug test matches `/Duplicate slug.*canva-apps/` rather than the literal quoted string.

- [ ] **Step 5: Write the draft content**

Create `content/services.yaml`. The copy is a draft for Pedro to rewrite; keep every claim to what `experience.yaml` already states.

```yaml
overview:
  title: Plugin & integration development
  metaTitle: Plugin & Integration Developer · Pedro Primor
  metaDescription: I build plugins and integrations for Adobe, Canva, Microsoft Office and Jira, from first prototype to marketplace listing.
  pitch: >-
    I build plugins and integrations for the tools creative teams already work
    in. Since 2023 I've built PageProof's integrations for Adobe, Canva,
    Microsoft Office, Jira and more, and I can build yours.
  also:
    - name: QuarkXPress XTensions
      description: Native cross-platform extensions with an embedded React UI, like PageProof for QuarkXPress.
    - name: Final Cut Pro extensions
      description: Workflow extensions in Swift and SwiftUI for video teams.
    - name: DAM delivery integrations
      description: Send approved files to Canto, Bynder and other asset libraries, with every delivery logged.
    - name: OAuth 2.0 and OpenID Connect
      description: Authorization servers and sign-in flows that let one account work across all your integrations.
process:
  - A call to understand the workflow you want inside the host app.
  - A written scope with a fixed quote and timeline.
  - Early builds you can try, with regular check-ins.
  - Store submission, then handover of the code and documentation.
services:
  - slug: adobe-uxp-plugins
    name: Adobe UXP plugins
    title: Adobe UXP plugin development
    metaTitle: Adobe UXP Plugin Developer · Pedro Primor
    metaDescription: I build Adobe UXP plugins for Photoshop and InDesign, from the first panel to an approved Adobe Exchange listing.
    summary: Photoshop and InDesign plugins, from the first panel to Adobe Exchange.
    pitch: >-
      I build and maintain PageProof's UXP plugins for Photoshop and InDesign,
      both listed on Adobe Exchange. If your product needs to live inside
      Adobe's apps, I can take it from the first prototype to an approved
      listing.
    shipped:
      - PageProof for Adobe Photoshop
      - PageProof for Adobe InDesign
    handles:
      - UXP manifest, permissions and host-app version support
      - Panel UI in React and TypeScript that sits naturally inside the host app
      - Reading and changing documents through the Photoshop and InDesign APIs
      - Sign-in and calls to your own API from inside the plugin
      - Packaging, Adobe Exchange submission and the review back-and-forth
    faq:
      - q: Can you move an existing CEP extension to UXP?
        a: Yes. Adobe is moving its apps from CEP to UXP. I can port an existing CEP panel, keeping its features while moving it to UXP's APIs and manifest.
      - q: Which Adobe apps do you work with?
        a: I've shipped UXP plugins for Photoshop and InDesign. Ask about the app you have in mind.
      - q: Can you take over a plugin someone else started?
        a: Yes. I'll review the code first and tell you plainly what I'd keep and what I'd change.
  - slug: canva-apps
    name: Canva Apps
    title: Canva app development
    metaTitle: Canva App Developer · Pedro Primor
    metaDescription: I build Canva Apps with React, TypeScript and the Canva Apps SDK, connecting your product to the designs your users make in Canva.
    summary: Apps on the Canva Apps SDK that connect your product to Canva designs.
    pitch: >-
      I built PageProof for Canva, which lets teams send a Canva design for
      review without leaving the editor. If your users design in Canva, I can
      bring your product to them there.
    shipped:
      - PageProof for Canva
    handles:
      - App UI in React and TypeScript using Canva's App UI Kit
      - Exporting designs and reading design content through the Apps SDK
      - Signing users in to your own service
      - A backend for the app, if it needs one
      - Canva's app review and publishing
    faq:
      - q: Does a Canva App need a backend?
        a: Not always. An app that only works with the design can run entirely in Canva. If it talks to your product, it needs an API to call, and I can build that too.
      - q: Can you work on an app that's already published?
        a: Yes. I can pick up an existing app, address review feedback, or add features.
  - slug: atlassian-forge-apps
    name: Atlassian Forge & Jira apps
    title: Atlassian Forge and Jira app development
    metaTitle: Atlassian Forge & Jira App Developer · Pedro Primor
    metaDescription: I build Atlassian Forge apps for Jira that connect your product to issues, with panels, status sync, file delivery and the backend behind them.
    summary: Forge apps that bring your product into Jira issues.
    pitch: >-
      I built the backend for PageProof for Jira, a Forge app that links proofs
      to Jira issues, syncs approval status and delivers approved files into
      Jira. I can build the same kind of connection for your product.
    shipped:
      - PageProof for Jira
    handles:
      - Forge issue panels and their UI
      - Keeping status in sync between your product and Jira issues
      - The backend service Forge talks to, for example on Azure Functions
      - OAuth 2.0 sign-in between Jira and your product
      - Atlassian Marketplace listing
    faq:
      - q: Forge or Connect?
        a: Atlassian recommends Forge for new Jira Cloud apps, and that's what I build on.
      - q: Can the app talk to our existing API?
        a: Yes. Forge apps can call external services. I'll set up the authentication and permissions it needs.
  - slug: office-add-ins
    name: Microsoft Office add-ins
    title: Microsoft Office add-in development
    metaTitle: Microsoft Office Add-in Developer · Pedro Primor
    metaDescription: I build Microsoft Office add-ins with Office.js, React and TypeScript, bringing your product into Word, Excel and PowerPoint.
    summary: Office.js taskpane add-ins for Word, Excel and PowerPoint.
    pitch: >-
      I built PageProof's Office add-in, which brings proofing into Microsoft
      Office and is listed on Microsoft Marketplace. I can build a taskpane
      add-in that puts your product inside the documents your users already
      work in.
    shipped:
      - PageProof for Microsoft Office
    handles:
      - Taskpane UI in React and TypeScript
      - Reading and inserting document content with Office.js
      - Signing in to your service from inside Office
      - Support across Office on Windows, Mac and the web
      - Microsoft Marketplace submission and validation
    faq:
      - q: Can one add-in cover Word, Excel and PowerPoint?
        a: Often, yes. A single add-in can run in several Office apps, with app-specific code where their APIs differ.
      - q: Do add-ins work in Office on the web?
        a: Yes. Office.js add-ins run in Office on Windows, Mac and the web.
```

- [ ] **Step 6: Export the parsed content**

In `src/lib/content/index.ts`, add `parseServicesYaml` to the `./parse` import and add after `skills`:

```ts
export const services = parseServicesYaml(
  getContentYaml("services"),
  experienceData.flatMap((entry) => entry.plugins ?? []),
);
```

Add `Service, ServicesContent` to the `export type { … } from "./parse"` line.

In `src/lib/data.ts`:

```ts
export { projects, experienceData, skills, services } from "./content";

export type { Project, ExperienceEntry, SkillCategory, Skills, Service, ServicesContent } from "./content";
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run src/lib/content/parse.test.ts`
Expected: PASS (all existing tests plus the 8 new ones). If the production-file test fails on a length rule, shorten that string in `services.yaml`; don't loosen the schema.

- [ ] **Step 8: Typecheck and commit**

Run: `npm run typecheck` (expected: no errors)

```bash
git add content/services.yaml src/lib/content src/lib/data.ts
git commit -m "feat(services): add services content with schema and plugin resolution

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Shared head-tag builder

**Files:**
- Create: `src/lib/head-tags.ts`
- Modify: `vite.config.ts`
- Test: `src/lib/head-tags.test.ts`

**Interfaces:**
- Produces:
  - `type HeadTag = { tag: "title" | "meta" | "link" | "script"; attrs?: Record<string, string | boolean>; children?: string }`
  - `type PageMeta = { path: string; title: string; description: string; jsonLd: Record<string, unknown> }`
  - `PERSON_ID: string` (`"https://primor.me/#person"`)
  - `personNode(): Record<string, unknown>` (no `@context`)
  - `homePageMeta: PageMeta`
  - `buildHeadTags(page: PageMeta): HeadTag[]`
  - `renderHeadTags(tags: readonly HeadTag[]): string`
  - `analyticsTag(token: string): HeadTag`
  - `safeJson(value: unknown): string`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/head-tags.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  PERSON_ID,
  analyticsTag,
  buildHeadTags,
  homePageMeta,
  renderHeadTags,
  safeJson,
  type HeadTag,
} from "./head-tags";
import { siteMetadata } from "./site-metadata";

const og = "https://primor.me/images/og.png";

describe("buildHeadTags", () => {
  it("produces the homepage tag set unchanged from the old site-meta plugin", () => {
    const tags = buildHeadTags(homePageMeta);
    const withoutJsonLd = tags.slice(0, -1);
    expect(withoutJsonLd).toEqual<HeadTag[]>([
      { tag: "title", children: siteMetadata.title },
      { tag: "meta", attrs: { name: "description", content: siteMetadata.description } },
      { tag: "meta", attrs: { name: "author", content: "Pedro Primor" } },
      { tag: "link", attrs: { rel: "canonical", href: "https://primor.me/" } },
      { tag: "meta", attrs: { property: "og:title", content: siteMetadata.title } },
      { tag: "meta", attrs: { property: "og:description", content: siteMetadata.description } },
      { tag: "meta", attrs: { property: "og:url", content: "https://primor.me/" } },
      { tag: "meta", attrs: { property: "og:type", content: "website" } },
      { tag: "meta", attrs: { property: "og:locale", content: "en" } },
      { tag: "meta", attrs: { property: "og:image", content: og } },
      { tag: "meta", attrs: { property: "og:image:alt", content: "Pedro Primor" } },
      { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
      { tag: "meta", attrs: { name: "twitter:title", content: siteMetadata.title } },
      { tag: "meta", attrs: { name: "twitter:description", content: siteMetadata.description } },
      { tag: "meta", attrs: { name: "twitter:image", content: og } },
    ]);

    const jsonLd = tags.at(-1)!;
    expect(jsonLd.attrs).toEqual({ type: "application/ld+json" });
    expect(JSON.parse(jsonLd.children!)).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Pedro Primor",
      url: "https://primor.me",
      jobTitle: siteMetadata.jobTitle,
      description: siteMetadata.description,
      image: og,
      worksFor: { "@type": "Organization", name: "PageProof", url: "https://pageproof.com" },
      sameAs: ["https://github.com/pprimor", "https://www.linkedin.com/in/primor/"],
    });
  });

  it("uses the page path for canonical and og:url", () => {
    const tags = buildHeadTags({ ...homePageMeta, path: "/services/canva-apps/" });
    expect(tags).toContainEqual({
      tag: "link",
      attrs: { rel: "canonical", href: "https://primor.me/services/canva-apps/" },
    });
    expect(tags).toContainEqual({
      tag: "meta",
      attrs: { property: "og:url", content: "https://primor.me/services/canva-apps/" },
    });
  });
});

describe("safeJson", () => {
  it("cannot close a script tag or open a comment", () => {
    const out = safeJson({ a: "</script><!-- & >" });
    expect(out).not.toMatch(/[<>&]/);
    expect(JSON.parse(out)).toEqual({ a: "</script><!-- & >" });
  });
});

describe("renderHeadTags", () => {
  it("serialises void, text and boolean-attribute tags with escaping", () => {
    const html = renderHeadTags([
      { tag: "title", children: "A & B <c>" },
      { tag: "meta", attrs: { name: "description", content: 'Say "hi"' } },
      analyticsTag("tok"),
    ]);
    expect(html).toContain("<title>A &amp; B &lt;c&gt;</title>");
    expect(html).toContain('<meta name="description" content="Say &quot;hi&quot;">');
    expect(html).toContain(
      '<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{&quot;token&quot;:&quot;tok&quot;}"></script>',
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/head-tags.test.ts`
Expected: FAIL, module `./head-tags` not found.

- [ ] **Step 3: Implement**

Create `src/lib/head-tags.ts`:

```ts
import { absoluteUrl, siteMetadata } from "./site-metadata";

export type HeadTag = {
  tag: "title" | "meta" | "link" | "script";
  attrs?: Record<string, string | boolean>;
  children?: string;
};

export type PageMeta = {
  /** Site-relative path, e.g. "/" or "/services/canva-apps/". */
  path: string;
  title: string;
  description: string;
  jsonLd: Record<string, unknown>;
};

export const PERSON_ID = `${siteMetadata.siteUrl}/#person`;

export function personNode(): Record<string, unknown> {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: siteMetadata.author,
    url: siteMetadata.siteUrl,
    jobTitle: siteMetadata.jobTitle,
    description: siteMetadata.description,
    image: absoluteUrl(siteMetadata.ogImagePath),
    worksFor: {
      "@type": "Organization",
      name: siteMetadata.worksFor.name,
      url: siteMetadata.worksFor.url,
    },
    sameAs: [...siteMetadata.sameAs],
  };
}

export const homePageMeta: PageMeta = {
  path: "/",
  title: siteMetadata.title,
  description: siteMetadata.description,
  jsonLd: { "@context": "https://schema.org", ...personNode() },
};

const meta = (name: string, content: string): HeadTag => ({
  tag: "meta",
  attrs: { name, content },
});

const property = (name: string, content: string): HeadTag => ({
  tag: "meta",
  attrs: { property: name, content },
});

export function buildHeadTags(page: PageMeta): HeadTag[] {
  const url = absoluteUrl(page.path);
  const ogImage = absoluteUrl(siteMetadata.ogImagePath);
  return [
    { tag: "title", children: page.title },
    meta("description", page.description),
    meta("author", siteMetadata.author),
    { tag: "link", attrs: { rel: "canonical", href: url } },
    property("og:title", page.title),
    property("og:description", page.description),
    property("og:url", url),
    property("og:type", "website"),
    property("og:locale", siteMetadata.locale),
    property("og:image", ogImage),
    property("og:image:alt", siteMetadata.ogImageAlt),
    meta("twitter:card", "summary_large_image"),
    meta("twitter:title", page.title),
    meta("twitter:description", page.description),
    meta("twitter:image", ogImage),
    {
      tag: "script",
      attrs: { type: "application/ld+json" },
      children: safeJson(page.jsonLd),
    },
  ];
}

export function analyticsTag(token: string): HeadTag {
  return {
    tag: "script",
    attrs: {
      defer: true,
      src: "https://static.cloudflareinsights.com/beacon.min.js",
      "data-cf-beacon": JSON.stringify({ token }),
    },
  };
}

/** JSON that is safe inside a <script>: `<`, `>` and `&` can't end the tag or open a comment. */
export function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderAttrs(attrs: Record<string, string | boolean>): string {
  return Object.entries(attrs)
    .map(([key, value]) => {
      if (value === false) return "";
      if (value === true) return ` ${key}`;
      return ` ${key}="${escapeHtml(value)}"`;
    })
    .join("");
}

export function renderHeadTags(tags: readonly HeadTag[]): string {
  return tags
    .map(({ tag, attrs = {}, children = "" }) => {
      const open = `<${tag}${renderAttrs(attrs)}>`;
      if (tag === "meta" || tag === "link") return open;
      const body = tag === "title" ? escapeHtml(children) : children;
      return `${open}${body}</${tag}>`;
    })
    .join("\n    ");
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/head-tags.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Use the builder in `vite.config.ts`**

Before editing, record the current homepage: `npm run build && cp dist/index.html "$TMPDIR/index-before.html"`.

Then replace `analyticsBeacon` and the homepage branch of `siteMetaPlugin`. The 404 branch keeps its own three tags. Service pages are skipped because they bring their own head (Task 7 serves them through `transformIndexHtml` in dev).

```ts
import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { analyticsTag, buildHeadTags, homePageMeta, type HeadTag } from './src/lib/head-tags';
import { siteMetadata } from './src/lib/site-metadata';

const notFoundTitle = `Page not found — ${siteMetadata.author}`;
const notFoundDescription =
  'This page does not exist on primor.me. Return to the homepage.';

function toHead(tags: readonly HeadTag[]): HtmlTagDescriptor[] {
  return tags.map((tag) => ({ ...tag, injectTo: 'head' as const }));
}

function siteMetaPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');
  const cfWebAnalyticsToken = env.VITE_CF_WEB_ANALYTICS_TOKEN?.trim();
  const analyticsTags = cfWebAnalyticsToken ? [analyticsTag(cfWebAnalyticsToken)] : [];

  return {
    name: 'site-meta',
    transformIndexHtml(_html, ctx) {
      if (ctx.path.startsWith('/services')) return;

      if (ctx.filename.endsWith('404.html')) {
        return toHead([
          { tag: 'title', children: notFoundTitle },
          { tag: 'meta', attrs: { name: 'description', content: notFoundDescription } },
          { tag: 'meta', attrs: { name: 'robots', content: 'noindex' } },
          ...analyticsTags,
        ]);
      }

      return toHead([...buildHeadTags(homePageMeta), ...analyticsTags]);
    },
  };
}
```

Leave `defineConfig(…)` unchanged in this task.

- [ ] **Step 6: Verify the built homepage head is unchanged**

Run: `npm run build && diff <(perl -pe 's/></>\n</g' "$TMPDIR/index-before.html") <(perl -pe 's/></>\n</g' dist/index.html)`
Expected: the only difference is `"@id":"https://primor.me/#person"` in the JSON-LD. Script/CSS asset hashes are identical because no app code changed.

- [ ] **Step 7: Lint, typecheck, full tests, commit**

Run: `npm run lint && npm run typecheck && npm test`
Expected: all pass.

```bash
git add src/lib/head-tags.ts src/lib/head-tags.test.ts vite.config.ts
git commit -m "refactor(seo): share one head-tag builder for every page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Service paths, page metadata and sitemap

**Files:**
- Create: `src/lib/service-paths.ts`, `src/lib/sitemap.ts`, `src/services/meta.ts`
- Test: `src/lib/sitemap.test.ts`, `src/services/meta.test.ts`

**Interfaces:**
- Consumes: `Service`, `ServicesContent`, `services` (Task 1); `PageMeta`, `PERSON_ID`, `personNode` (Task 2).
- Produces:
  - `SERVICES_PATH = "/services/"`
  - `servicePath(slug: string): string`
  - `sitePaths(slugs: readonly string[]): string[]`
  - `buildSitemap(siteUrl: string, paths: readonly string[]): string`
  - `servicePageMeta(service: Service): PageMeta`
  - `overviewPageMeta(content: ServicesContent): PageMeta`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/sitemap.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { SERVICES_PATH, servicePath, sitePaths } from "./service-paths";
import { buildSitemap } from "./sitemap";

describe("service paths", () => {
  it("always ends with a slash", () => {
    expect(SERVICES_PATH).toBe("/services/");
    expect(servicePath("canva-apps")).toBe("/services/canva-apps/");
  });

  it("lists the homepage, the overview and every service", () => {
    expect(sitePaths(["a", "b"])).toEqual(["/", "/services/", "/services/a/", "/services/b/"]);
  });
});

describe("buildSitemap", () => {
  it("writes one <url> per path", () => {
    const xml = buildSitemap("https://primor.me", ["/", "/services/"]);
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml).toContain("<loc>https://primor.me/services/</loc>");
  });
});
```

Create `src/services/meta.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { services } from "../lib/content";
import { PERSON_ID } from "../lib/head-tags";
import { overviewPageMeta, servicePageMeta } from "./meta";

type Node = Record<string, unknown> & { "@type": string };

function graph(jsonLd: Record<string, unknown>): Node[] {
  return jsonLd["@graph"] as Node[];
}

function byType(nodes: Node[], type: string): Node {
  const node = nodes.find((n) => n["@type"] === type);
  if (!node) throw new Error(`no ${type} node`);
  return node;
}

describe("servicePageMeta", () => {
  const uxp = services.services[0]!;
  const meta = servicePageMeta(uxp);

  it("uses the service's meta title, description and path", () => {
    expect(meta.path).toBe("/services/adobe-uxp-plugins/");
    expect(meta.title).toBe(uxp.metaTitle);
    expect(meta.description).toBe(uxp.metaDescription);
  });

  it("describes a Service provided by the Person", () => {
    const nodes = graph(meta.jsonLd);
    expect(meta.jsonLd["@context"]).toBe("https://schema.org");
    expect(byType(nodes, "Person")["@id"]).toBe(PERSON_ID);
    expect(byType(nodes, "Service")).toMatchObject({
      name: uxp.title,
      serviceType: uxp.name,
      url: "https://primor.me/services/adobe-uxp-plugins/",
      provider: { "@id": PERSON_ID },
    });
  });

  it("turns the FAQ into a FAQPage", () => {
    const faq = byType(graph(meta.jsonLd), "FAQPage");
    expect(faq.mainEntity).toEqual(
      uxp.faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    );
  });

  it("has a three-level breadcrumb", () => {
    const crumbs = byType(graph(meta.jsonLd), "BreadcrumbList").itemListElement as Node[];
    expect(crumbs.map((c) => c.item)).toEqual([
      "https://primor.me/",
      "https://primor.me/services/",
      "https://primor.me/services/adobe-uxp-plugins/",
    ]);
    expect(crumbs.map((c) => c.position)).toEqual([1, 2, 3]);
  });
});

describe("overviewPageMeta", () => {
  it("lists every service in an ItemList", () => {
    const meta = overviewPageMeta(services);
    expect(meta.path).toBe("/services/");
    const list = byType(graph(meta.jsonLd), "ItemList").itemListElement as Node[];
    expect(list.map((item) => item.url)).toEqual(
      services.services.map((s) => `https://primor.me/services/${s.slug}/`),
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/sitemap.test.ts src/services/meta.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement paths and sitemap**

Create `src/lib/service-paths.ts`:

```ts
export const SERVICES_PATH = "/services/";

export function servicePath(slug: string): string {
  return `${SERVICES_PATH}${slug}/`;
}

/** Every indexable page on the site, homepage first. */
export function sitePaths(slugs: readonly string[]): string[] {
  return ["/", SERVICES_PATH, ...slugs.map(servicePath)];
}
```

Create `src/lib/sitemap.ts`:

```ts
export function buildSitemap(siteUrl: string, paths: readonly string[]): string {
  const urls = paths
    .map((path) => `  <url>\n    <loc>${siteUrl}${path}</loc>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
```

- [ ] **Step 4: Implement page metadata**

Create `src/services/meta.ts`:

```ts
import type { Service, ServicesContent } from "../lib/content";
import { PERSON_ID, personNode, type PageMeta } from "../lib/head-tags";
import { SERVICES_PATH, servicePath } from "../lib/service-paths";
import { absoluteUrl } from "../lib/site-metadata";

type Crumb = { name: string; path: string };

const overviewCrumbs: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "Services", path: SERVICES_PATH },
];

function breadcrumbNode(crumbs: readonly Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function servicePageMeta(service: Service): PageMeta {
  const path = servicePath(service.slug);
  return {
    path,
    title: service.metaTitle,
    description: service.metaDescription,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        personNode(),
        {
          "@type": "Service",
          name: service.title,
          serviceType: service.name,
          description: service.metaDescription,
          url: absoluteUrl(path),
          areaServed: { "@type": "Place", name: "Worldwide" },
          provider: { "@id": PERSON_ID },
        },
        {
          "@type": "FAQPage",
          mainEntity: service.faq.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        },
        breadcrumbNode([...overviewCrumbs, { name: service.name, path }]),
      ],
    },
  };
}

export function overviewPageMeta(content: ServicesContent): PageMeta {
  return {
    path: SERVICES_PATH,
    title: content.overview.metaTitle,
    description: content.overview.metaDescription,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        personNode(),
        {
          "@type": "ItemList",
          itemListElement: content.services.map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: service.name,
            url: absoluteUrl(servicePath(service.slug)),
          })),
        },
        breadcrumbNode(overviewCrumbs),
      ],
    },
  };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/lib/sitemap.test.ts src/services/meta.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/service-paths.ts src/lib/sitemap.ts src/lib/sitemap.test.ts src/services/meta.ts src/services/meta.test.ts
git commit -m "feat(services): page metadata, structured data and sitemap builder

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Contact endpoint accepts `service`

**Files:**
- Modify: `functions/lib/contact/helpers.ts`, `functions/lib/contact/handler.ts`, `functions/lib/contact/render-email.tsx`, `functions/lib/contact/email.tsx`
- Test: `functions/api/contact.test.ts`

**Interfaces:**
- Produces: `POST /api/contact` accepts an optional `service: string` in the JSON body. When valid, the email subject becomes `New inquiry: <service>`, and the email shows a `Service:` line.
- `normalizeService(value: unknown): string | null` in `helpers.ts`.

- [ ] **Step 1: Write the failing tests**

Add inside `describe("onRequestPost", …)` in `functions/api/contact.test.ts`, after the last test:

```ts
  async function sentPayload(service: unknown) {
    const fetchMock = mockFetch();
    const response = await postContact({
      turnstileToken: TURNSTILE_TEST_TOKEN,
      senderEmail: "user@example.com",
      message: "Hello",
      service,
    });
    expect(response.status).toBe(200);
    const resendCall = fetchMock.mock.calls.find(([url]) => url === RESEND_URL);
    return JSON.parse(String(resendCall?.[1]?.body)) as { subject: string; html: string };
  }

  it("puts the service in the subject and the email body", async () => {
    const payload = await sentPayload("Adobe UXP plugins");
    expect(payload.subject).toBe("New inquiry: Adobe UXP plugins");
    expect(payload.html).toContain("Adobe UXP plugins");
  });

  it("keeps the default subject when no service is sent", async () => {
    const payload = await sentPayload(undefined);
    expect(payload.subject).toBe("Contact from primor.me");
  });

  it("ignores a service over 64 characters", async () => {
    const payload = await sentPayload("x".repeat(65));
    expect(payload.subject).toBe("Contact from primor.me");
    expect(payload.html).not.toContain("x".repeat(65));
  });

  it("collapses newlines in the service before it reaches the subject", async () => {
    const payload = await sentPayload("Canva\r\nBcc: evil@example.com");
    expect(payload.subject).toBe("New inquiry: Canva Bcc: evil@example.com");
    expect(payload.subject).not.toMatch(/[\r\n]/);
  });

  it("ignores a non-string service", async () => {
    const payload = await sentPayload({ name: "Canva" });
    expect(payload.subject).toBe("Contact from primor.me");
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run functions/api/contact.test.ts`
Expected: FAIL, subject is always `Contact from primor.me`.

- [ ] **Step 3: Implement**

Append to `functions/lib/contact/helpers.ts`:

```ts
export const MAX_SERVICE_LENGTH = 64;

/** The service an inquiry is about: one line, at most 64 characters, or null. */
export function normalizeService(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const service = value.replace(/\s+/g, " ").trim();
  return service && service.length <= MAX_SERVICE_LENGTH ? service : null;
}
```

In `functions/lib/contact/handler.ts`:
- add `normalizeService` to the `./helpers` import;
- add `service?: unknown;` to `ContactBody`;
- replace the `html` and `subject` lines:

```ts
  const service = normalizeService(body.service);
  const html = await renderContactEmailHtml(senderEmail, message, service);
```

```ts
      subject: service ? `New inquiry: ${service}` : "Contact from primor.me",
```

In `functions/lib/contact/render-email.tsx`:

```tsx
export async function renderContactEmailHtml(
  senderEmail: string,
  message: string,
  service: string | null = null
): Promise<string> {
  return render(
    <ContactEmail senderEmail={senderEmail} message={message} service={service} />
  );
}
```

In `functions/lib/contact/email.tsx`, add `service?: string | null;` to `ContactEmailProps`, destructure `service`, and render it under the `From:` line:

```tsx
            {service && (
              <Text>
                <strong>Service:</strong> {service}
              </Text>
            )}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run functions/api/contact.test.ts`
Expected: PASS (all existing plus 5 new).

- [ ] **Step 5: Commit**

```bash
git add functions
git commit -m "feat(contact): tag inquiries with the service they're about

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Contact form

**Files:**
- Create: `src/services/inquiry.ts`, `src/services/turnstile.ts`, `src/services/ContactForm.tsx`
- Test: `src/services/inquiry.test.ts`, `src/services/ContactForm.test.ts`

**Interfaces:**
- Consumes: `POST /api/contact` with `{ senderEmail, message, service, company, turnstileToken }` (Task 4).
- Produces:
  - `OTHER_SERVICE = "Something else"`
  - `type InquiryInput = { senderEmail: string; message: string; service: string; company: string; turnstileToken: string | null }`
  - `type SubmitResult = { ok: true } | { ok: false; error: string }`
  - `submitInquiry(input: InquiryInput, fetchImpl?: typeof fetch): Promise<SubmitResult>`
  - `GENERIC_ERROR`, `VERIFY_FIRST` (strings)
  - `type ContactFormProps = { services: readonly string[]; selected?: string; turnstileSiteKey: string | null; contactEmail: string }`
  - `default ContactForm(props: ContactFormProps)`
  - `FORM_ROOT_ID = "contact-form"`, `FORM_PROPS_ID = "contact-form-props"`

- [ ] **Step 1: Write the failing tests for `submitInquiry`**

Create `src/services/inquiry.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { GENERIC_ERROR, VERIFY_FIRST, submitInquiry, type InquiryInput } from "./inquiry";

const input: InquiryInput = {
  senderEmail: "  client@example.com ",
  message: " Need a plugin ",
  service: "Canva Apps",
  company: "",
  turnstileToken: "tok",
};

function fetchReturning(response: Response | Error) {
  return vi.fn<typeof fetch>(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
}

describe("submitInquiry", () => {
  it("posts trimmed fields, the service, the honeypot and the token", async () => {
    const fetchMock = fetchReturning(Response.json({ success: true }));
    await expect(submitInquiry(input, fetchMock)).resolves.toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/contact");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      senderEmail: "client@example.com",
      message: "Need a plugin",
      service: "Canva Apps",
      company: "",
      turnstileToken: "tok",
    });
  });

  it("does not post without a Turnstile token", async () => {
    const fetchMock = fetchReturning(Response.json({ success: true }));
    await expect(submitInquiry({ ...input, turnstileToken: null }, fetchMock)).resolves.toEqual({
      ok: false,
      error: VERIFY_FIRST,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the server's error message on a JSON error response", async () => {
    const fetchMock = fetchReturning(
      Response.json({ error: "Too many requests. Please try again later." }, { status: 429 }),
    );
    await expect(submitInquiry(input, fetchMock)).resolves.toEqual({
      ok: false,
      error: "Too many requests. Please try again later.",
    });
  });

  it("falls back to the generic error on a non-JSON error response", async () => {
    const fetchMock = fetchReturning(new Response("Bad gateway", { status: 502 }));
    await expect(submitInquiry(input, fetchMock)).resolves.toEqual({ ok: false, error: GENERIC_ERROR });
  });

  it("falls back to the generic error when the network fails", async () => {
    const fetchMock = fetchReturning(new TypeError("Failed to fetch"));
    await expect(submitInquiry(input, fetchMock)).resolves.toEqual({ ok: false, error: GENERIC_ERROR });
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/services/inquiry.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `inquiry.ts`**

```ts
import { siteMetadata } from "../lib/site-metadata";

export const OTHER_SERVICE = "Something else";

export const GENERIC_ERROR = `Couldn't send your message. Please try again, or email ${siteMetadata.contactEmail} directly.`;
export const VERIFY_FIRST = "Please wait for the verification check to finish, then send again.";

export type InquiryInput = {
  senderEmail: string;
  message: string;
  service: string;
  /** Honeypot: empty for people, filled by bots. */
  company: string;
  turnstileToken: string | null;
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitInquiry(
  input: InquiryInput,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  if (!input.turnstileToken) return { ok: false, error: VERIFY_FIRST };

  let response: Response;
  try {
    response = await fetchImpl("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderEmail: input.senderEmail.trim(),
        message: input.message.trim(),
        service: input.service,
        company: input.company,
        turnstileToken: input.turnstileToken,
      }),
    });
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }

  if (response.ok) return { ok: true };

  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return {
    ok: false,
    error: typeof body?.error === "string" ? body.error : GENERIC_ERROR,
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/services/inquiry.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Write the failing render test for `ContactForm`**

Create `src/services/ContactForm.test.ts`:

```ts
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ContactForm, { type ContactFormProps } from "./ContactForm";

const props: ContactFormProps = {
  services: ["Adobe UXP plugins", "Canva Apps"],
  selected: "Canva Apps",
  turnstileSiteKey: "site-key",
  contactEmail: "hello@primor.me",
};

const render = (p: ContactFormProps) => renderToString(createElement(ContactForm, p));

describe("ContactForm (server render)", () => {
  const html = render(props);

  it("labels every visible field", () => {
    expect(html).toMatch(/<label[^>]*for="contact-email"/);
    expect(html).toMatch(/<input[^>]*id="contact-email"[^>]*name="senderEmail"/);
    expect(html).toMatch(/<label[^>]*for="contact-service"/);
    expect(html).toMatch(/<label[^>]*for="contact-message"/);
  });

  it("pre-selects the page's service and offers 'Something else'", () => {
    expect(html).toMatch(/<option value="Canva Apps" selected="">/);
    expect(html).toContain('<option value="Something else">');
  });

  it("hides the company honeypot from people and assistive tech", () => {
    expect(html).toMatch(/<div aria-hidden="true"[^>]*>.*name="company"/s);
    expect(html).toMatch(/name="company"[^>]*tabindex="-1"|tabindex="-1"[^>]*name="company"/);
  });

  it("keeps submit disabled until hydrated and offers email without JS", () => {
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled=""/);
    expect(html).toMatch(/<noscript>.*mailto:hello@primor.me.*<\/noscript>/s);
  });

  it("falls back to email when no Turnstile key is configured", () => {
    const fallback = render({ ...props, turnstileSiteKey: null });
    expect(fallback).toContain("The form is unavailable right now");
    expect(fallback).toContain("mailto:hello@primor.me");
  });
});
```

- [ ] **Step 6: Run to verify failure**

Run: `npx vitest run src/services/ContactForm.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 7: Implement the Turnstile loader**

Create `src/services/turnstile.ts`:

```ts
export type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading: Promise<TurnstileApi> | null = null;

/** Loads Cloudflare Turnstile once, on demand. */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile did not initialise"));
    script.onerror = () => {
      loading = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}
```

- [ ] **Step 8: Implement `ContactForm.tsx`**

Fixed element IDs (not `useId`) because the island hydrates `ContactForm` as its own root while the server rendered it inside the page tree; `useId` values would differ. There is one form per page.

```tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import { OTHER_SERVICE, submitInquiry } from "./inquiry";
import { loadTurnstile, type TurnstileApi } from "./turnstile";

export const FORM_ROOT_ID = "contact-form";
export const FORM_PROPS_ID = "contact-form-props";

export type ContactFormProps = {
  services: readonly string[];
  selected?: string;
  turnstileSiteKey: string | null;
  contactEmail: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const labelClass = "block font-mono text-sm text-term-heading";
const fieldClass =
  "mt-1 w-full border border-term-muted bg-term-bg px-2 py-1.5 text-base text-term-fg focus-visible:border-term-link focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-fg";
const mailLinkClass =
  "text-term-link underline decoration-term-muted underline-offset-4 hover:decoration-current";

export default function ContactForm({
  services,
  selected,
  turnstileSiteKey,
  contactEmail,
}: ContactFormProps) {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [token, setToken] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const api = useRef<TurnstileApi | null>(null);

  useEffect(() => setReady(true), []);

  // Load Turnstile only when the form is about to be seen.
  useEffect(() => {
    const form = formRef.current;
    const container = widgetRef.current;
    if (!turnstileSiteKey || !form || !container) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadTurnstile().then(
          (turnstile) => {
            if (cancelled) return;
            api.current = turnstile;
            widgetId.current = turnstile.render(container, {
              sitekey: turnstileSiteKey,
              theme: "dark",
              callback: setToken,
              "expired-callback": () => setToken(null),
              "error-callback": () => setToken(null),
            });
          },
          () => {
            if (cancelled) return;
            setStatus({
              kind: "error",
              message: `Couldn't load the spam check. Email me at ${contactEmail} instead.`,
            });
          },
        );
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(form);
    return () => {
      cancelled = true;
      observer.disconnect();
      if (widgetId.current && api.current) api.current.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [turnstileSiteKey, contactEmail]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus({ kind: "sending" });
    const result = await submitInquiry({
      senderEmail: String(data.get("senderEmail") ?? ""),
      message: String(data.get("message") ?? ""),
      service: String(data.get("service") ?? ""),
      company: String(data.get("company") ?? ""),
      turnstileToken: token,
    });
    if (result.ok) {
      setStatus({ kind: "sent" });
      return;
    }
    setStatus({ kind: "error", message: result.error });
    // A Turnstile token is single-use; get a fresh one for the retry.
    if (widgetId.current && api.current) api.current.reset(widgetId.current);
    setToken(null);
  }

  const unavailable = !turnstileSiteKey;
  const emailLink = (
    <a href={`mailto:${contactEmail}`} className={mailLinkClass}>
      {contactEmail}
    </a>
  );

  return (
    <div>
      {status.kind === "sent" ? (
        <p className="border border-term-accent p-4 text-term-accent">
          Thanks, your message is on its way. I&apos;ll reply by email.
        </p>
      ) : (
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="contact-email" className={labelClass}>
              Your email
            </label>
            <input
              id="contact-email"
              name="senderEmail"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="contact-service" className={labelClass}>
              What do you need?
            </label>
            <select
              id="contact-service"
              name="service"
              defaultValue={selected ?? OTHER_SERVICE}
              className={fieldClass}
            >
              {[...services, OTHER_SERVICE].map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="contact-message" className={labelClass}>
              About the project
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={6}
              maxLength={5000}
              className={fieldClass}
            />
          </div>
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="contact-company">Company</label>
            <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          {unavailable ? (
            <p>The form is unavailable right now. Email me at {emailLink}.</p>
          ) : (
            <div ref={widgetRef} className="min-h-[65px]" />
          )}
          <noscript>
            <p>This form needs JavaScript. Email me at {emailLink}.</p>
          </noscript>
          <button
            type="submit"
            disabled={!ready || unavailable || status.kind === "sending"}
            className="x11-button h-8 px-4 disabled:cursor-not-allowed disabled:text-x11-shadow"
          >
            {status.kind === "sending" ? "Sending…" : "Send"}
          </button>
        </form>
      )}
      <p
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-6 ${status.kind === "error" ? "text-term-error" : "text-term-muted"}`}
      >
        {status.kind === "sending" && "Sending…"}
        {status.kind === "sent" && "Message sent."}
        {status.kind === "error" && status.message}
      </p>
    </div>
  );
}
```

- [ ] **Step 9: Run to verify pass**

Run: `npx vitest run src/services/ContactForm.test.ts src/services/inquiry.test.ts`
Expected: PASS (10 tests). If the `selected=""` or `disabled=""` regexes miss because React 19 serialises boolean attributes differently, print `html` once, adjust the regex to React's actual output, and keep the assertion's meaning.

- [ ] **Step 10: Lint, typecheck, commit**

Run: `npm run lint && npm run typecheck`

```bash
git add src/services/inquiry.ts src/services/inquiry.test.ts src/services/turnstile.ts src/services/ContactForm.tsx src/services/ContactForm.test.ts
git commit -m "feat(services): contact form with lazy Turnstile and inquiry submission

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Page components and document rendering

**Files:**
- Create: `src/services/ui.tsx`, `src/services/PageShell.tsx`, `src/services/ContactSection.tsx`, `src/services/ServicePage.tsx`, `src/services/ServicesOverview.tsx`, `src/services/document.ts`, `src/services/render.tsx`
- Test: `src/services/render.test.ts`

**Interfaces:**
- Consumes: Tasks 1, 2, 3 and 5.
- Produces:
  - `type Assets = { css: readonly string[]; js: readonly string[] }` (in `document.ts`)
  - `renderDocument(args: { meta: PageMeta; body: string; assets: Assets; analyticsToken?: string }): string`
  - `type RenderOptions = { assets: Assets; turnstileSiteKey?: string | null; analyticsToken?: string; content?: ServicesContent }`
  - `renderServicePages(options: RenderOptions): { path: string; html: string }[]` (overview first, then services in YAML order)

- [ ] **Step 1: Write the failing tests**

Create `src/services/render.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { services } from "../lib/content";
import { siteMetadata } from "../lib/site-metadata";
import { renderServicePages } from "./render";

const assets = { css: ["/assets/island.css"], js: ["/assets/island.js"] };
const pages = renderServicePages({ assets, turnstileSiteKey: "site-key", analyticsToken: "tok" });
const page = (path: string) => {
  const found = pages.find((p) => p.path === path);
  if (!found) throw new Error(`no page ${path}`);
  return found.html;
};

function embeddedProps(html: string): unknown {
  const match = html.match(/<script type="application\/json" id="contact-form-props">(.*?)<\/script>/s);
  if (!match) throw new Error("no props script");
  return JSON.parse(match[1]!);
}

describe("renderServicePages", () => {
  it("renders the overview and every service, each at a trailing-slash path", () => {
    expect(pages.map((p) => p.path)).toEqual([
      "/services/",
      "/services/adobe-uxp-plugins/",
      "/services/canva-apps/",
      "/services/atlassian-forge-apps/",
      "/services/office-add-ins/",
    ]);
  });

  it("writes a complete document with head tags, assets and analytics", () => {
    const html = page("/services/adobe-uxp-plugins/");
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain('<html lang="en"');
    expect(html).toContain("<title>Adobe UXP Plugin Developer · Pedro Primor</title>");
    expect(html).toContain('<link rel="canonical" href="https://primor.me/services/adobe-uxp-plugins/">');
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('<link rel="stylesheet" href="/assets/island.css" />');
    expect(html).toContain('<script type="module" src="/assets/island.js"></script>');
    expect(html).toContain("static.cloudflareinsights.com");
  });

  it("puts the content in the HTML, with one h1", () => {
    const uxp = services.services[0]!;
    const html = page("/services/adobe-uxp-plugins/");
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain(uxp.title);
    for (const plugin of uxp.shipped) expect(html).toContain(`href="${plugin.url}"`);
    for (const { q } of uxp.faq) expect(html).toContain(q.replace(/'/g, "&#x27;"));
    expect(html).toContain('<form');
    expect(html).toContain('aria-label="Breadcrumb"');
  });

  it("embeds exactly the props the form was rendered with", () => {
    expect(embeddedProps(page("/services/canva-apps/"))).toEqual({
      services: services.services.map((s) => s.name),
      selected: "Canva Apps",
      turnstileSiteKey: "site-key",
      contactEmail: siteMetadata.contactEmail,
    });
    expect(embeddedProps(page("/services/"))).toEqual({
      services: services.services.map((s) => s.name),
      turnstileSiteKey: "site-key",
      contactEmail: siteMetadata.contactEmail,
    });
  });

  it("links every service from the overview", () => {
    const html = page("/services/");
    for (const s of services.services) expect(html).toContain(`href="/services/${s.slug}/"`);
    for (const item of services.overview.also) expect(html).toContain(item.name);
  });

  it("omits analytics without a token", () => {
    const [overview] = renderServicePages({ assets, turnstileSiteKey: null });
    expect(overview!.html).not.toContain("cloudflareinsights");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/services/render.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Shared UI bits**

Create `src/services/ui.tsx`:

```tsx
import type { ReactNode } from "react";

export const linkClass =
  "text-term-link underline decoration-term-muted underline-offset-4 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-fg";

export function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-mono text-2xl font-bold leading-tight text-term-heading sm:text-3xl">
      <span aria-hidden="true" className="text-term-muted"># </span>
      {children}
    </h1>
  );
}

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-12 font-mono text-lg font-bold text-term-accent">
      <span aria-hidden="true" className="text-term-muted">## </span>
      {children}
    </h2>
  );
}
```

- [ ] **Step 4: Page shell**

Create `src/services/PageShell.tsx`:

```tsx
import type { ReactNode } from "react";
import { siteMetadata } from "../lib/site-metadata";
import { linkClass } from "./ui";

/** Header breadcrumb (`primor.me / services / …`) and footer around a service page. */
export default function PageShell({ path, children }: { path: string; children: ReactNode }) {
  const segments = path.split("/").filter(Boolean);
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 font-sans text-base leading-relaxed sm:py-10">
      <header>
        <nav aria-label="Breadcrumb" className="font-mono text-sm text-term-muted">
          <ol className="flex flex-wrap gap-x-1">
            <li>
              <a href="/" className={linkClass}>
                primor.me
              </a>
            </li>
            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join("/")}/`;
              const current = index === segments.length - 1;
              return (
                <li key={href} className="before:mr-1 before:content-['/']">
                  {current ? (
                    <span aria-current="page" className="text-term-fg">
                      {segment}
                    </span>
                  ) : (
                    <a href={href} className={linkClass}>
                      {segment}
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </header>
      <main className="mt-8">{children}</main>
      <footer className="mt-16 border-t border-term-muted pt-6 text-sm">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <a href={`mailto:${siteMetadata.contactEmail}`} className={linkClass}>
              {siteMetadata.contactEmail}
            </a>
          </li>
          <li>
            <a href={siteMetadata.profiles.github} className={linkClass}>
              GitHub
            </a>
          </li>
          <li>
            <a href={siteMetadata.profiles.linkedin} className={linkClass}>
              LinkedIn
            </a>
          </li>
          <li>
            <a href={siteMetadata.cvUrl} className={linkClass}>
              CV (PDF)
            </a>
          </li>
          <li>
            <a href="/" className={linkClass}>
              Back to the desktop
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}
```

- [ ] **Step 5: Contact section**

Create `src/services/ContactSection.tsx`:

```tsx
import { safeJson } from "../lib/head-tags";
import ContactForm, { FORM_PROPS_ID, FORM_ROOT_ID, type ContactFormProps } from "./ContactForm";
import { H2 } from "./ui";

/** The form, plus the exact props the island hydrates it with. */
export default function ContactSection({ form }: { form: ContactFormProps }) {
  return (
    <section aria-labelledby="contact-heading" className="mt-16 border-t border-term-muted pt-2">
      <H2 id="contact-heading">Start a project</H2>
      <p className="mt-3">Tell me what you want to build. I&apos;ll reply by email.</p>
      <div id={FORM_ROOT_ID} className="mt-6">
        <ContactForm {...form} />
      </div>
      <script
        type="application/json"
        id={FORM_PROPS_ID}
        dangerouslySetInnerHTML={{ __html: safeJson(form) }}
      />
    </section>
  );
}
```

- [ ] **Step 6: Service page and overview**

Create `src/services/ServicePage.tsx`:

```tsx
import type { Service } from "../lib/content";
import { servicePath } from "../lib/service-paths";
import type { ContactFormProps } from "./ContactForm";
import ContactSection from "./ContactSection";
import PageShell from "./PageShell";
import { H1, H2, linkClass } from "./ui";

type Props = { service: Service; process: readonly string[]; form: ContactFormProps };

export default function ServicePage({ service, process, form }: Props) {
  return (
    <PageShell path={servicePath(service.slug)}>
      <H1>{service.title}</H1>
      <p className="mt-4 text-lg">{service.pitch}</p>

      <H2>Shipped</H2>
      <ul className="mt-3 space-y-3">
        {service.shipped.map((plugin) => (
          <li key={plugin.url}>
            <a href={plugin.url} className={`${linkClass} font-mono`}>
              {plugin.name}
            </a>
            {plugin.description && <p className="text-term-muted">{plugin.description}</p>}
          </li>
        ))}
      </ul>

      <H2>What I handle</H2>
      <ul className="mt-3 list-['▸_'] space-y-1 pl-5 marker:text-term-accent">
        {service.handles.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <H2>How it works</H2>
      <ol className="mt-3 list-decimal space-y-1 pl-5 marker:text-term-muted">
        {process.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <H2>Questions</H2>
      <dl className="mt-3 space-y-5">
        {service.faq.map(({ q, a }) => (
          <div key={q}>
            <dt className="font-bold text-term-heading">{q}</dt>
            <dd className="mt-1">{a}</dd>
          </div>
        ))}
      </dl>

      <ContactSection form={form} />
    </PageShell>
  );
}
```

Create `src/services/ServicesOverview.tsx`:

```tsx
import type { ServicesContent } from "../lib/content";
import { SERVICES_PATH, servicePath } from "../lib/service-paths";
import type { ContactFormProps } from "./ContactForm";
import ContactSection from "./ContactSection";
import PageShell from "./PageShell";
import { H1, H2, linkClass } from "./ui";

type Props = { content: ServicesContent; form: ContactFormProps };

export default function ServicesOverview({ content, form }: Props) {
  const { overview, process, services } = content;
  return (
    <PageShell path={SERVICES_PATH}>
      <H1>{overview.title}</H1>
      <p className="mt-4 text-lg">{overview.pitch}</p>

      <H2>What I build</H2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.slug} className="border border-term-muted p-4">
            <a href={servicePath(service.slug)} className={`${linkClass} font-mono font-bold`}>
              {service.name}
            </a>
            <p className="mt-2 text-sm">{service.summary}</p>
          </li>
        ))}
      </ul>

      <H2>Also</H2>
      <dl className="mt-3 space-y-3">
        {overview.also.map((item) => (
          <div key={item.name}>
            <dt className="font-mono font-bold text-term-heading">{item.name}</dt>
            <dd>{item.description}</dd>
          </div>
        ))}
      </dl>

      <H2>How it works</H2>
      <ol className="mt-3 list-decimal space-y-1 pl-5 marker:text-term-muted">
        {process.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <ContactSection form={form} />
    </PageShell>
  );
}
```

- [ ] **Step 7: Document and render entry**

Create `src/services/document.ts`:

```ts
import { analyticsTag, buildHeadTags, renderHeadTags, type PageMeta } from "../lib/head-tags";

export type Assets = { css: readonly string[]; js: readonly string[] };

type DocumentArgs = { meta: PageMeta; body: string; assets: Assets; analyticsToken?: string };

export function renderDocument({ meta, body, assets, analyticsToken }: DocumentArgs): string {
  const tags = [...buildHeadTags(meta), ...(analyticsToken ? [analyticsTag(analyticsToken)] : [])];
  const css = assets.css.map((href) => `    <link rel="stylesheet" href="${href}" />`).join("\n");
  const js = assets.js.map((src) => `    <script type="module" src="${src}"></script>`).join("\n");
  return `<!doctype html>
<html lang="en" style="color-scheme: dark; background-color: #000000">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${renderHeadTags(tags)}
    <link rel="icon" href="/favicon.ico" />
${css}
  </head>
  <body class="bg-term-bg text-term-fg antialiased">
    ${body}
${js}
  </body>
</html>
`;
}
```

Create `src/services/render.tsx`:

```tsx
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { services as servicesContent, type ServicesContent } from "../lib/content";
import type { PageMeta } from "../lib/head-tags";
import { SERVICES_PATH, servicePath } from "../lib/service-paths";
import { siteMetadata } from "../lib/site-metadata";
import type { ContactFormProps } from "./ContactForm";
import { renderDocument, type Assets } from "./document";
import { overviewPageMeta, servicePageMeta } from "./meta";
import ServicePage from "./ServicePage";
import ServicesOverview from "./ServicesOverview";

export type RenderedPage = { path: string; html: string };

export type RenderOptions = {
  assets: Assets;
  turnstileSiteKey?: string | null;
  analyticsToken?: string;
  content?: ServicesContent;
};

export function renderServicePages({
  assets,
  turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || null,
  analyticsToken = import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN?.trim() || undefined,
  content = servicesContent,
}: RenderOptions): RenderedPage[] {
  const form = (selected?: string): ContactFormProps => ({
    services: content.services.map((service) => service.name),
    ...(selected ? { selected } : {}),
    turnstileSiteKey,
    contactEmail: siteMetadata.contactEmail,
  });

  const page = (path: string, meta: PageMeta, element: ReactElement): RenderedPage => ({
    path,
    html: renderDocument({ meta, body: renderToString(element), assets, analyticsToken }),
  });

  return [
    page(SERVICES_PATH, overviewPageMeta(content), <ServicesOverview content={content} form={form()} />),
    ...content.services.map((service) =>
      page(
        servicePath(service.slug),
        servicePageMeta(service),
        <ServicePage service={service} process={content.process} form={form(service.name)} />,
      ),
    ),
  ];
}
```

- [ ] **Step 8: Run to verify pass**

Run: `npx vitest run src/services/render.test.ts`
Expected: PASS (6 tests). If the FAQ assertion fails on escaping, check how React escaped the apostrophe in the HTML and match that. Don't remove the assertion.

- [ ] **Step 9: Lint, typecheck, full tests, commit**

Run: `npm run lint && npm run typecheck && npm test`

```bash
git add src/services
git commit -m "feat(services): service and overview pages rendered to static HTML

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Build and dev wiring

**Files:**
- Create: `src/services/island.tsx`, `src/lib/service-pages-plugin.ts`, `scripts/prerender-services.mjs`
- Modify: `vite.config.ts`, `package.json`, `eslint.config.js`, `vitest.config.ts`
- Delete: `public/sitemap.xml`

**Interfaces:**
- Consumes: `renderServicePages` (Task 6); `FORM_ROOT_ID`, `FORM_PROPS_ID`, `ContactForm` (Task 5); `buildSitemap`, `sitePaths` (Task 3); `parseServicesYaml`, `parseExperienceYaml` (Task 1).
- Produces: `npm run build` → `dist/services/index.html`, `dist/services/<slug>/index.html` ×4, `dist/sitemap.xml`. `npm run dev` serves the same pages at the same URLs.

This task is wiring; its tests are the build and HTTP checks below.

- [ ] **Step 1: Island entry**

Create `src/services/island.tsx`:

```tsx
import "../globals.css";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import ContactForm, { FORM_PROPS_ID, FORM_ROOT_ID, type ContactFormProps } from "./ContactForm";

const root = document.getElementById(FORM_ROOT_ID);
const propsJson = document.getElementById(FORM_PROPS_ID)?.textContent;

if (root && propsJson) {
  const props = JSON.parse(propsJson) as ContactFormProps;
  hydrateRoot(
    root,
    <StrictMode>
      <ContactForm {...props} />
    </StrictMode>,
  );
}
```

- [ ] **Step 2: Vite plugin (dev pages + sitemap)**

Create `src/lib/service-pages-plugin.ts`:

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import type { renderServicePages } from "../services/render";
import { parseExperienceYaml, parseServicesYaml } from "./content/parse";
import { sitePaths } from "./service-paths";
import { buildSitemap } from "./sitemap";
import { siteMetadata } from "./site-metadata";

const ISLAND_ENTRY = "/src/services/island.tsx";

function readServiceSlugs(root: string): string[] {
  const read = (name: string) => readFileSync(path.join(root, "content", `${name}.yaml`), "utf8");
  const plugins = parseExperienceYaml(read("experience")).flatMap((entry) => entry.plugins ?? []);
  return parseServicesYaml(read("services"), plugins).services.map((service) => service.slug);
}

/** Serves the pre-rendered service pages in dev and emits sitemap.xml in the client build. */
export function servicePagesPlugin(): Plugin {
  let root = process.cwd();
  let isSsrBuild = false;

  return {
    name: "service-pages",
    configResolved(config) {
      root = config.root;
      isSsrBuild = Boolean(config.build.ssr);
    },
    generateBundle() {
      if (isSsrBuild) return;
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: buildSitemap(siteMetadata.siteUrl, sitePaths(readServiceSlugs(root))),
      });
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/services")) return next();
        const wanted = url.endsWith("/") ? url : `${url}/`;
        try {
          const mod = (await server.ssrLoadModule("/src/services/render.tsx")) as {
            renderServicePages: typeof renderServicePages;
          };
          const page = mod
            .renderServicePages({ assets: { css: [], js: [ISLAND_ENTRY] } })
            .find((candidate) => candidate.path === wanted);
          if (!page) return next();
          const html = await server.transformIndexHtml(url, page.html);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        } catch (error) {
          server.ssrFixStacktrace(error as Error);
          next(error);
        }
      });
    },
  };
}
```

- [ ] **Step 3: Register the plugin, island input and manifest**

In `vite.config.ts`, import `servicePagesPlugin` from `./src/lib/service-pages-plugin` and change `defineConfig`:

```ts
export default defineConfig(({ mode }) => ({
  plugins: [react(), siteMetaPlugin(mode), servicePagesPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        notFound: path.resolve(__dirname, '404.html'),
        servicesIsland: path.resolve(__dirname, 'src/services/island.tsx'),
      },
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'react-vendor';
          }
        },
      },
    },
  },
}));
```

- [ ] **Step 4: Prerender script**

Create `scripts/prerender-services.mjs`:

```js
// Renders the service pages to static HTML after `vite build` and the SSR build.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const ISLAND = "src/services/island.tsx";

const manifest = JSON.parse(await readFile(path.join(dist, ".vite/manifest.json"), "utf8"));

/** CSS for a manifest entry and every chunk it imports. */
function collectCss(key, seen = new Set()) {
  if (seen.has(key)) return [];
  seen.add(key);
  const chunk = manifest[key];
  if (!chunk) throw new Error(`prerender: ${key} is missing from the Vite manifest`);
  return [...(chunk.css ?? []), ...(chunk.imports ?? []).flatMap((dep) => collectCss(dep, seen))];
}

const island = manifest[ISLAND];
if (!island) throw new Error(`prerender: ${ISLAND} is missing from the Vite manifest`);
const assets = {
  css: [...new Set(collectCss(ISLAND))].map((file) => `/${file}`),
  js: [`/${island.file}`],
};

const { renderServicePages } = await import(pathToFileURL(path.join(root, "dist-ssr/render.js")).href);
const pages = renderServicePages({ assets });

for (const page of pages) {
  const file = path.join(dist, page.path, "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, page.html);
}

// The manifest is only needed here; don't deploy it.
await rm(path.join(dist, ".vite"), { recursive: true, force: true });

console.log(`prerendered ${pages.length} service pages`);
```

- [ ] **Step 5: Scripts and ignores**

In `package.json`, change `build`:

```json
    "build": "vite build && vite build --ssr src/services/render.tsx --outDir dist-ssr && node scripts/prerender-services.mjs",
```

In `eslint.config.js`, add `"dist-ssr/**",` to `ignores`. In `vitest.config.ts`, add `"dist-ssr"` to `exclude`. (`/dist-ssr` is already in `.gitignore`.)

Delete the static sitemap: `git rm public/sitemap.xml`

- [ ] **Step 6: Build and check the output**

Run: `npm run build`
Expected: ends with `prerendered 5 service pages`.

Run:
```bash
find dist/services -name index.html | sort
grep -c "<loc>" dist/sitemap.xml
ls dist/.vite 2>&1 | head -1
grep -o '<h1[^>]*>.*</h1>' dist/services/canva-apps/index.html
grep -o 'href="/assets/[^"]*\.css"' dist/services/canva-apps/index.html
grep -o 'src="/assets/servicesIsland-[^"]*\.js"' dist/services/canva-apps/index.html
```
Expected: 5 `index.html` files; `6` locs; `ls: … No such file or directory`; the H1 contains "Canva app development"; one CSS href; one island script.

If the SSR build fails because `rollupOptions.input` overrides the `--ssr` entry, add `...(isSsrBuild ? {} : { input: {…} })` keyed on the `isSsrBuild` argument of `defineConfig(({ mode, isSsrBuild }) => …)`, rebuild, and note the change in the commit body.

- [ ] **Step 7: Check in a browser-like server**

Run: `npx wrangler pages dev dist --port 8788` in the background, then:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/services/
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:8788/services/canva-apps
curl -s http://localhost:8788/services/office-add-ins/ | grep -c "Microsoft Office add-in development"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/services/nope/
```
Expected: `200`; a 308 to `/services/canva-apps/`; `1` or more; `404`. Stop the server.

- [ ] **Step 8: Check dev mode and hydration**

Run `npm run dev` in the background and open `http://localhost:5173/services/adobe-uxp-plugins/` in Chrome (via the browser tools available in the session):
- The page renders with the term palette and no console errors, in particular **no hydration mismatch warning**.
- "Send" becomes enabled after load.
- With `.dev.vars` missing, submitting returns an error message in the status line and the typed text is kept.
- At 320px width there is no horizontal scroll.

Stop the dev server.

- [ ] **Step 9: Lint, typecheck, tests, commit**

Run: `npm run lint && npm run typecheck && npm test`

```bash
git add src/services/island.tsx src/lib/service-pages-plugin.ts scripts/prerender-services.mjs vite.config.ts package.json eslint.config.js vitest.config.ts
git commit -m "build(services): pre-render service pages and generate the sitemap

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Link the pages from the homepage

**Files:**
- Create: `src/lib/link-target.ts`
- Modify: `src/desktop/DesktopIcons.tsx`, `src/desktop/Panel.tsx`, `src/desktop/Desktop.tsx`, `src/desktop/icons.tsx`, `src/terminal/Terminal.tsx`, `src/terminal/types.ts`, `src/terminal/commands.ts`, `index.html`, `src/lib/site-metadata.ts`
- Test: `src/lib/link-target.test.ts`, `src/terminal/shell.test.ts`

**Interfaces:**
- Consumes: `services`, `Service` (Task 1); `SERVICES_PATH`, `servicePath` (Task 3).
- Produces: `linkTargetProps(href: string): { target?: "_blank"; rel?: string }`; terminal `Content.services: readonly Service[]`; terminal command `services` and file `services.txt`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/link-target.test.ts`:

```ts
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
```

In `src/terminal/shell.test.ts`, add `services` to the `../lib/data` import and to `ctx.content` (`content: { projects, experience: experienceData, skills, services: services.services, site: siteMetadata }`), then add next to the `contact` test:

```ts
  it("services links every service page and the overview", () => {
    const links = hrefs(run("services", ctx).lines);
    expect(links).toEqual([
      ...services.services.map((s) => `/services/${s.slug}/`),
      "/services/",
    ]);
  });

  it("cat services.txt prints the services list", () => {
    expect(output("cat services.txt")).toBe(output("services"));
  });
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/lib/link-target.test.ts src/terminal/shell.test.ts`
Expected: FAIL, `./link-target` not found, and type errors / unknown command for `services`.

- [ ] **Step 3: Implement `linkTargetProps` and use it everywhere**

Create `src/lib/link-target.ts`:

```ts
/** New tab for off-site http(s) links; same tab for same-site paths and mailto:. */
export function linkTargetProps(href: string): { target?: "_blank"; rel?: string } {
  return /^https?:\/\//i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}
```

In `src/desktop/DesktopIcons.tsx` replace

```tsx
              {...(!item.href.startsWith("mailto:") && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
```
with `{...linkTargetProps(item.href)}` and add `import { linkTargetProps } from "../lib/link-target";`. Make the same replacement in `src/desktop/Panel.tsx`.

In `src/terminal/Terminal.tsx` `SegmentView`, replace

```tsx
    const external = !segment.href.startsWith("mailto:");
    return (
      <a
        href={segment.href}
        className={`text-term-link ${interactiveClass}`}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
```
with
```tsx
    return (
      <a
        href={segment.href}
        className={`text-term-link ${interactiveClass}`}
        {...linkTargetProps(segment.href)}
      >
```
and import `linkTargetProps`.

- [ ] **Step 4: Terminal `services` command**

In `src/terminal/types.ts`, import `Service` alongside the other types from `../lib/data` and add `services: readonly Service[];` to `Content`.

In `src/terminal/Terminal.tsx`, import `services` from `../lib/data` and change the content line to:

```tsx
const content = { projects, experience: experienceData, skills, services: services.services, site: siteMetadata };
```

In `src/terminal/commands.ts`, import `{ SERVICES_PATH, servicePath } from "../lib/service-paths"` and add after `contact`:

```ts
const services: Command = {
  name: "services",
  summary: "what I can build for you",
  run: (_args, { content }) => {
    const width = Math.max(...content.services.map((s) => s.name.length)) + 2;
    return out([
      heading("Services"),
      ...content.services.map((s) =>
        hanging(
          2 + width,
          "  ",
          link(s.name, servicePath(s.slug)),
          " ".repeat(width - s.name.length),
          tone(s.summary, "muted"),
        ),
      ),
      blank,
      line("  ", link("All services and a contact form", SERVICES_PATH)),
    ]);
  },
};
```

Add `"services.txt": services,` to `files` after `"skills.txt"`, and add `services` to `registry` after `contact`.

- [ ] **Step 5: Desktop icon and menu entry**

Append to `src/desktop/icons.tsx`:

```tsx
export function BriefcaseIcon() {
  return (
    <Pixels>
      {rects([
        [11, 5, 10, 2, "#1f1f1f"],
        [11, 7, 2, 4, "#1f1f1f"],
        [19, 7, 2, 4, "#1f1f1f"],
        [3, 10, 26, 18, "#1f1f1f"],
        [4, 11, 24, 16, "#8b5a2b"],
        [4, 11, 24, 2, "#a8743f"],
        [4, 18, 24, 1, "#5c3a1a"],
        [14, 16, 4, 5, "#e0c060"],
        [15, 17, 2, 3, "#8b6b1a"],
      ])}
    </Pixels>
  );
}
```

In `src/desktop/Desktop.tsx`, import `BriefcaseIcon` and `SERVICES_PATH`, and add after the Terminal item:

```tsx
      { label: "Services", icon: <BriefcaseIcon />, href: SERVICES_PATH },
```

- [ ] **Step 6: Homepage noscript and description**

In `index.html`, replace the `<noscript>` paragraph `primor.me is being rebuilt. The terminal needs JavaScript; in the meantime:` with:

```html
        <p>I build plugins and integrations for Adobe, Canva, Microsoft Office and Jira. The desktop needs JavaScript; everything else works without it:</p>
```

and add as the first `<li>`:

```html
          <li><a href="/services/" style="color: #00cdcd">Services and contact form</a></li>
```

In `src/lib/site-metadata.ts`, set:

```ts
  description:
    "Software engineer in Portugal building plugins and integrations for Adobe, Canva, Microsoft Office and Jira. Available for freelance projects.",
```

(142 characters.)

- [ ] **Step 7: Run to verify pass**

Run: `npm test`
Expected: all pass, including the generic `help` test now listing `services`.

- [ ] **Step 8: Check in the browser**

Run `npm run dev`, open `http://localhost:5173/`:
- The Services icon appears on the desktop and in Applications. Clicking it opens `/services/` in the **same tab**.
- `services` in the terminal prints four links plus the overview link, and clicking one navigates in the same tab.
- GitHub/LinkedIn/CV still open in a new tab.

- [ ] **Step 9: Lint, typecheck, commit**

Run: `npm run lint && npm run typecheck`

```bash
git add src index.html
git commit -m "feat(site): link the service pages from the desktop and terminal

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Lighthouse gates and final verification

**Files:**
- Modify: `lighthouserc.json`

- [ ] **Step 1: Add the service pages to Lighthouse CI**

Replace `lighthouserc.json` `collect.url` and `assert.assertMatrix`. The homepage pattern is anchored to `localhost/index.html` so it no longer also matches the service pages:

```json
      "url": [
        "http://localhost/index.html",
        "http://localhost/404.html",
        "http://localhost/services/index.html",
        "http://localhost/services/adobe-uxp-plugins/index.html"
      ],
```

```json
        {
          "matchingUrlPattern": "localhost/index\\.html$",
          "assertions": {
            "categories:performance": ["error", { "minScore": 0.85, "aggregationMethod": "median" }],
            "categories:accessibility": ["warn", { "minScore": 0.9 }],
            "categories:best-practices": ["warn", { "minScore": 0.9 }],
            "categories:seo": ["error", { "minScore": 0.95 }]
          }
        },
        {
          "matchingUrlPattern": "/services/.*index\\.html$",
          "assertions": {
            "categories:performance": ["error", { "minScore": 0.9, "aggregationMethod": "median" }],
            "categories:accessibility": ["error", { "minScore": 0.95 }],
            "categories:best-practices": ["warn", { "minScore": 0.9 }],
            "categories:seo": ["error", { "minScore": 0.95 }]
          }
        },
```

Keep the existing 404 entry unchanged.

- [ ] **Step 2: Run Lighthouse locally**

Run: `npm run lighthouse`
Expected: all assertions pass. If performance on a service page is under 0.9, look at what the report blames first (render-blocking CSS, island size). Don't lower the threshold.

- [ ] **Step 3: No-JS check**

Run: `npm run build`, then serve with `npx wrangler pages dev dist --port 8788`. In Chrome with JavaScript disabled, open `/services/canva-apps/`: all content is present, the `<noscript>` email note shows, and Send is disabled. Stop the server.

- [ ] **Step 4: Full suite and commit**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all pass.

```bash
git add lighthouserc.json
git commit -m "ci(lighthouse): gate the service pages on SEO, a11y and performance

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Hand over**

Report to Pedro:
- the five URLs and the dev server link;
- that `content/services.yaml` is draft copy for him to rewrite in his own voice before merge;
- the post-deploy follow-ups: Google Rich Results Test on one service page, and submitting `https://primor.me/sitemap.xml` in Search Console.

Do not open a PR or merge until Pedro asks.
