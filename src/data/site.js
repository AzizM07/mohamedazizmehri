// Everything personal shown in the first two screens, in one place.
// To make the site for someone else, change:
//   src/data/site.js, resume.js, projects.js, skills.js
//   public/me.jpg, public/cv.pdf, public/projects/*
//   the <title> in index.html
import { Atom, Server, Cpu, Smartphone } from "lucide-react";

export const site = {
  // Identity
  firstName: "Aziz", // logo "Aziz." and the "Hi Aziz," of the email
  displayName: "Aziz Mehri", // big title on the first screen
  fullName: "Mohamed Aziz Mehri", // photo alt text and projects subtitle
  initials: "AM", // round logo on the projects wall

  // Colors
  accent: "#2f6bff", // blue: buttons, name, links, dots
  highlight: "#f5c518", // yellow: "work" in Contact, roles in Resume

  // First screen (IntroHero)
  status: "Available for internships",
  rolePrefix: "I build",
  rotating: ["web platforms", "mobile apps", "IoT devices", "AI features"],
  roleLine: "from the Django API to the ESP32 board.",
  // Floating badges around the photo (also the 4 chips under the prompt bar).
  // icon: any icon from https://lucide.dev, imported at the top of this file
  chips: [
    { label: "React", icon: Atom },
    { label: "Django", icon: Server },
    { label: "ESP32", icon: Cpu },
    { label: "Flutter", icon: Smartphone },
  ],
  ticker: [
    "React",
    "Django REST",
    "Flutter",
    "ESP32",
    "STM32",
    "Python",
    "Docker",
    "Linux",
    "SQL",
    "Figma",
    "Machine learning",
    "IoT",
  ],

  // Projects wall (CylinderHero)
  wallBadge: "Open to opportunities",
  heroTitle: ["I build ideas", "that ship"], // two lines
  heroSub: "full-stack and IoT developer in Tunis", // shown after the full name
  mailSubject: "Project from your portfolio",
};