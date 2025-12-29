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
  FaUnity,
  FaPython,
  FaDatabase,
} from "react-icons/fa";
import { SiVite } from "react-icons/si";
import { IoMdAirplane } from "react-icons/io";
import { SiTypescript, SiTailwindcss, SiElectron, SiSwift, SiCsharp, SiTableau, SiOpenid, SiAndroid, SiApple, SiOcaml, SiNeo4J, SiWebgl, SiFlask, SiSass, SiLatex } from "react-icons/si";
import { DiDotnet, DiJava } from "react-icons/di";
import { TbBrandOauth } from "react-icons/tb";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
] as const;

export const projects = [
  {
    title: "primor.me",
    description:
      "Developed this website using Vite, React, TypeScript, and Tailwind CSS.",
    tags: ["Vite", "React", "TypeScript", "Tailwind CSS"],
    image: "/images/website.png",
  },
  {
    title: "My Spelling Game",
    description:
      "Co-developed and published a 2D mobile game for Android and iOS using Unity and C#, in collaboration with a graphic designer.",
    tags: ["Unity", "C#", "SQLite", "Android", "iOS"],
    image: "/images/spelling.jpg",
  },
];

export const skillsByCategory = [
  {
    category: "Frontend",
    skills: [
      {
        name: "HTML",
        icon: React.createElement(FaHtml5),
      },
      {
        name: "CSS",
        icon: React.createElement(FaCss3),
      },
      {
        name: "JavaScript",
        icon: React.createElement(IoLogoJavascript),
      },
      {
        name: "TypeScript",
        icon: React.createElement(SiTypescript),
      },
      {
        name: "React",
        icon: React.createElement(FaReact),
      },
      {
        name: "Tailwind CSS",
        icon: React.createElement(SiTailwindcss),
      },
      {
        name: "Vite",
        icon: React.createElement(SiVite),
      },
    ],
  },
  {
    category: "Backend",
    skills: [
      {
        name: "Node.js",
        icon: React.createElement(FaNodeJs),
      },
      {
        name: "Python",
        icon: React.createElement(FaPython),
      },
      {
        name: "Java",
        icon: React.createElement(DiJava),
      },
      {
        name: "C#",
        icon: React.createElement(SiCsharp),
      },
      {
        name: "OAuth 2.0",
        icon: React.createElement(TbBrandOauth),
      },
      {
        name: "OpenID Connect",
        icon: React.createElement(SiOpenid),
      },
    ],
  },
  {
    category: "Native & Desktop",
    skills: [
      {
        name: "Swift",
        icon: React.createElement(SiSwift),
      },
      {
        name: "SwiftUI",
        icon: React.createElement(SiSwift),
      },
      {
        name: "Electron",
        icon: React.createElement(SiElectron),
      },
      {
        name: "Android",
        icon: React.createElement(SiAndroid),
      },
      {
        name: "iOS",
        icon: React.createElement(SiApple),
      },
    ],
  },
  {
    category: "Data & Analytics",
    skills: [
      {
        name: "SQLite",
        icon: React.createElement(FaDatabase),
      },
      {
        name: "Tableau",
        icon: React.createElement(SiTableau),
      },
    ],
  },
  {
    category: "Tools & Others",
    skills: [
      {
        name: "Git",
        icon: React.createElement(FaGitAlt),
      },
      {
        name: "Unity",
        icon: React.createElement(FaUnity),
      },
    ],
  },
] as const;

const additionalSkillIcons = [
  {
    name: "OCaml",
    icon: React.createElement(SiOcaml),
  },
  {
    name: "ASP.NET",
    icon: React.createElement(DiDotnet),
  },
  {
    name: "Neo4j",
    icon: React.createElement(SiNeo4J),
  },
  {
    name: "WebGL",
    icon: React.createElement(SiWebgl),
  },
  {
    name: "Flask",
    icon: React.createElement(SiFlask),
  },
  {
    name: "SASS",
    icon: React.createElement(SiSass),
  },
  {
    name: "LaTeX",
    icon: React.createElement(SiLatex),
  },
] as const;

const getSkillIcon = (skillName: string): React.ReactElement | null => {
  for (const category of skillsByCategory) {
    const skill = category.skills.find((s) => s.name === skillName);
    if (skill) {
      return skill.icon;
    }
  }
  const additionalSkill = additionalSkillIcons.find((s) => s.name === skillName);
  if (additionalSkill) {
    return additionalSkill.icon;
  }
  return null;
};

export const experienceData = [
  {
    title: "Software Engineer",
    company: "PageProof",
    companyUrl: "https://pageproof.com/",
    employmentType: "Freelance",
    location: "Remote",
    startDate: new Date(2023, 2, 1), // Mar. 2023
    endDate: null, // Present
    icon: React.createElement(MdWork),
    description: [
      "Enhanced cross-platform desktop application functionalities using Electron and Node.js, improving integration scalability and feature parity across operating systems",
      "Developed a company-wide OAuth 2.0 (RFC 6749) Authorization Server with OpenID Connect (OIDC) support, standardizing authentication across PageProof integrations",
      "Built the Canva App for PageProof using React, TypeScript, and the Canva Apps SDK, enabling seamless review workflows within Canva",
      "Implemented the Microsoft Office taskpane add-in with React, TypeScript, and Office.js to integrate PageProof's functionality directly into the Office ecosystem",
      "Led the development of the Final Cut Pro workflow extension using Swift and SwiftUI, improving review efficiency for video editing teams",
      "Built and maintained PageProof's cross-platform UXP plug-in integrations for Adobe Photoshop and InDesign, streamlining creative workflows and ensuring seamless integration with PageProof",
      "Contributed to enhancing the PageProof web app, with a focus on optimizing the mobile user experience and UI responsiveness",
    ],
    skills: ["React", "TypeScript", "Electron", "Node.js", "JavaScript", "Swift", "SwiftUI", "OAuth 2.0", "OpenID Connect", "SASS"],
    links: [],
    plugins: [
      {
        name: "PageProof for Adobe Photoshop",
        url: "https://exchange.adobe.com/apps/cc/c1f33c8f/pageproof-for-adobe-photoshop",
        description: "UXP plugin for Adobe Photoshop",
        image: "https://exchange-assets.azureedge.net/uxp/Extensions/c1f33c8f/uxp-c1f33c8f-version-1701891129280/screenshots/9c3ab00e-813b-418e-9e4f-42406f38e9be.png",
      },
      {
        name: "PageProof for Adobe InDesign",
        url: "https://exchange.adobe.com/apps/cc/f4e1a940/pageproof-for-adobe-indesign",
        description: "UXP plugin for Adobe InDesign",
        image: "https://exchange-assets.azureedge.net/uxp/Extensions/f4e1a940/uxp-f4e1a940-version-1713568505383/screenshots/d27a1dab-9281-49f9-aa70-419fe76b659a.png",
      },
      {
        name: "PageProof for Microsoft Office",
        url: "https://marketplace.microsoft.com/en-us/product/office/WA200008498?tab=Overview",
        description: "Powerful online proofing for Microsoft Office",
        image: "https://store-images.s-microsoft.com/image/apps.40119.1523da56-51ff-4abf-b530-2f7ead169bd2.ce0a3cd4-4665-4394-89d2-0420e5fa5d56.202a26d1-a095-4660-b8f2-94afd3435748.png",
      },
      {
        name: "PageProof for Final Cut Pro",
        url: "https://www.pageproof.com/integrations/final-cut-pro",
        description: "Workflow extension for video editing teams",
        image: "/images/final-cut-pro-preview.png",
      },
    ],
  },
  {
    title: "Operations Research Analyst",
    company: "CTT – Correios de Portugal, S.A.",
    companyUrl: "https://www.ctt.pt/",
    employmentType: "Contract",
    location: "Lisbon, Portugal",
    startDate: new Date(2022, 0, 1), // Jan. 2022
    endDate: new Date(2022, 8, 1), // Sep. 2022
    icon: React.createElement(GiArchiveResearch),
    description: [
      "Led an operations research and data analytics project focused on optimizing the last-mile delivery process",
      "Modeled and solved a vehicle routing problem tailored to postal delivery constraints",
      "Developed data visualizations and insights in Tableau to support decision-making",
    ],
    skills: ["Python", "Tableau", "Flask", "CPLEX", "LaTeX"],
    links: [],
  },
  {
    title: "Front-end Developer Intern",
    company: "Altitude Software",
    companyUrl: "https://altitudeapac.com/",
    employmentType: "Internship",
    location: "Lisbon, Portugal",
    startDate: new Date(2020, 3, 1), // Apr. 2020
    endDate: new Date(2020, 6, 1), // Jul. 2020
    icon: React.createElement(MdWork),
    description: [
      "Rebuilt legacy ASP.NET components using React, modernizing the user interface of a contact center management platform",
      "Improved maintainability and user experience of the platform",
    ],
    skills: ["React", "JavaScript", "HTML", "CSS", "ASP.NET"],
    links: [],
  },
  {
    title: "MSc. Student",
    company: "NOVA University Lisbon",
    companyUrl: "https://www.fct.unl.pt/en/",
    employmentType: "Education",
    location: "Lisbon, Portugal",
    startDate: new Date(2020, 8, 1), // Sep. 2020
    endDate: new Date(2022, 11, 1), // Dec. 2022
    icon: React.createElement(IoSchool),
    description: [
      "Master of Science in Computer Science",
      "Relevant coursework: Artificial Intelligence, Data Modelling, Information Retrieval, and Machine Learning",
    ],
    skills: ["Python", "Neo4j"],
    links: [],
  },
  {
    title: "Erasmus+ Programme",
    company: "Technische Universität Dresden",
    companyUrl: "https://tu-dresden.de/",
    employmentType: "Education",
    location: "Dresden, Germany",
    startDate: new Date(2021, 3, 1), // Apr. 2021
    endDate: new Date(2021, 9, 1), // Oct. 2021
    icon: React.createElement(IoMdAirplane),
    description: [
      "Exchange program studying Computer Science at Technische Universität Dresden",
    ],
    skills: [],
    links: [],
  },
  {
    title: "BSc. Student",
    company: "NOVA University Lisbon",
    companyUrl: "https://www.fct.unl.pt/en/",
    employmentType: "Education",
    location: "Lisbon, Portugal",
    startDate: new Date(2017, 8, 1), // Sep. 2017
    endDate: new Date(2020, 8, 1), // Sep. 2020
    icon: React.createElement(IoSchool),
    description: [
      "Bachelor of Science in Computer Science",
      "Relevant coursework: Algorithms and Data Structures, Object-Oriented Programming, Sensors and Image Processing",
    ],
    skills: ["Java", "Python", "OCaml", "WebGL"],
    links: [],
  },
];

export const getExperienceSkillIcons = (skillNames: readonly string[]) => {
  return skillNames.map((name) => ({
    name,
    icon: getSkillIcon(name),
  }));
};
