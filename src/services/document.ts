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
