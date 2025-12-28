import SectionHeading from "./SectionHeading";
import ExperienceTimeline from "./ExperienceTimeline";
import { experienceData } from "@/src/lib/data";
import { useSectionInView } from "@/src/lib/hooks";

export default function Experience() {
  const { ref } = useSectionInView("#experience");
  return (
    <section id="experience" className="scroll-mt-28 mb-28" ref={ref}>
      <SectionHeading>Experience</SectionHeading>
      <ExperienceTimeline items={experienceData} />
    </section>
  );
}
