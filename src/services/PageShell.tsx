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
