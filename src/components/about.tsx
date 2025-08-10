import SectionHeading from "./section-heading";
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
        <span className="font-semibold">Software engineer</span> at{" "}
        <a href="https://pageproof.com/" className="underline">
          PageProof
        </a>
        , leading the development of cross-platform integrations for{" "}
        <span className="font-semibold">Canva</span>,{" "}
        <span className="font-semibold">Microsoft Office</span>,{" "}
        <span className="font-semibold">Adobe Creative Suite</span>, and{" "}
        <span className="font-semibold">Final Cut Pro</span>. Skilled in{" "}
        <span className="font-semibold">React</span>,{" "}
        <span className="font-semibold">TypeScript</span>, and{" "}
        <span className="font-semibold">Swift</span>, providing robust,
        high-performance tools that seamlessly connect creative professionals'
        workflows in web, mobile, and desktop environments.
      </p>
      <p>
        Over the course of my career, I have built a diverse portfolio of
        integrations and applications, from mobile-friendly web experiences to
        workflow extensions for industry-leading platforms. I thrive in
        translating complex requirements into elegant and maintainable solutions
        that improve efficiency, usability, and the value the product delivers.
      </p>

    </motion.section>
  );
}
