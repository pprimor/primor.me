import SectionHeading from "./SectionHeading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/src/lib/hooks";

export default function About() {
  const { ref } = useSectionInView("#about");

  return (
    <motion.section
      id="about"
      ref={ref}
      className="mb-28 max-w-[50rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <SectionHeading>About me</SectionHeading>
      <p className="mb-3">
        <span className="font-semibold">Software Engineer</span> at{" "}
        <a href="https://pageproof.com/" className="underline">
          PageProof
        </a>
        , specializing in the design and development of cross-platform integrations for{" "}
        <span className="font-semibold">Canva</span>,{" "}
        <span className="font-semibold">Microsoft Office</span>,{" "}
        <span className="font-semibold">Adobe Creative Suite</span>, and{" "}
        <span className="font-semibold">Final Cut Pro</span>. Experienced in{" "}
        <span className="font-semibold">React</span>,{" "}
        <span className="font-semibold">TypeScript</span>,{" "}
        <span className="font-semibold">Swift</span>, and{" "}
        <span className="font-semibold">Electron</span>, delivering user-focused, high-performance solutions in web, desktop and mobile
        environments.
      </p>
      <p>
        I build robust integrations and workflow extensions that connect creative ecosystems and enhance productivity.
        My work bridges complex technical requirements with intuitive design, resulting in scalable, maintainable solutions
        that improve efficiency, usability, and product value.
      </p>

    </motion.section>
  );
}
