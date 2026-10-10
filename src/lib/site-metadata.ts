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
    "Software engineer in Portugal building plugins and integrations for Adobe, Canva, Microsoft Office and Jira. Available for freelance projects.",
  author: "Pedro Primor",
  ogImagePath: "/images/og.png",
  ogImageAlt: "An X11 desktop with an xterm open on primor.me, showing whoami: Pedro Primor, software engineer building integrations for creative teams",
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
