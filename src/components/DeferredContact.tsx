import { lazy, Suspense } from "react";
import { useInView } from "react-intersection-observer";

const Contact = lazy(() => import("./Contact"));

function ContactFallback() {
  return (
    <section
      id="contact"
      className="mb-28 max-w-[40rem] w-full scroll-mt-28 sm:mb-40"
      aria-busy="true"
      aria-label="Contact form loading"
    >
      <div className="mx-auto h-64 max-w-md animate-pulse rounded-lg bg-gray-200/60 dark:bg-white/5" />
    </section>
  );
}

export default function DeferredContact() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "400px 0px",
  });

  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={<ContactFallback />}>
          <Contact />
        </Suspense>
      ) : (
        <ContactFallback />
      )}
    </div>
  );
}
