import React, { useState, createContext } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeContextProviderProps = {
  children: React.ReactNode;
};

function getInitialTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export default function ThemeContextProvider({
  children,
}: ThemeContextProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
}
