import Intro from "./components/Intro";
import SectionDivider from "./components/SectionDivider";
import About from "./components/About";
import {
  DeferredExperience,
  DeferredProjects,
  DeferredSkills,
} from "./components/DeferredSections";
import DeferredContact from "./components/DeferredContact";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4 gap-8">
      <Intro />
      <SectionDivider />
      <About />
      <DeferredExperience />
      <DeferredProjects />
      <DeferredSkills />
      <DeferredContact />
    </main>
  );
}
