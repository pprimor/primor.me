const profiles = {
  github: "https://github.com/pprimor",
  linkedin: "https://www.linkedin.com/in/primor/",
} as const;

export const siteMetadata = {
  siteUrl: "https://primor.me",
  title: "Pedro Primor — Software Engineer",
  contactEmail: "hello@primor.me",
  cvUrl: "https://cv.primor.me/CV.pdf",
  location: "Portugal",
  description:
    "Software Engineer at PageProof in Portugal. Cross-platform integrations for Canva, Office, Adobe & Final Cut Pro. Open to select freelance projects.",
  author: "Pedro Primor",
  ogImagePath: "/images/og.png",
  ogImageAlt: "Pedro Primor",
  locale: "en",
  jobTitle: "Software Engineer",
  worksFor: {
    name: "PageProof",
    url: "https://pageproof.com",
  },
  profiles,
  sameAs: [profiles.github, profiles.linkedin],
} as const;

export function absoluteUrl(path: string): string {
  return `${siteMetadata.siteUrl}${path}`;
}
