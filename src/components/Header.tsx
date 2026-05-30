import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { links } from "@/src/lib/data";
import { useActiveSectionContext } from "../context/active-section-context";

export default function Header() {
  const { activeSection, setActiveSection, setClickTime } =
    useActiveSectionContext();
  const shouldReduceMotion = useReducedMotion();

  return (
    <header className="z-[999] relative">
      <motion.div
        className="fixed top-0 left-1/2 h-[3rem] w-full rounded-none border border-white dark:borderBlack border-opacity-40 dark:bg-opacity-75 bg-white dark:bg-gray-950 bg-opacity-80 shadow-lg shadow-black/3 backdrop-blur-[0.5rem] sm:top-6 sm:h-[3rem] sm:w-[30rem] sm:rounded-full"
        initial={shouldReduceMotion ? false : { x: "-50%", y: -100, opacity: 0 }}
        animate={{ x: "-50%", y: 0, opacity: 1 }}
      />
      <nav
        aria-label="Main navigation"
        className="flex fixed top-0 left-1/2 h-12 -translate-x-1/2 sm:top-[1.5rem] sm:h-[initial] sm:py-0"
      >
        <ul className="flex w-[28rem] flex-wrap items-center justify-center gap-y-1 text-[1rem] font-medium text-gray-500 sm:w-[initial] sm:flex-nowrap sm:gap-3">
          {links.map((link) => (
            <motion.li
              key={link.hash}
              className="flex h-3/4 items-center"
              initial={shouldReduceMotion ? false : { y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <a
                href={link.hash}
                aria-current={activeSection === link.hash ? "page" : undefined}
                onClick={() => {
                  setActiveSection(link.hash);
                  setClickTime(Date.now());
                }}
                className={clsx(
                  "flex w-full items-center justify-center px-3 py-3 hover:text-gray-950 transition dark:hover:text-gray-300 focus-ring rounded-full",
                  {
                    "text-gray-950 dark:text-gray-200":
                      activeSection === link.hash,
                  }
                )}
              >
                {link.name}
              </a>
            </motion.li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
