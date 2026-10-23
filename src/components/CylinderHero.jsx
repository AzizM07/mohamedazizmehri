import { useEffect, useMemo, useRef, useState } from "react";
import { Home, Briefcase, Cpu, Mail, ArrowUpRight } from "lucide-react";
import { projects } from "../data/projects";
import "./CylinderHero.css";

// Geometry is designed on a 1280 x 720 canvas, then scaled to the screen.
const DESIGN_W = 1280;
const DESIGN_H = 720;
const RADIUS = 900; // smaller = stronger curve
const CARDS_PER_RING = 13;
const STEP = 360 / CARDS_PER_RING;
const MAX_ANGLE = 95; // cards beyond this angle are hidden

// Desktop 3D rows. dir 1 = moves left, dir -1 = moves right. speed in degrees per second.
const ROWS = [
  { y: -426, dir: 1, speed: 3.2 },
  { y: -142, dir: -1, speed: 2.6 },
  { y: 142, dir: 1, speed: 3.6 },
  { y: 426, dir: -1, speed: 3.0 },
];

// Phone rows: flat strips animated by CSS only (much lighter on Android).
const FLAT_ROWS = [
  { top: -90, dir: 1, duration: 70 },
  { top: 120, dir: -1, duration: 85 },
  { top: 330, dir: 1, duration: 75 },
  { top: 540, dir: -1, duration: 90 },
];

const EMAIL = "mohamed.aziz.mehri.pro@gmail.com";
const SKILLS = ["React", "Django", "Flutter", "ESP32"];
const PHONE_QUERY = "(max-width: 768px)";

function buildRing(rowIndex) {
  return Array.from(
    { length: CARDS_PER_RING },
    (_, i) => projects[(i * 3 + rowIndex * 5) % projects.length]
  );
}

function rotate(list, n) {
  const k = n % list.length;
  return [...list.slice(k), ...list.slice(0, k)];
}

function CardContent({ project }) {
  return project.image ? (
    <img src={project.image} alt="" loading="lazy" decoding="async" draggable="false" />
  ) : (
    <span className="ch-card-name">{project.title}</span>
  );
}

export default function CylinderHero() {
  const heroRef = useRef(null);
  const wallRef = useRef(null);
  const cardRefs = useRef(ROWS.map(() => []));
  const [message, setMessage] = useState("");
  const [flat] = useState(() => window.matchMedia(PHONE_QUERY).matches);

  const rings = useMemo(() => ROWS.map((_, r) => buildRing(r)), []);
  const flatRows = useMemo(() => FLAT_ROWS.map((_, r) => rotate(projects, r * 3)), []);

  useEffect(() => {
    const hero = heroRef.current;
    const wall = wallRef.current;

    const fit = () => {
      const w = hero.parentElement.clientWidth;
      const h = window.innerHeight;
      const s = Math.min(Math.max(w / DESIGN_W, (h * 0.75) / DESIGN_H), h / 620);
      wall.style.transform = `translateX(-50%) scale(${s})`;
      hero.style.setProperty("--s", s);
    };
    fit();
    window.addEventListener("resize", fit);

    // Phone: CSS animations do everything, no JavaScript loop.
    if (flat) {
      return () => window.removeEventListener("resize", fit);
    }

    // Desktop: 3D loop, paused when the section is off screen.
    const offsets = ROWS.map((_, r) => (r * STEP) / 2);
    const shown = ROWS.map(() => []);

    const render = () => {
      ROWS.forEach((row, r) => {
        cardRefs.current[r].forEach((el, i) => {
          if (!el) return;
          const angle = (((i * STEP + offsets[r]) % 360) + 540) % 360 - 180;
          const visible = Math.abs(angle) <= MAX_ANGLE;
          if (visible !== shown[r][i]) {
            el.style.visibility = visible ? "visible" : "hidden";
            shown[r][i] = visible;
          }
          if (visible) {
            el.style.transform = `translateY(${row.y}px) rotateY(${angle}deg) translateZ(-${RADIUS}px)`;
          }
        });
      });
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;

    const tick = (now) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      ROWS.forEach((row, r) => {
        offsets[r] += row.speed * row.dir * dt;
      });
      render();
      raf = requestAnimationFrame(tick);
    };

    render();

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !raf && !reduceMotion) {
        last = 0;
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(hero);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [flat]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = message.trim();
    const subject = encodeURIComponent("Project from your portfolio");
    const body = encodeURIComponent(text || "Hi Aziz,");
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <section className={`ch-hero ${flat ? "is-flat" : ""}`} id="projects" ref={heroRef}>
      <div className="ch-wall" ref={wallRef} aria-hidden="true">
        {flat ? (
          <div className="ch-flat">
            {FLAT_ROWS.map((row, r) => (
              <div key={r} className="ch-flat-row" style={{ top: row.top }}>
                <div
                  className={`ch-flat-track ${row.dir === 1 ? "to-left" : "to-right"}`}
                  style={{ animationDuration: `${row.duration}s` }}
                >
                  {[...flatRows[r], ...flatRows[r]].map((p, i) => (
                    <div key={i} className="ch-flat-card" style={{ "--card-bg": p.color }}>
                      <CardContent project={p} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ch-scene">
            {rings.map((ring, r) =>
              ring.map((p, i) => (
                <div
                  key={`${r}-${i}`}
                  className="ch-card"
                  style={{ "--card-bg": p.color }}
                  ref={(el) => (cardRefs.current[r][i] = el)}
                >
                  <CardContent project={p} />
                </div>
              ))
            )}
          </div>
        )}
        <div className="ch-floor" />
      </div>

      <div className="ch-shade" />

      <header className="ch-top">
        <a href="#intro" className="ch-logo" aria-label="Back to top">
          AM
        </a>
        <nav className="ch-pills" aria-label="Primary">
          <a href="#work" className="ch-pill is-active">Projects</a>
          <a href="#contact" className="ch-pill">Contact</a>
        </nav>
        <span className="ch-tagline">Open to opportunities</span>
      </header>

      <nav className="ch-side" aria-label="Sections">
        <a href="#intro"><span className="ch-side-icon"><Home size={18} /></span>Home</a>
        <a href="#work"><span className="ch-side-icon"><Briefcase size={18} /></span>Work</a>
        <a href="#skills"><span className="ch-side-icon"><Cpu size={18} /></span>Skills</a>
        <a href="#contact"><span className="ch-side-icon"><Mail size={18} /></span>Contact</a>
      </nav>

      <div className="ch-center">
        <h1>I build ideas<br />that ship</h1>
        <p>Mohamed Aziz Mehri, full-stack and IoT developer in Tunis</p>
      </div>

      <form className="ch-prompt" onSubmit={handleSubmit}>
        <label htmlFor="ch-message" className="ch-sr-only">Describe your project</label>
        <input
          id="ch-message"
          type="text"
          placeholder="Describe your project in one line"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">
          Send <ArrowUpRight size={16} />
        </button>
      </form>

      <ul className="ch-chips" aria-label="Main skills">
        {SKILLS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  );
}
