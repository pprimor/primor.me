import SectionHeading from "./section-heading";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { experienceData } from "@/src/lib/data";
import { useSectionInView } from "@/src/lib/hooks";
import { useTheme } from "../context/theme-context";

export default function Experience() {
  const { ref } = useSectionInView("#experience");
  const { theme } = useTheme();
  return (
    <section id="experience" className="scroll-mt-28 mb-28" ref={ref}>
      <SectionHeading>Experience</SectionHeading>
      <VerticalTimeline lineColor="">
        {experienceData.map((item, index) => (
          <VerticalTimelineElement
            key={index}
            contentStyle={{
              background:
                theme === "light" ? "#f3f4f6" : "rgba(255, 255, 255, 0.1)",
              boxShadow: "none",
              border: `1px solid ${
                theme === "light"
                  ? "rgba(0, 0, 0, 0.05)"
                  : "rgba(255, 255, 255, 0.2)"
              }`,
              textAlign: "left",
              padding: "1.3rem 2rem",
            }}
            contentArrowStyle={{
              borderRight: `0.4rem solid ${
                theme === "light" ? "#9ca3af" : "#f3f4f6"
              }`,
            }}
            date={item.date}
            dateClassName="mx-4 text-gray-700 dark:text-gray-300"
            icon={item.icon}
            iconStyle={{
              background: theme === "light" ? "white" : "#1f2937",
              fontSize: "1.5rem",
            }}
          >
            <h3 className="font-semibold capitalize">{item.title}</h3>
            <p className="font-normal !mt-0">{item.company}</p>
            <p className="!mt-1 !font-normal text-gray-700 dark:text-gray-300">
              {item.description}
            </p>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </section>
  );
}
