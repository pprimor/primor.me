import { motion } from "framer-motion";
import { BsArrowRight, BsGithub, BsLinkedin } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { useSectionInView } from "@/src/lib/hooks";

export default function Intro() {
  const { ref } = useSectionInView("#home");

  return (
    <section
      id="home"
      ref={ref}
      className="mt-12 mb-48 max-w-[50rem] text-center sm:m-0 scroll-mt-[100rem]"
    >
      <div className="flex items-center justify-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "tween", duration: 0.5 }}
          >
            <img
              src="/images/me.png"
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
        as a Software Engineer.
      </motion.h1>
      <motion.div
        className="flex flex-row flex-wrap items-center justify-center gap-4"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <a
          href="mailto:pedro.primor@pm.me?subject=Contact%20from%20your%20website&body=Hi%20Pedro%2C%0D%0A%0D%0AI%20found%20your%20website%20and%20I%20would%20like%20to%20contact%20you%20regarding%20..."
          className="group bg-gray-900 text-white px-7 py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 hover:bg-gray-950 active:scale-105 transition"
        >
          Contact me
          <BsArrowRight className="opacity-70 group-hover:translate-x-1 transition" />
        </a>
        <a
          href="/CV.pdf"
          className="group bg-white dark:bg-white/10 px-7 py-3 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-110 active:scale-105 transition cursor-pointer borderBlack"
        >
          Download CV{" "}
          <HiDownload className="opacity-70 group-hover:scale-110 transition" />
        </a>
        <a
          href="https://www.linkedin.com/in/pedroprimor/"
          target="_blank"
          className="bg-white dark:bg-white/10 text-gray-700 dark:text-white/60 p-4 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-110 hover:text-gray-900 active:scale-105 transition cursor-pointer borderBlack"
        >
          <BsLinkedin />
        </a>
        <a
          href="https://github.com/pprimor"
          target="_blank"
          className="bg-white dark:bg-white/10 text-gray-700 dark:text-white/60 p-4 flex items-center gap-2 rounded-full focus:scale-110 hover:scale-110 hover:text-gray-900 active:scale-105 transition cursor-pointer borderBlack"
        >
          <BsGithub />
        </a>
      </motion.div>
    </section>
  );
}
