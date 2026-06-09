import React from "react";
import { MdWork } from "react-icons/md";
import { IoSchool, IoLogoJavascript } from "react-icons/io5";
import { GiArchiveResearch } from "react-icons/gi";
import {
  FaHtml5,
  FaCss3,
  FaReact,
  FaNodeJs,
  FaGitAlt,
  FaPython,
} from "react-icons/fa";
import { SiVite } from "react-icons/si";
import { IoMdAirplane } from "react-icons/io";
import {
  SiTypescript,
  SiTailwindcss,
  SiElectron,
  SiSwift,
  SiTableau,
  SiOpenid,
  SiOcaml,
  SiNeo4J,
  SiWebgl,
  SiFlask,
  SiSass,
  SiLatex,
  SiAzurefunctions,
} from "react-icons/si";
import { DiDotnet, DiJava } from "react-icons/di";
import { TbBrandOauth } from "react-icons/tb";
import type { IconType } from "react-icons";

export const experienceIconKeys = [
  "work",
  "school",
  "research",
  "travel",
] as const;

export type ExperienceIconKey = (typeof experienceIconKeys)[number];

const experienceIcons: Record<ExperienceIconKey, IconType> = {
  work: MdWork,
  school: IoSchool,
  research: GiArchiveResearch,
  travel: IoMdAirplane,
};

const skillIconComponents: Record<string, IconType> = {
  HTML: FaHtml5,
  CSS: FaCss3,
  JavaScript: IoLogoJavascript,
  TypeScript: SiTypescript,
  React: FaReact,
  "Tailwind CSS": SiTailwindcss,
  Vite: SiVite,
  "Node.js": FaNodeJs,
  Python: FaPython,
  Java: DiJava,
  "OAuth 2.0": TbBrandOauth,
  "OpenID Connect": SiOpenid,
  Swift: SiSwift,
  SwiftUI: SiSwift,
  Electron: SiElectron,
  Tableau: SiTableau,
  Git: FaGitAlt,
  "Azure Functions": SiAzurefunctions,
  OCaml: SiOcaml,
  "ASP.NET": DiDotnet,
  Neo4j: SiNeo4J,
  WebGL: SiWebgl,
  Flask: SiFlask,
  SASS: SiSass,
  LaTeX: SiLatex,
};

function createIcon(Icon: IconType): React.ReactElement {
  return React.createElement(Icon);
}

export function getExperienceIcon(key: ExperienceIconKey): React.ReactElement {
  return createIcon(experienceIcons[key]);
}

export function getSkillIcon(name: string): React.ReactElement | null {
  const Icon = skillIconComponents[name];
  if (!Icon) {
    return null;
  }
  return createIcon(Icon);
}
