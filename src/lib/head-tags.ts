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
