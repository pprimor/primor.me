"use client";

import React, { useState, useContext, createContext } from "react";
import type { SectionHash } from "@/lib/types";

type ActiveSectionContextProviderProps = {
  children: React.ReactNode;
};

type ActionSectionContextType = {
  activeSection: SectionHash;
  setActiveSection: React.Dispatch<React.SetStateAction<SectionHash>>;
  lastClickedAt: number;
  setLastClickedAt: React.Dispatch<React.SetStateAction<number>>;
};

export const ActiveSectionContext =
  createContext<ActionSectionContextType | null>(null);

export default function ActiveSectionContextProvider({
  children,
}: ActiveSectionContextProviderProps) {
  const [activeSection, setActiveSection] = useState<SectionHash>("#home");
  const [lastClickedAt, setLastClickedAt] = useState<number>(0);

  return (
    <ActiveSectionContext.Provider
      value={{
        activeSection,
        setActiveSection,
        lastClickedAt,
        setLastClickedAt,
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
