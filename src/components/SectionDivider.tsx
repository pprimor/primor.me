import { m, useReducedMotion } from "framer-motion";

export default function SectionDivider() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      className="bg-gray-200 my-28 h-16 w-1 rounded-full hidden sm:block"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    />
  );
}
