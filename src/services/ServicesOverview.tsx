import type { ServicesContent } from "../lib/content";
import { SERVICES_PATH, servicePath } from "../lib/service-paths";
import type { ContactFormProps } from "./ContactForm";
import ContactSection from "./ContactSection";
import PageShell from "./PageShell";
import { H1, H2, linkClass } from "./ui";

type Props = { content: ServicesContent; form: ContactFormProps };

export default function ServicesOverview({ content, form }: Props) {
  const { overview, process, services } = content;
  return (
    <PageShell path={SERVICES_PATH}>
      <H1>{overview.title}</H1>
      <p className="mt-4 text-lg">{overview.pitch}</p>

      <H2>What I build</H2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.slug} className="border border-term-muted p-4">
            <a href={servicePath(service.slug)} className={`${linkClass} font-mono font-bold`}>
              {service.name}
            </a>
            <p className="mt-2 text-sm">{service.summary}</p>
          </li>
        ))}
      </ul>

      <H2>Also</H2>
      <dl className="mt-3 space-y-3">
        {overview.also.map((item) => (
          <div key={item.name}>
            <dt className="font-mono font-bold text-term-heading">{item.name}</dt>
            <dd>{item.description}</dd>
          </div>
        ))}
      </dl>

      <H2>How it works</H2>
      <ol className="mt-3 list-decimal space-y-1 pl-5 marker:text-term-muted">
        {process.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <ContactSection form={form} />
    </PageShell>
  );
}
