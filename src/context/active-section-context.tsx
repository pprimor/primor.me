import React, { useState, useContext, createContext } from "react";
import type { SectionHash } from "@/src/lib/types";

type ActiveSectionContextProviderProps = {
  children: React.ReactNode;
};

type ActionSectionContextType = {
  activeSection: SectionHash;
  setActiveSection: React.Dispatch<React.SetStateAction<SectionHash>>;
  lastClick: number;
  setClickTime: React.Dispatch<React.SetStateAction<number>>;
};

export const ActiveSectionContext =
  createContext<ActionSectionContextType | null>(null);

export default function ActiveSectionContextProvider({
  children,
}: ActiveSectionContextProviderProps) {
  const [activeSection, setActiveSection] = useState<SectionHash>("#home");
  const [lastClick, setClickTime] = useState<number>(0);

  return (
    <ActiveSectionContext.Provider
      value={{
        activeSection,
        setActiveSection,
        lastClick,
        setClickTime,
      }}
    >
      {children}
    </ActiveSectionContext.Provider>
  );
}

export function useActiveSectionContext() {
  const context = useContext(ActiveSectionContext);
  if (context === null) {
    throw new Error(
      "useActiveSection must be used within a ActiveSectionContextProvider"
    );
  }
  return context;
}
