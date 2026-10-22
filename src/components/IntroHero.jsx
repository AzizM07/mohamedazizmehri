import { useEffect, useState } from "react";
import { ArrowRight, ArrowDown, Download, Atom, Server, Cpu, Smartphone, UserRound } from "lucide-react";
import "./IntroHero.css";

// Put a photo of you in /public/me.jpg (cropped into a circle) and your CV in /public/cv.pdf
const PHOTO = "/me.jpg";
const CV_FILE = "/cv.pdf";

const ROTATING = ["web platforms", "mobile apps", "IoT devices", "AI features"];

const TECH = [
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
];

const NAV = [
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const CHIPS = [
  { label: "React", icon: Atom, className: "ih-chip-1" },
  { label: "Django", icon: Server, className: "ih-chip-2" },
  { label: "ESP32", icon: Cpu, className: "ih-chip-3" },
  { label: "Flutter", icon: Smartphone, className: "ih-chip-4" },
];

export default function IntroHero() {
  const [photoOk, setPhotoOk] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  // Rotate the highlighted word (skipped when the user prefers less motion)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let swap;
    const id = setInterval(() => {
      setWordVisible(false);
      swap = setTimeout(() => {
        setWordIndex((i) => (i + 1) % ROTATING.length);
        setWordVisible(true);
      }, 220);
    }, 2400);
    return () => {
      clearInterval(id);
      clearTimeout(swap);
    };
  }, []);

  const ticker = [...TECH, ...TECH];

  return (
    <section className="ih-section" id="intro">
      <div className="ih-glow ih-glow-a" aria-hidden="true" />
      <div className="ih-glow ih-glow-b" aria-hidden="true" />

      {/* Top navigation */}
      <header className="ih-nav">
        <a href="#intro" className="ih-logo">
          Aziz<span>.</span>
        </a>
        <nav aria-label="Sections">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#contact" className="ih-nav-cta">
          Let’s talk
        </a>
      </header>

      <div className="ih-inner">
        {/* Left column */}
        <div className="ih-text">
          <p className="ih-status">
            <span className="ih-dot" aria-hidden="true" />
            Available for internships
          </p>

          <h1 className="ih-title">
            Hi, I’m
            <br />
            <span className="ih-name">Aziz Mehri</span>.
          </h1>

          <p className="ih-role">
            I build{" "}
            <span className={`ih-word ${wordVisible ? "is-visible" : ""}`} aria-live="polite">
              {ROTATING[wordIndex]}
            </span>
            <br />
            from the Django API to the ESP32 board.
          </p>

          <div className="ih-actions">
            <a href="#projects" className="ih-btn ih-btn-primary">
              View my work <ArrowRight size={18} />
            </a>
            <a href={CV_FILE} download className="ih-btn ih-btn-outline">
              Download CV <Download size={18} />
            </a>
          </div>
        </div>

        {/* Right column */}
        <div className="ih-visual">
          <div className="ih-orbit" aria-hidden="true" />
          <div className="ih-circle">
            {photoOk ? (
              <img
                src={PHOTO}
                alt="Mohamed Aziz Mehri"
                onError={() => setPhotoOk(false)}
                draggable="false"
              />
            ) : (
              <div className="ih-placeholder">
                <UserRound size={44} />
                <span>Add /public/me.jpg</span>
              </div>
            )}
          </div>

          {CHIPS.map(({ label, icon: Icon, className }) => (
            <span key={label} className={`ih-chip ${className}`}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Teaser of what is below */}
      <a href="#projects" className="ih-cue">
        <ArrowDown size={16} className="ih-cue-arrow" aria-hidden="true" />
        Scroll to see my projects
      </a>

      <div className="ih-ticker" aria-hidden="true">
        <div className="ih-ticker-track">
          {ticker.map((t, i) => (
            <span key={i} className="ih-ticker-item">
              {t}
              <span className="ih-ticker-dot" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}