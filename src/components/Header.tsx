import { useEffect, useState } from "react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { links } from "@/src/lib/nav-links";
import { useActiveSectionContext } from "../context/active-section-context";

const navPillClassName =
  "border border-white dark:borderBlack border-opacity-40 bg-white dark:bg-gray-950 bg-opacity-80 shadow-lg shadow-black/3 backdrop-blur-[0.5rem]";

export default function Header() {
  const { activeSection, setActiveSection, setClickTime } =
    useActiveSectionContext();
  const shouldReduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.matchMedia("(min-width: 640px)").matches) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  }, []);

  const handleNavClick = (hash: (typeof links)[number]["hash"]) => {
    setActiveSection(hash);
    setClickTime(Date.now());
    setMobileOpen(false);
  };

  const linkClassName = (hash: string) =>
    clsx(
      "block px-4 py-3 text-[1rem] font-medium transition focus-ring rounded-lg whitespace-nowrap",
      activeSection === hash
        ? "text-gray-950 dark:text-gray-200"
        : "text-gray-500 hover:text-gray-950 dark:hover:text-gray-300"
    );

  return (
    <header className="z-[999] relative">
      <motion.nav
        aria-label="Main navigation"
        className="fixed top-0 left-1/2 w-full sm:top-6 sm:w-max sm:max-w-[calc(100vw-2rem)]"
        initial={shouldReduceMotion ? false : { x: "-50%", y: -100, opacity: 0 }}
        animate={{ x: "-50%", y: 0, opacity: 1 }}
      >
        {/* Mobile */}
        <div className={`sm:hidden overflow-hidden rounded-none ${navPillClassName}`}>
          <div className="flex h-12 items-center justify-between px-4">
            <span className="text-sm font-medium text-gray-950 dark:text-gray-200">
              {links.find((link) => link.hash === activeSection)?.name ?? "Menu"}
            </span>
            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-menu"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMobileOpen((open) => !open)}
              className="p-2 text-gray-700 dark:text-gray-300 focus-ring rounded-full"
            >
              {mobileOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
            </button>
          </div>
          {mobileOpen && (
            <ul id="mobile-nav-menu" className="border-t border-black/5 dark:border-white/10 py-1">
              {links.map((link) => (
                <li key={link.hash}>
                  <a
                    href={link.hash}
                    aria-current={activeSection === link.hash ? "page" : undefined}
                    onClick={() => handleNavClick(link.hash)}
                    className={linkClassName(link.hash)}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Desktop */}
        <div
          className={`hidden sm:flex h-[3rem] w-auto items-center justify-center rounded-full px-2 ${navPillClassName}`}
        >
          <ul className="flex items-center gap-1 px-1 text-[1rem] font-medium text-gray-500">
            {links.map((link) => (
              <motion.li
                key={link.hash}
                className="flex items-center"
                initial={shouldReduceMotion ? false : { y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <a
                  href={link.hash}
                  aria-current={activeSection === link.hash ? "page" : undefined}
                  onClick={() => handleNavClick(link.hash)}
                  className={clsx(
                    "px-2.5 py-3 hover:text-gray-950 transition dark:hover:text-gray-300 focus-ring rounded-full whitespace-nowrap",
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
        </div>
      </motion.nav>
    </header>
  );
}
