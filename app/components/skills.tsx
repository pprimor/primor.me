"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { skills } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
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

  return (
    <section
      id="skills"
      ref={ref}
      className="mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40"
    >
      <SectionHeading>Skills</SectionHeading>
      <ul className="flex flex-wrap justify-center gap-2 text-lg text-gray-800 dark:text-white/80">
        {skills.map(({ name, icon }, index) => (
          <motion.li
            key={index}
            className="flex items-center gap-2 bg-white dark:bg-white/10 borderBlack dark:border-white/10 rounded-xl px-5 py-3"
            variants={animationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={index}
          >
            {icon}
            {name}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
