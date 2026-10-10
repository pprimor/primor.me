import type { Service } from "../lib/content";
import { servicePath } from "../lib/service-paths";
import type { ContactFormProps } from "./ContactForm";
import ContactSection from "./ContactSection";
import PageShell from "./PageShell";
import { H1, H2, linkClass } from "./ui";

type Props = { service: Service; process: readonly string[]; form: ContactFormProps };

export default function ServicePage({ service, process, form }: Props) {
  return (
    <PageShell path={servicePath(service.slug)}>
      <H1>{service.title}</H1>
      <p className="mt-4 text-lg">{service.pitch}</p>

      <H2>Shipped</H2>
      <ul className="mt-3 space-y-3">
        {service.shipped.map((plugin) => (
          <li key={plugin.url}>
            <a href={plugin.url} className={`${linkClass} font-mono`}>
              {plugin.name}
            </a>
            {plugin.description && <p className="text-term-muted">{plugin.description}</p>}
          </li>
        ))}
      </ul>

      <H2>What I handle</H2>
      <ul className="mt-3 list-['▸_'] space-y-1 pl-5 marker:text-term-accent">
        {service.handles.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <H2>How it works</H2>
      <ol className="mt-3 list-decimal space-y-1 pl-5 marker:text-term-muted">
        {process.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <H2>Questions</H2>
      <dl className="mt-3 space-y-5">
        {service.faq.map(({ q, a }) => (
          <div key={q}>
            <dt className="font-bold text-term-heading">{q}</dt>
            <dd className="mt-1">{a}</dd>
          </div>
        ))}
      </dl>

      <ContactSection form={form} />
    </PageShell>
  );
}
