export const SERVICES_PATH = "/services/";

export function servicePath(slug: string): string {
  return `${SERVICES_PATH}${slug}/`;
}

/** Every indexable page on the site, homepage first. */
export function sitePaths(slugs: readonly string[]): string[] {
  return ["/", SERVICES_PATH, ...slugs.map(servicePath)];
}
