export const siteMetadata = {
  siteUrl: "https://primor.me",
  title: "Pedro Primor — Software Engineer",
  description:
    "Software Engineer at PageProof in Portugal. Cross-platform integrations for Canva, Office, Adobe & Final Cut Pro. React, TypeScript, Swift.",
  author: "Pedro Primor",
  ogImagePath: "/images/og.png",
  ogImageAlt: "Pedro Primor",
  locale: "en",
  jobTitle: "Software Engineer",
  worksFor: {
    name: "PageProof",
    url: "https://pageproof.com",
  },
  sameAs: [
    "https://github.com/pprimor",
    "https://www.linkedin.com/in/primor/",
  ],
} as const;

export function absoluteUrl(path: string): string {
  return `${siteMetadata.siteUrl}${path}`;
}
