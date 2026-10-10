import { safeJson } from "../lib/head-tags";
import ContactForm, { FORM_PROPS_ID, FORM_ROOT_ID, type ContactFormProps } from "./ContactForm";
import { H2 } from "./ui";

/** The form, plus the exact props the island hydrates it with. */
export default function ContactSection({ form }: { form: ContactFormProps }) {
  return (
    <section aria-labelledby="contact-heading" className="mt-16 border-t border-term-muted pt-2">
      <H2 id="contact-heading">Start a project</H2>
      <p className="mt-3">Tell me what you want to build. I&apos;ll reply by email.</p>
      <div id={FORM_ROOT_ID} className="mt-6">
        <ContactForm {...form} />
      </div>
      <script
        type="application/json"
        id={FORM_PROPS_ID}
        dangerouslySetInnerHTML={{ __html: safeJson(form) }}
      />
    </section>
  );
}
