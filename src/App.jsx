import { lazy, Suspense } from "react";
import IntroHero from "./components/IntroHero.jsx";
import CylinderHero from "./components/CylinderHero.jsx";
import Resume from "./components/Resume.jsx";
import Contact from "./components/Contact.jsx";

// Three.js is heavy: load the skills section separately so the page shows up fast
const SkillsKeyboard = lazy(() => import("./components/SkillsKeyboard.jsx"));

export default function App() {
  return (
    <main>
      <IntroHero />
      <CylinderHero />
      <Suspense fallback={<section id="skills" style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
        <SkillsKeyboard />
      </Suspense>
      <Resume />
      <Contact />
    </main>
  );
}