import { Fragment } from "react";
import SectionHeading from "./SectionHeading";
import { projects } from "@/src/lib/data";
import Project from "./Project";
import { useSectionInView } from "@/src/lib/hooks";

export default function Projects() {
  const { ref } = useSectionInView("#projects");

  return (
    <section id="projects" ref={ref} className="scroll-mt-28 mb-28">
      <SectionHeading>Projects</SectionHeading>
      <div>
        {projects.map((project) => (
          <Fragment key={project.title}>
            <Project {...project} />
          </Fragment>
        ))}
      </div>
    </section>
  );
}
