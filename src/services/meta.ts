import type { Service, ServicesContent } from "../lib/content";
import { PERSON_ID, personNode, type PageMeta } from "../lib/head-tags";
import { SERVICES_PATH, servicePath } from "../lib/service-paths";
import { absoluteUrl } from "../lib/site-metadata";

type Crumb = { name: string; path: string };

const overviewCrumbs: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "Services", path: SERVICES_PATH },
];

function breadcrumbNode(crumbs: readonly Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function servicePageMeta(service: Service): PageMeta {
  const path = servicePath(service.slug);
  return {
    path,
    title: service.metaTitle,
    description: service.metaDescription,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        personNode(),
        {
          "@type": "Service",
          name: service.title,
          serviceType: service.name,
          description: service.metaDescription,
          url: absoluteUrl(path),
          areaServed: { "@type": "Place", name: "Worldwide" },
          provider: { "@id": PERSON_ID },
        },
        {
          "@type": "FAQPage",
          mainEntity: service.faq.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        },
        breadcrumbNode([...overviewCrumbs, { name: service.name, path }]),
      ],
    },
  };
}

export function overviewPageMeta(content: ServicesContent): PageMeta {
  return {
    path: SERVICES_PATH,
    title: content.overview.metaTitle,
    description: content.overview.metaDescription,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        personNode(),
        {
          "@type": "ItemList",
          itemListElement: content.services.map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: service.name,
            url: absoluteUrl(servicePath(service.slug)),
          })),
        },
        breadcrumbNode(overviewCrumbs),
      ],
    },
  };
}
