import { m, useReducedMotion } from "framer-motion";
import { BsArrowRight, BsGithub, BsLinkedin } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { useSectionInView } from "@/src/lib/hooks";
import { siteMetadata } from "@/src/lib/site-metadata";
import OptimizedImage from "./OptimizedImage";

export default function Intro() {
  const { ref } = useSectionInView("#home");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="home"
      ref={ref}
      className="mt-12 mb-48 max-w-[50rem] text-center sm:m-0 scroll-mt-[100rem]"
    >
      <div className="flex items-center justify-center">
        <div className="relative">
          <m.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "tween", duration: 0.5 }}
          >
            <OptimizedImage
              basePath="/images/me"
              alt="Pedro Primor"
              width={200}
              height={200}
              className="w-24 object-cover drop-shadow-xl"
              loading="eager"
              fetchPriority="high"
            />
          </m.div>
        </div>
      </div>
      <m.div
        className="mb-10 mt-4 px-4"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-medium !leading-[1.5] sm:text-4xl">
          Hey there 👋, I&rsquo;m <b>Pedro</b>.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-700 dark:text-white/80 sm:text-xl">
          I build integrations and workflow tools for creative teams —{" "}
          <span className="font-semibold">Canva</span>,{" "}
          <span className="font-semibold">Adobe</span>,{" "}
          <span className="font-semibold">Office</span>, and{" "}
          <span className="font-semibold">Final Cut Pro</span>.
        </p>
        <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-white/70 sm:text-lg">
          Software Engineer at{" "}
          <a href="https://pageproof.com" className="font-semibold hover:underline">
            PageProof
          </a>{" "}
          in Portugal 🇵🇹. Open to select freelance projects.
        </p>
        <p className="mt-4 text-base text-gray-600 dark:text-white/60">
          <a
            href={`mailto:${siteMetadata.contactEmail}`}
            className="font-medium underline decoration-gray-400 underline-offset-4 hover:text-gray-900 dark:hover:text-white"
          >
            {siteMetadata.contactEmail}
          </a>
        </p>
      </m.div>
      <m.div
        className="flex flex-row flex-wrap items-center justify-center gap-4"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <a
          href="#contact"
          className="group bg-gray-900 text-white px-7 py-3 flex items-center gap-2 rounded-full focus-ring hover:scale-110 hover:bg-gray-950 active:scale-105 transition"
        >
          Contact me
          <BsArrowRight className="opacity-70 group-hover:translate-x-1 transition" />
        </a>
        <a
          href="https://cv.primor.me/CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white dark:bg-white/10 px-7 py-3 flex items-center gap-2 rounded-full focus-ring hover:scale-110 active:scale-105 transition cursor-pointer borderBlack"
        >
          Download CV{" "}
          <HiDownload className="opacity-70 group-hover:scale-110 transition" />
        </a>
        <a
          href="https://www.linkedin.com/in/primor/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn profile"
          className="bg-white dark:bg-white/10 text-gray-700 dark:text-white/60 p-4 flex items-center gap-2 rounded-full focus-ring hover:scale-110 hover:text-gray-900 active:scale-105 transition cursor-pointer borderBlack"
        >
          <BsLinkedin />
        </a>
        <a
          href="https://github.com/pprimor"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub profile"
          className="bg-white dark:bg-white/10 text-gray-700 dark:text-white/60 p-4 flex items-center gap-2 rounded-full focus-ring hover:scale-110 hover:text-gray-900 active:scale-105 transition cursor-pointer borderBlack"
        >
          <BsGithub />
        </a>
      </m.div>
    </section>
  );
}
