import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { services as servicesContent, type ServicesContent } from "../lib/content";
import type { PageMeta } from "../lib/head-tags";
import { SERVICES_PATH, servicePath } from "../lib/service-paths";
import { siteMetadata } from "../lib/site-metadata";
import type { ContactFormProps } from "./ContactForm";
import { renderDocument, type Assets } from "./document";
import { overviewPageMeta, servicePageMeta } from "./meta";
import ServicePage from "./ServicePage";
import ServicesOverview from "./ServicesOverview";

export type RenderedPage = { path: string; html: string };

export type RenderOptions = {
  assets: Assets;
  turnstileSiteKey?: string | null;
  analyticsToken?: string;
  content?: ServicesContent;
};

export function renderServicePages({
  assets,
  turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || null,
  analyticsToken = import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN?.trim() || undefined,
  content = servicesContent,
}: RenderOptions): RenderedPage[] {
  const form = (selected?: string): ContactFormProps => ({
    services: content.services.map((service) => service.name),
    ...(selected ? { selected } : {}),
    turnstileSiteKey,
    contactEmail: siteMetadata.contactEmail,
  });

  const page = (path: string, meta: PageMeta, element: ReactElement): RenderedPage => ({
    path,
    html: renderDocument({ meta, body: renderToString(element), assets, analyticsToken }),
  });

  return [
    page(SERVICES_PATH, overviewPageMeta(content), <ServicesOverview content={content} form={form()} />),
    ...content.services.map((service) =>
      page(
        servicePath(service.slug),
        servicePageMeta(service),
        <ServicePage service={service} process={content.process} form={form(service.name)} />,
      ),
    ),
  ];
}
