/** New tab for off-site http(s) links; same tab for same-site paths and mailto:. */
export function linkTargetProps(href: string): { target?: "_blank"; rel?: string } {
  return /^https?:\/\//i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}
