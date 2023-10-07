'use client';

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";

export default function About() {
  return (
    <motion.section 
      className='mb-28 max-w-[50rem] text-center leading-8 sm:mb-0'
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <SectionHeading>About me</SectionHeading>
      <p className="mb-3">
        I am a dedicated <span className="font-semibold">computer scientist</span>{' '} 
        with a strong background in <span className="font-semibold">software development</span> and <span className="font-semibold">data analysis</span>. 
        In my current role as a <span className="italic">junior web developer</span> at <a href="https://pageproof.com/" className="underline">PageProof</a>, I focus on improving the mobile user experience and addressing issues within the PageProof web app.{' '}
        Prior to this, I worked as an <span className="italic">operations research analyst</span> at <a href="https://www.ctt.pt/grupo-ctt/index?language_id=1/" className="underline">CTT – Correios de Portugal</a>, where I applied my analytical skills to optimize last-mile postal delivery operations.
      </p>
      <p>
        My academic journey includes a MSc. in Computer Science from NOVA University Lisbon, where I explored areas such as artificial intelligence, machine learning, and information retrieval. I have a diverse skill set that encompasses various programming languages, tools, and technologies, and I am committed to staying updated with the latest industry trends.
      </p>
    </motion.section>
  );
}