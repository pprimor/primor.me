import { useEffect } from "react";
import { useActiveSectionContext } from "../context/active-section-context";
import { IntersectionOptions, useInView } from "react-intersection-observer";
import { SectionHash } from "./types";

export function useSectionInView(
  section: SectionHash,
  intersectionOptions = { threshold: 0.75 } as IntersectionOptions
) {
  const { ref, inView } = useInView(intersectionOptions);
  const { lastClick: lastClickedAt, setActiveSection } =
    useActiveSectionContext();

  useEffect(() => {
    if (inView && Date.now() - lastClickedAt > 1000) {
      setActiveSection(section);
    }
  }, [inView, lastClickedAt, section, setActiveSection]);

  return { ref };
}
