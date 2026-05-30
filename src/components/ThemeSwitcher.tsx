import { BsMoon, BsSun } from "react-icons/bs";
import { useTheme } from "../context/theme-context";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="fixed bottom-4 right-4 bg-white dark:bg-gray-950 w-10 h-10 bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-2xl rounded-full flex items-center justify-center focus-ring hover:scale-110 active:scale-105 transition-all"
    >
      {theme === "light" ? <BsSun /> : <BsMoon />}
    </button>
  );
}
