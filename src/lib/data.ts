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
  FaJava,
  FaAngular,
} from "react-icons/fa";
import { SiVite } from "react-icons/si";
import { IoMdAirplane } from "react-icons/io";
import { SiTypescript, SiTailwindcss, SiWebpack } from "react-icons/si";

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
    title: "Optimization Problems in the Postal Sector",
    description:
      "Explored how to model and solve a vehicle routing problem adapted to the postal sector, in general, and CTT, in particular.",
    tags: ["Python", "CPLEX", "Tableau"],
    image: "/images/tableau.png",
  },
  {
    title: "My Spelling Game",
    description:
      "Developed and published a 2D mobile game for Android/iOS using Unity and C# along with a graphic designer.",
    tags: ["Unity", "C#", "SQLite", "Android", "iOS"],
    image: "/images/spelling.jpg",
  },
];

export const skills = [
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
    name: "AngularJS",
    icon: React.createElement(FaAngular),
  },
  {
    name: "Vite",
    icon: React.createElement(SiVite),
  },
  {
    name: "Tailwind CSS",
    icon: React.createElement(SiTailwindcss),
  },
  {
    name: "Webpack",
    icon: React.createElement(SiWebpack),
  },
  {
    name: "Node.js",
    icon: React.createElement(FaNodeJs),
  },
  {
    name: "Git",
    icon: React.createElement(FaGitAlt),
  },
  {
    name: "Unity",
    icon: React.createElement(FaUnity),
  },
  {
    name: "Python",
    icon: React.createElement(FaPython),
  },
] as const;

export const experienceData = [
  {
    title: "Software Engineer",
    company: "PageProof",
    description:
      "Developing cross-platform integrations for Canva, Microsoft Office, Adobe Creative Suite, and Final Cut Pro.",
    icon: React.createElement(MdWork),
    date: "2023 - present",
  },
  {
    title: "Operations Research Analyst",
    company: "CTT – Correios de Portugal, S.A.",
    description: "Operations research and data analytics project for my master's thesis.",
    icon: React.createElement(GiArchiveResearch),
    date: "2022",
  },
  {
    title: "MSc. Student",
    company: "NOVA University Lisbon",
    description: "Artificial Intelligence, Data Modelling, Information Retrieval, and Machine Learning.",
    icon: React.createElement(IoSchool),
    date: "2020 - 2022",
  },
  {
    title: "Erasmus+ Programme ",
    company: "Technische Universität Dresden",
    icon: React.createElement(IoMdAirplane),
    date: "2021",
  },
  {
    title: "BSc. Student",
    company: "NOVA University Lisbon",
    description: "Algorithms and Data Structures, Object-Oriented Programming, Computer Architecture, and Sensors and Image Processing.",
    icon: React.createElement(IoSchool),
    date: "2017 - 2020",
  },
] as const;
