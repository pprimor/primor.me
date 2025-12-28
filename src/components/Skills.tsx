import React from "react";
import SectionHeading from "./SectionHeading";
import { skillsByCategory } from "@/src/lib/data";
import { useSectionInView } from "@/src/lib/hooks";
import { motion } from "framer-motion";

export default function Skills() {
  const { ref } = useSectionInView("#skills");

  const animationVariants = {
    initial: { opacity: 0, y: 100 },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.05 },
    }),
  };

  let skillIndex = 0;

  return (
    <section
      id="skills"
      ref={ref}
      className="mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40"
    >
      <SectionHeading>Tech Stack</SectionHeading>
      <div className="flex flex-wrap justify-center gap-2 text-lg text-gray-800 dark:text-white/80">
        {skillsByCategory.map(({ category, skills }, categoryIndex) => (
          <React.Fragment key={category}>
            {skills.map(({ name, icon }) => {
              const currentIndex = skillIndex++;
              return (
                <motion.li
                  key={name}
                  className="flex items-center gap-2 bg-white dark:bg-white/10 borderBlack dark:border-white/10 rounded-xl px-5 py-3 list-none"
                  variants={animationVariants}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  custom={currentIndex}
                >
                  {icon}
                  {name}
                </motion.li>
              );
            })}
            {categoryIndex < skillsByCategory.length - 1 && (
              <div className="w-full basis-full" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
