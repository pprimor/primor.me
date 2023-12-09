import spellingGameImage from "@/public/images/spelling.jpg";
import websiteImage from "@/public/images/website.png";
import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { IoSchool } from "react-icons/io5";
import { GiArchiveResearch } from "react-icons/gi";

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
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const projects = [
  {
    title: "My Spelling Game",
    description:
      "Developed and published a 2D mobile game for Android/iOS using Unity and C# along with a graphic designer.",
    tags: ["Unity", "C#", "Android", "iOS"],
    image: spellingGameImage,
  },
  {
    title: "This Website",
    description:
      "Developed this website using Next.js, React, TypeScript, and Tailwind CSS.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    image: websiteImage,
  },
];

export const skills = [
  {
    name: "HTML",
    icon: "/html5.svg",
  },
  {
    name: "CSS",
    icon: "css3",
  },
  {
    name: "JavaScript",
    icon: "javascript",
  },
  {
    name: "TypeScript",
    icon: "typescript",
  },
  {
    name: "React",
    icon: "react",
  },
  {
    name: "Node.js",
    icon: "nodejs",
  },
  {
    name: "Git",
    icon: "git",
  },
] as const;

export const experienceData = [
  {
    title: "Front-End Developer",
    company: "PageProof",
    description:
      "Working on fixing several issues with the PageProof web app, particularly in the mobile experience.",
    icon: React.createElement(CgWorkAlt),
    date: "2023 - present",
  },
  {
    title: "Operations Research Analyst",
    company: "CTT – Correios de Portugal, S.A.",
    description: "Operations research and data analytics project",
    icon: React.createElement(GiArchiveResearch),
    date: "2022",
  },
  {
    title: "MSc. Student",
    company: "NOVA University Lisbon",
    description: "MSc. in Computer Science and Engineering",
    icon: React.createElement(IoSchool),
    date: "2020 - 2022",
  },
  {
    title: "BSc. Student",
    company: "NOVA University Lisbon",
    description: "BSc. in Computer Science and Engineering",
    icon: React.createElement(IoSchool),
    date: "2017 - 2020",
  },
] as const;
