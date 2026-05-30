import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { projects, getExperienceSkillIcons } from "@/src/lib/data";
import { useTheme } from "../context/theme-context";
import ProjectLinks from "./ProjectLinks";

type ProjectProps = (typeof projects)[number];

export default function Project({
  title,
  description,
  tags,
  images,
  liveUrl,
  repoUrl,
}: ProjectProps) {
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const tagIcons = getExperienceSkillIcons(tags);
  const screenshot = theme === "light" ? images.dark : images.light;

  const iconBg = theme === "light" ? "#f3f4f6" : "rgba(255, 255, 255, 0.1)";
  const textColor = theme === "light" ? "rgb(17, 24, 39)" : "rgb(243, 244, 246)";
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  return (
    <motion.div
      ref={ref}
      style={
        shouldReduceMotion
          ? { scale: 1, opacity: 1 }
          : { scale: scaleProgress, opacity: opacityProgress }
      }
      className="group mb-3 sm:mb-8 last:mb-0"
    >
      <section className="relative max-w-[42rem] overflow-hidden rounded-lg border border-black/5 bg-gray-100 transition hover:bg-gray-200 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20 sm:h-[20rem] sm:pr-8 sm:group-even:pl-8">
        <div className="relative z-10 flex h-full flex-col px-5 py-4 sm:h-[20rem] sm:max-w-[50%] sm:pl-10 sm:pr-2 sm:pt-10 sm:group-even:ml-[18rem] sm:group-even:max-w-[calc(100%-18rem)]">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">
            {description}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2 sm:mt-auto">
            {tagIcons.map((tag, idx) => (
              <li
                key={idx}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs"
                style={{
                  backgroundColor: iconBg,
                  color: textColor,
                }}
              >
                {tag.icon && (
                  <span className="flex-shrink-0">{tag.icon}</span>
                )}
                <span>{tag.name}</span>
              </li>
            ))}
          </ul>
          <ProjectLinks liveUrl={liveUrl} repoUrl={repoUrl} className="mt-4" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-8 -right-2 hidden h-[14rem] w-[20rem] overflow-hidden rounded-l-lg rounded-r-none border border-black/5 bg-gray-950 shadow-2xl transition group-even:-right-[initial] group-even:-left-2 group-even:rounded-l-none group-even:rounded-r-lg group-hover:-translate-x-3 group-hover:translate-y-3 group-hover:-rotate-2 group-even:group-hover:translate-x-3 group-even:group-hover:rotate-2 group-hover:scale-105 dark:border-white/10 dark:bg-white sm:block sm:h-[15rem] sm:w-[20rem]"
        >
          <img
            src={screenshot}
            alt=""
            className="h-full w-full object-cover object-top"
          />
        </div>
      </section>
    </motion.div>
  );
}
