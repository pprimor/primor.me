# Service pages — design

Date: 2026-10-11
Branch: off `main`

## Goal

People searching for someone to build a plugin or integration for a specific
platform ("Adobe UXP plugin developer", "Canva app developer", "Jira Forge app
developer", "Office add-in developer") should find primor.me, see shipped proof,
and be able to start a conversation without leaving the page.

Today the homepage is an interactive X11 desktop/terminal. Its content only
appears after typed commands, so search engines and link-preview bots see almost
nothing. This design adds static, crawlable service pages alongside it. The
terminal homepage stays as it is.

### Success criteria

- Five pages exist as complete server-rendered HTML in `dist/`: content, title,
  meta description, canonical, OG tags and JSON-LD are all present with
  JavaScript disabled.
- Lighthouse CI: SEO ≥ 0.95 and performance ≥ 0.9 on `/services/` and on one
  service page.
- Every page is in `sitemap.xml` and is linked from the homepage with a plain
  `<a href>`.
- A visitor can send an inquiry from any page; it arrives by email tagged with
  the service.

### Decisions already made

| Decision | Choice |
|---|---|
| Services with their own page | Adobe UXP plugins, Canva Apps, Atlassian Forge / Jira, Office add-ins |
| Niche services | Mentioned on `/services/` only: QuarkXPress XTensions, Final Cut Pro extensions, DAM delivery (Canto, Bynder), OAuth 2.0 / OIDC |
| PageProof work | Named and linked as case studies |
| Visual style | Plain single-column document with X11/xterm accents |
| Call to action | Contact form on the page, posting to the existing `/api/contact` |
| Rendering | Build-time pre-render with React; only the form hydrates |

### Out of scope

- Final sales copy. The implementation drafts it from `experience.yaml`; Pedro
  edits it in his own voice before merge.
- Pages for the niche services, a blog, pricing.
- Any change to the terminal or desktop beyond adding links.

## Pages and URLs

| URL | Purpose |
|---|---|
| `/services/` | Overview: one-line pitch, a card per core service, an "Also" section for niche services, form |
| `/services/adobe-uxp-plugins/` | Adobe UXP plugin development (Photoshop, InDesign) |
| `/services/canva-apps/` | Canva Apps SDK development |
| `/services/atlassian-forge-apps/` | Atlassian Forge / Jira app development |
| `/services/office-add-ins/` | Microsoft Office add-in development (Office.js) |

Each URL is a directory with `index.html`, so it is served with a trailing slash
on Cloudflare Pages without redirects.

### Service page structure

1. Breadcrumb header: `primor.me / services / <slug>`, linking back up.
2. H1 phrased the way people search (e.g. "Adobe UXP plugin development").
3. Pitch: two sentences.
4. **Shipped**: PageProof work for this platform, with name, one-line
   description and store/listing link, taken from `experience.yaml` plugins.
5. **What I handle**: 4–6 concrete items (e.g. manifest and permissions, Adobe
   Exchange submission and review, auth, embedded React UI).
6. **How it works**: short process (scoping call → fixed quote → build → store
   submission → handover).
7. **FAQ**: 3–5 question/answer pairs.
8. Contact form, with this service pre-selected.
9. Footer: email, GitHub, LinkedIn, CV, link to the desktop homepage.

The overview page has the same header, footer and form. Its body is the pitch, a
card per core service (title, one line, link) and the "Also" list.

## Content

New file `content/services.yaml`, validated by a zod schema in
`src/lib/content/schemas.ts` and parsed in `src/lib/content/parse.ts` in the same
style as the existing content files.

```yaml
overview:
  title: Plugin & integration development   # H1
  metaTitle: Plugin & Integration Developer · Pedro Primor
  metaDescription: ...
  pitch: ...
  also:
    - name: QuarkXPress XTensions
      description: ...
    # Final Cut Pro extensions, DAM delivery (Canto, Bynder), OAuth 2.0 / OIDC
services:
  - slug: adobe-uxp-plugins
    name: Adobe UXP plugins                 # card title, form option label
    title: Adobe UXP plugin development     # H1
    metaTitle: Adobe UXP Plugin Developer · Pedro Primor
    metaDescription: ...
    summary: ...                            # one line, used on overview card
    pitch: ...
    shipped: [PageProof for Adobe Photoshop, PageProof for Adobe InDesign]
    handles: [...]
    process: [...]
    faq:
      - q: ...
        a: ...
```

Rules enforced at parse time. Each rule fails the build with a message that
names the offending entry:

- `slug` is unique, lowercase kebab-case.
- `metaDescription` is 50–160 characters; `metaTitle` is at most 60.
- Every `shipped` entry matches a `plugins[].name` in `experience.yaml`. The
  rendered entry takes its URL and description from there, so proof can't drift
  from the experience record.
- `faq` has at least one entry.

## Build

### Rendering

A new Vite plugin, `servicePagesPlugin`, in `src/lib/service-pages-plugin.ts`
(next to `site-metadata.ts`, which `vite.config.ts` already imports), follows the shape of the existing `siteMetaPlugin`:

- **Build:** for each page, render the page component with
  `react-dom/server`'s `renderToString`, then wrap it in an HTML document
  containing the head tags (below), the compiled Tailwind CSS, and the form
  island script. Emit it as `services/<slug>/index.html`.
- **Dev:** middleware serves the same rendered HTML at the same URLs, so
  `npm run dev` shows the real pages.

Page components live in `src/services/` (`ServicePage.tsx`,
`ServicesOverview.tsx`, `PageShell.tsx` for header/footer, `ContactForm.tsx`).
They are pure functions of the parsed content and use no browser APIs at render
time.

### Shared head tags

The meta-tag code in `vite.config.ts` (`siteMetaPlugin`) moves into a pure
helper, `buildHeadTags(page)`, in `src/lib/`. It returns title, description,
author, canonical, OG/Twitter tags and JSON-LD for a page descriptor. The
homepage and the service pages both use it, so there is one implementation of
the tag set. The homepage's existing output must not change, except for the
updated description (see Linking).

Structured data per page:

- Service pages: `Service` (name, description, `serviceType`, `areaServed`:
  worldwide, `provider` → the `Person` by `@id`), `FAQPage` from the FAQ, and
  `BreadcrumbList`.
- Overview: `ItemList` of the four services, plus `BreadcrumbList`.
- The `Person` node gets a stable `@id` (`https://primor.me/#person`) so other
  pages can reference it.

### Sitemap

`public/sitemap.xml` is removed. The build generates `sitemap.xml` from `/` plus
the service list, so a new service can't be left out of it.

## Linking from the homepage

- Add a **Services** entry to the desktop icons and the panel menu, as a plain
  `<a href="/services/">`.
- Fix `DesktopIcons.tsx` and `Panel.tsx`: they currently put `target="_blank"`
  on every non-`mailto:` link. Same-origin paths open in the same tab.
- Add a `services` terminal command that lists the four pages as links, and
  mention it in `help`.
- Replace the stale "primor.me is being rebuilt" `<noscript>` text in
  `index.html` with a short description and a link to `/services/`.
- Update `siteMetadata.description` to mention plugin and integration services.

## Contact form

`ContactForm.tsx` is rendered to static HTML at build time and hydrated by a
small separate entry (`src/services/form-island.tsx`) loaded only on service
pages.

- Fields: email, message, service (`<select>`: the four services plus "Something
  else"; pre-selected on service pages).
- Hidden honeypot input named `company`. That is the name the handler already
  rejects on, so no real field may use it.
- Turnstile widget, using the existing `VITE_TURNSTILE_SITE_KEY`, loaded lazily
  when the form is first focused or scrolled into view, to keep it off the
  critical path.
- States: idle → sending (button disabled) → sent (confirmation replaces the
  form) or error (handler's error message shown, inputs kept).
- Without JavaScript, the static form shows a note with the email address and a
  `mailto:` link instead of a submit that goes nowhere.

### Endpoint change

`functions/lib/contact/handler.ts` accepts an optional `service` string:
trimmed, at most 64 characters, otherwise ignored. When present, it is added to
the email subject (`New inquiry: Adobe UXP plugins`) and shown in the rendered
email. No other behaviour changes. Covered by new cases in the existing handler
tests.

## Accessibility and styling

- Uses the existing Tailwind config and xterm palette tokens; mono headings,
  readable body text, single column with max width ~42rem, 16px side gutter on
  mobile, no horizontal scroll.
- Semantic landmarks (`header`, `main`, `footer`, `nav` with `aria-label` for the
  breadcrumb), one H1 per page, labelled form inputs, status messages in an
  `aria-live` region, visible focus styles matching the desktop's dotted outline.
- Colour contrast meets WCAG AA in both the existing light and dark tokens.

## Testing

Written test-first (vitest):

- Services schema: a valid file parses; a duplicate slug, an over-long
  `metaDescription` and an unknown `shipped` plugin each fail with a message
  that names the problem.
- `buildHeadTags`: homepage output matches the current tags; a service page gets
  the correct title, canonical, and `Service`/`FAQPage`/`BreadcrumbList` JSON-LD
  referencing the `Person` `@id`.
- Sitemap generation lists `/` and all five service URLs.
- Page render: `renderToString` of a service page contains the H1, every shipped
  link and the form.
- `ContactForm`: sending/sent/error states with mocked `fetch`; payload contains
  `service` and `turnstileToken` and an empty `company`.
- Contact handler: `service` included in the subject when present, ignored when
  over 64 chars.
- `DesktopIcons`/`Panel`: internal links have no `target`.
- `services` terminal command output.

Build checks:

- `lighthouserc.json` adds `services/index.html` and
  `services/adobe-uxp-plugins/index.html` with SEO ≥ 0.95 (error) and
  performance ≥ 0.9 (error).
- Manual: view the built pages with JS disabled; validate JSON-LD with Google's
  Rich Results Test after deploy; submit the sitemap in Search Console.

## Follow-ups (not part of this work)

- Pedro rewrites the drafted copy in his own voice before merge.
- Submit the sitemap in Google Search Console after deploy.
- Promote a niche service to its own page if inquiries come in for it.
