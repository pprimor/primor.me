import React, { Fragment } from "react";
import SectionHeading from "./SectionHeading";
import { projects } from "@/src/lib/data";
import Project from "./Project";
import { useSectionInView } from "@/src/lib/hooks";

export default function Projects() {
  const { ref } = useSectionInView("#projects");
  const [dialogOpen, setDialogOpen] = React.useState<string | null>(null);

  return (
    <>
      <section id="projects" ref={ref} className="scroll-mt-28 mb-28">
        <SectionHeading>Projects</SectionHeading>
        <div>
          {projects.map((project) => (
            <Fragment key={project.title}>
              <Project {...project} setDialogOpen={setDialogOpen} />
            </Fragment>
          ))}
        </div>
      </section>
      {/* <dialog
        className="fixed w-[90vw] h-[90vh] inset-0 m-auto bg-white dark:bg-black/80 rounded-lg overflow-hidden"
        open={!!dialogOpen}
        onClick={() => setDialogOpen(null)}
      ></dialog> */}
    </>
  );
}
