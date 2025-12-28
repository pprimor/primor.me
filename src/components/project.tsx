import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { projects } from "@/src/lib/data";
import { useTheme } from "../context/theme-context";
import { getExperienceSkillIcons } from "@/src/lib/data";

type ProjectProps = (typeof projects)[number] & {
  setDialogOpen: (value: string | null) => void;
};

export default function Project({
  title,
  description,
  tags,
  image,
  setDialogOpen,
}: ProjectProps) {
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const tagIcons = getExperienceSkillIcons(tags);
  
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
      style={{
        scale: scaleProgress,
        opacity: opacityProgress,
      }}
      className="group mb-3 sm:mb-8 last:mb-0"
    >
      <section
        className="group relative rounded-lg bg-gray-100 dark:bg-white/10 max-w-[42rem] border border-black/5 dark:border-white/10 overflow-hidden sm:pr-8 sm:h-[20rem] sm:group-even:pl-8 hover:bg-gray-200 dark:hover:bg-white/20 transition"
        onClick={() => setDialogOpen(title)}
      >
        <div className="flex flex-col py-4 px-5 sm:pl-10 sm:pr-2 sm:pt-10 sm:max-w-[50%] sm:h-[20rem] h-full sm:group-even:ml-[18rem]">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">
            {description}
          </p>
          <ul className="flex flex-wrap mt-2 gap-2 sm:mt-auto">
            {tagIcons.map((tag, idx) => (
              <li
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
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
        </div>
        <img
          src={image}
          alt={title}
          className="absolute hidden sm:block top-8 -right-40 w-[28rem] rounded-t-lg shadow-2xl object-center
          group-even:-right-[initial]
          group-even:-left-40
          group-hover:-translate-x-3
          group-hover:translate-y-3
          group-hover:-rotate-2
          group-even:group-hover:translate-x-3
          group-even:group-hover:rotate-2
          group-hover:scale-105
          transition"
        />
      </section>
    </motion.div>
  );
}
