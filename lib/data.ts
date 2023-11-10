import spellingGameImage from "@/public/images/spelling.jpg";
import websiteImage from "@/public/images/website.png";

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
