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
      <p className='mb-3'>
        As a <span className="font-bold">computer science graduate</span> with a strong passion for problem solving, I have always striven to apply critical thinking and a touch of creativity to my work.
        I have <span className="underline">1 year of experience</span> working full time as a software engineer, and I am currently a Junior Software Engineer at <a href='https://pageproof.com' className='font-bold hover:underline'>PageProof</a>.
      </p>
      <p>
        I am always looking for <span className="italic">new challenges</span> and opportunities to learn and grow as a professional, and that is why I&rsquo;ve always had side projects and hobbies that I&rsquo;m passionate about. This website is one of them 😄.
        When I&rsquo;m not working or studying new technologies, I like to spend my time <span className="font-medium">traveling</span>, meeting new people, and playing guitar.
      </p>
    </motion.section>
  );
}