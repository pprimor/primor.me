import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/theme-context";
import { HiExternalLink } from "react-icons/hi";
import { getExperienceSkillIcons } from "@/src/lib/data";
import { calculateDuration, formatDateRange, formatDate } from "@/src/lib/utils";

interface Plugin {
  name: string;
  url: string;
  image?: string;
  description?: string;
}

interface ExperienceCardProps {
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
  isFirst?: boolean;
  isLast?: boolean;
  isSameCompany?: boolean;
  index: number;
}

export default function ExperienceCard({
  title,
  company,
  companyUrl,
  employmentType,
  location,
  startDate,
  endDate,
  icon,
  description,
  skills,
  links = [],
  plugins = [],
  isFirst = false,
  isLast = false,
  isSameCompany = false,
  index,
}: ExperienceCardProps) {
  const { theme } = useTheme();
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const skillIcons = getExperienceSkillIcons(skills);

  const duration = calculateDuration(startDate, endDate);
  const dateRange = `${formatDate(startDate)} - ${endDate ? formatDate(endDate) : "Present"}${duration ? ` • ${duration}` : ""}`;

  const cardBg = theme === "light" ? "#ffffff" : "rgba(255, 255, 255, 0.05)";
  const borderColor =
    theme === "light"
      ? "rgba(0, 0, 0, 0.08)"
      : "rgba(255, 255, 255, 0.1)";
  const textColor =
    theme === "light" ? "rgb(17, 24, 39)" : "rgb(243, 244, 246)";
  const secondaryTextColor =
    theme === "light" ? "rgb(107, 114, 128)" : "rgb(156, 163, 175)";
  const iconBg = theme === "light" ? "#f3f4f6" : "rgba(255, 255, 255, 0.1)";

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <div className="text-xl" style={{ color: textColor }}>
              {icon}
            </div>
          </div>
        </div>

        <div className="flex-1 pb-8">
          <div
            className="rounded-lg p-5 border transition-all hover:shadow-lg"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
            }}
          >
            <div className="mb-3">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1" style={{ color: textColor }}>
                    {title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {companyUrl ? (
                      <a
                        href={companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline flex items-center gap-1"
                        style={{ color: textColor }}
                      >
                        {company}
                        <HiExternalLink className="inline text-xs" />
                      </a>
                    ) : (
                      <span className="font-medium" style={{ color: textColor }}>
                        {company}
                      </span>
                    )}
                    {employmentType && (
                      <>
                        <span style={{ color: secondaryTextColor }}>•</span>
                        <span style={{ color: secondaryTextColor }}>
                          {employmentType}
                        </span>
                      </>
                    )}
                    {duration && (
                      <>
                        <span style={{ color: secondaryTextColor }}>•</span>
                        <span style={{ color: secondaryTextColor }}>
                          {duration}
                        </span>
                      </>
                    )}
                  </div>
                  {location && (
                    <p className="text-sm mt-1" style={{ color: secondaryTextColor }}>
                      {location}
                    </p>
                  )}
                </div>
                <div className="text-sm text-right" style={{ color: secondaryTextColor }}>
                  <div>{dateRange}</div>
                </div>
              </div>
            </div>

            {description.length > 0 && (
              <ul className="mb-4 space-y-1.5 list-none pl-0">
                {description.map((point, idx) => (
                  <li
                    key={idx}
                    className="text-sm leading-relaxed flex gap-2"
                    style={{ color: textColor }}
                  >
                    <span className="flex-shrink-0" style={{ color: secondaryTextColor }}>
                      •
                    </span>
                    <span className="flex-1">{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {skillIcons.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {(skillsExpanded ? skillIcons : skillIcons.slice(0, 3)).map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
                      style={{
                        backgroundColor: iconBg,
                        color: textColor,
                      }}
                    >
                      {skill.icon && (
                        <span className="flex-shrink-0">{skill.icon}</span>
                      )}
                      <span>{skill.name}</span>
                    </div>
                  ))}
                  {skillIcons.length > 3 && (
                    <button
                      onClick={() => setSkillsExpanded(!skillsExpanded)}
                      className="text-xs px-2.5 py-1 hover:underline cursor-pointer transition-colors"
                      style={{ 
                        color: secondaryTextColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = theme === "light" ? "rgb(59, 130, 246)" : "rgb(96, 165, 250)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = secondaryTextColor;
                      }}
                    >
                      {skillsExpanded 
                        ? "Show less" 
                        : `and ${skillIcons.length - 3} more`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {plugins.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plugins.map((plugin, idx) => (
                    <a
                      key={idx}
                      href={plugin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-lg border overflow-hidden transition-all hover:shadow-lg"
                      style={{
                        backgroundColor: cardBg,
                        borderColor: borderColor,
                      }}
                    >
                      {plugin.image && (
                        <div 
                          className="relative w-full aspect-video overflow-hidden"
                          style={{
                            backgroundColor: theme === "light" ? "#f3f4f6" : "rgba(31, 41, 55, 0.5)",
                          }}
                        >
                          <img
                            src={plugin.image}
                            alt={plugin.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div
                              className="p-1.5 rounded-full backdrop-blur-sm"
                              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            >
                              <HiExternalLink className="text-white text-sm" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h4
                            className="font-medium text-sm flex-1"
                            style={{ color: textColor }}
                          >
                            {plugin.name}
                          </h4>
                        </div>
                        {plugin.description && (
                          <p
                            className="text-xs line-clamp-2"
                            style={{ color: secondaryTextColor }}
                          >
                            {plugin.description}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 hover:underline"
                    style={{ color: secondaryTextColor }}
                  >
                    <HiExternalLink />
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

