import { lazy, Suspense, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";

type DeferredSectionProps = {
  fallback: ReactNode;
  rootMargin?: string;
  children: ReactNode;
};

function DeferredSection({
  fallback,
  rootMargin = "300px 0px",
  children,
}: DeferredSectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin,
  });

  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

const LazyExperience = lazy(() => import("./Experience"));
const LazyProjects = lazy(() => import("./Projects"));
const LazySkills = lazy(() => import("./Skills"));

export function DeferredExperience() {
  return (
    <DeferredSection
      fallback={
        <section
          id="experience"
          className="mb-28 scroll-mt-28 sm:mb-40"
          aria-busy="true"
          aria-label="Experience loading"
        >
          <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-lg bg-gray-200/60 dark:bg-white/5" />
        </section>
      }
    >
      <LazyExperience />
    </DeferredSection>
  );
}

export function DeferredProjects() {
  return (
    <DeferredSection
      fallback={
        <section
          id="projects"
          className="mb-28 scroll-mt-28 sm:mb-40"
          aria-busy="true"
          aria-label="Projects loading"
        >
          <div className="mx-auto h-80 max-w-[42rem] animate-pulse rounded-lg bg-gray-200/60 dark:bg-white/5" />
        </section>
      }
    >
      <LazyProjects />
    </DeferredSection>
  );
}

export function DeferredSkills() {
  return (
    <DeferredSection
      fallback={
        <section
          id="skills"
          className="mb-28 max-w-[53rem] scroll-mt-28 sm:mb-40"
          aria-busy="true"
          aria-label="Skills loading"
        >
          <div className="mx-auto h-48 max-w-2xl animate-pulse rounded-lg bg-gray-200/60 dark:bg-white/5" />
        </section>
      }
    >
      <LazySkills />
    </DeferredSection>
  );
}
