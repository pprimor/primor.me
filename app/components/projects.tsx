"use client";

import React, { Fragment, useEffect } from "react";
import SectionHeading from "./section-heading";
import { projects } from "@/lib/data";
import Project from "./project";
import { useSectionInView } from "@/lib/hooks";

export default function Projects() {
  const { ref } = useSectionInView("#projects");

  return (
    <section id="projects" ref={ref} className="scroll-mt-28">
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
