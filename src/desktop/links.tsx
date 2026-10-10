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
