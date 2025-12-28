import React from "react";
import { useTheme } from "../context/theme-context";
import ExperienceCard from "./ExperienceCard";

interface Plugin {
  name: string;
  url: string;
  image?: string;
  description?: string;
}

interface ExperienceItem {
  title: string;
  company: string;
  companyUrl?: string;
  employmentType: string;
  location?: string;
  startDate: Date;
  endDate: Date | null;
  icon: React.ReactElement;
  description: readonly string[];
  skills: readonly string[];
  links?: readonly { label: string; url: string }[];
  plugins?: readonly Plugin[];
}

interface ExperienceTimelineProps {
  items: readonly ExperienceItem[];
}

export default function ExperienceTimeline({ items }: ExperienceTimelineProps) {
  const { theme } = useTheme();
  const lineColor = theme === "light" ? "#e5e7eb" : "rgba(255, 255, 255, 0.1)";

  const getIsSameCompany = (index: number) => {
    if (index === 0) return false;
    return items[index].company === items[index - 1].company;
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {items.length > 1 && (
        <>
          <div
            className="absolute left-6 top-12 w-0.5 pointer-events-none"
            style={{
              backgroundColor: lineColor,
              bottom: "3rem",
            }}
          />
          <div
            className="absolute left-6 bottom-0 w-0.5 h-12 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                to bottom,
                ${lineColor} 0px,
                ${lineColor} 4px,
                transparent 4px,
                transparent 8px
              )`,
            }}
          />
        </>
      )}

      {items.map((item, index) => (
        <div key={index} className="relative">
          <ExperienceCard
            {...item}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            isSameCompany={getIsSameCompany(index)}
            index={index}
          />
        </div>
      ))}
    </div>
  );
}

