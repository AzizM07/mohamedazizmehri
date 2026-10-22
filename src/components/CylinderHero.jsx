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

// dir 1 = moves left, dir -1 = moves right. speed in degrees per second.
const ROWS = [
  { y: -426, dir: 1, speed: 3.2 },
  { y: -142, dir: -1, speed: 2.6 },
  { y: 142, dir: 1, speed: 3.6 },
  { y: 426, dir: -1, speed: 3.0 },
];

const EMAIL = "mohamed.aziz.mehri.pro@gmail.com";
const SKILLS = ["React", "Django", "Flutter", "ESP32"];

function buildRing(rowIndex) {
  return Array.from(
    { length: CARDS_PER_RING },
    (_, i) => projects[(i * 3 + rowIndex * 5) % projects.length]
  );
}

export default function CylinderHero() {
  const heroRef = useRef(null);
  const wallRef = useRef(null);
  const cardRefs = useRef(ROWS.map(() => []));
  const [message, setMessage] = useState("");

  const rings = useMemo(() => ROWS.map((_, r) => buildRing(r)), []);

  useEffect(() => {
    const hero = heroRef.current;
    const wall = wallRef.current;

    const fit = () => {
      const w = hero.clientWidth;
      const h = hero.clientHeight;
      const s = Math.min(Math.max(w / DESIGN_W, (h * 0.75) / DESIGN_H), h / 620);
      wall.style.transform = `translateX(-50%) scale(${s})`;
      hero.style.setProperty("--s", s);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(hero);

    const offsets = ROWS.map((_, r) => (r * STEP) / 2);

    const render = () => {
      ROWS.forEach((row, r) => {
        cardRefs.current[r].forEach((el, i) => {
          if (!el) return;
          const angle = (((i * STEP + offsets[r]) % 360) + 540) % 360 - 180;
          if (Math.abs(angle) > MAX_ANGLE) {
            el.style.visibility = "hidden";
            return;
          }
          el.style.visibility = "visible";
          el.style.transform = `translateY(${row.y}px) rotateY(${angle}deg) translateZ(-${RADIUS}px)`;
        });
      });
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ROWS.forEach((row, r) => {
        offsets[r] += row.speed * row.dir * dt;
      });
      render();
      raf = requestAnimationFrame(tick);
    };

    render();
    if (!reduceMotion) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = message.trim();
    const subject = encodeURIComponent("Project from your portfolio");
    const body = encodeURIComponent(text || "Hi Aziz,");
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="ch-hero" id="home" ref={heroRef}>
      <div className="ch-wall" ref={wallRef} aria-hidden="true">
        <div className="ch-scene">
          {rings.map((ring, r) =>
            ring.map((p, i) => (
              <div
                key={`${r}-${i}`}
                className="ch-card"
                style={{ "--card-bg": p.color }}
                ref={(el) => (cardRefs.current[r][i] = el)}
              >
                {p.image ? (
                  <img src={p.image} alt="" loading="lazy" draggable="false" />
                ) : (
                  <span className="ch-card-name">{p.title}</span>
                )}
              </div>
            ))
          )}
        </div>
        <div className="ch-floor" />
      </div>

      <div className="ch-shade" />

      <header className="ch-top">
        <a href="#home" className="ch-logo" aria-label="Home">
          AM
        </a>
        <nav className="ch-pills" aria-label="Primary">
          <a href="#work" className="ch-pill is-active">Projects</a>
          <a href="#contact" className="ch-pill">Contact</a>
        </nav>
        <span className="ch-tagline">Open to opportunities</span>
      </header>

      <nav className="ch-side" aria-label="Sections">
        <a href="#home"><span className="ch-side-icon"><Home size={18} /></span>Home</a>
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