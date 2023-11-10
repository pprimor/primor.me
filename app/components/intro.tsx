"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BsArrowRight, BsGithub, BsLinkedin } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import me from "@/public/images/me.png";
import { useSectionInView } from "@/lib/hooks";

export default function Intro() {
  const { ref } = useSectionInView("#home");

  return (
    <section
      id="home"
      ref={ref}
      className="mb-24 max-w-[50rem] text-center sm:mb-0 scroll-mt-[100rem]"
    >
      <div className="flex items-center justify-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "tween", duration: 0.5 }}
          >
            <Image
              src={me}
              alt="Pedro Primor"
              width={200}
              height={200}
              className="w-24 object-cover drop-shadow-xl"
            />
          </motion.div>
        </div>
      </div>
      <motion.h1
        className="mb-10 mt-4 px-4 text-2xl font-medium !leading-[1.5] sm:text-4xl"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Hey there 👋, I&rsquo;m <b>Pedro</b>.
        <br />
        I&rsquo;m a software engineer based in Portugal 🇵🇹 and I&rsquo;m
        currently working at{" "}
        <a href="https://pageproof.com" className="font-bold hover:underline">
          PageProof
        </a>{" "}
        as a junior Web Developer.
      </motion.h1>
      <motion.div
        className="flex flex-row flex-wrap items-center justify-center gap-4"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link
          href="#contact"
          className="group bg-gray-900 text-white px-7 py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 hover:bg-gray-950 active:scale-105 transition"
        >
          Contact me
          <BsArrowRight className="opacity-70 group-hover:translate-x-1 transition" />
        </Link>
        <a
          href="/CV.pdf"
          className="group bg-white px-7 py-3 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-110 active:scale-105 transition cursor-pointer border border-black/20"
        >
          Download CV{" "}
          <HiDownload className="opacity-70 group-hover:scale-110 transition" />
        </a>
        <a
          href="https://www.linkedin.com/in/pedroprimor/"
          target="_blank"
          className="bg-white text-gray-700 p-4 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-110 hover:text-gray-900 active:scale-105 transition cursor-pointer border border-black/20"
        >
          <BsLinkedin />
        </a>
        <a
          href="https://github.com/pprimor"
          target="_blank"
          className="bg-white text-gray-700 p-4 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-110 hover:text-gray-900 active:scale-105 transition cursor-pointer border border-black/20"
        >
          <BsGithub />
        </a>
      </motion.div>
    </section>
  );
}
