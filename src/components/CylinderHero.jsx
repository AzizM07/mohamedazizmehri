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

const normalize = (a) => ((a % 360) + 540) % 360 - 180;

export default function CylinderHero() {
  const heroRef = useRef(null);
  const wallRef = useRef(null);
  const ringRefs = useRef([]);
  const cardRefs = useRef(ROWS.map(() => []));
  const [message, setMessage] = useState("");

  const rings = useMemo(() => ROWS.map((_, r) => buildRing(r)), []);

  useEffect(() => {
    const hero = heroRef.current;
    const wall = wallRef.current;

    // Scale the 1280 x 720 design to the screen
    const fit = () => {
      const w = hero.parentElement.clientWidth;
      const h = window.innerHeight;
      const s = Math.min(Math.max(w / DESIGN_W, (h * 0.75) / DESIGN_H), h / 620);
      wall.style.transform = `translateX(-50%) scale(${s})`;
      hero.style.setProperty("--s", s);
    };
    fit();
    window.addEventListener("resize", fit);

    // Each ring turns as one block, animated by the browser on the GPU.
    // Cards never move individually, so the phone has almost nothing to compute.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const starts = ROWS.map((_, r) => (r * STEP) / 2);

    const animations = ROWS.map((row, r) => {
      const ring = ringRefs.current[r];
      const start = starts[r];
      const end = start + row.dir * 360;
      if (reduceMotion) {
        ring.style.transform = `rotateY(${start}deg)`;
        return null;
      }
      return ring.animate(
        [{ transform: `rotateY(${start}deg)` }, { transform: `rotateY(${end}deg)` }],
        { duration: (360 / row.speed) * 1000, iterations: Infinity, easing: "linear" }
      );
    });

    // Hide the cards that pass behind the viewer (checked a few times per second only)
    const shown = ROWS.map(() => []);
    const updateVisibility = () => {
      ROWS.forEach((row, r) => {
        const anim = animations[r];
        const duration = (360 / row.speed) * 1000;
        const t = anim ? Number(anim.currentTime) % duration : 0;
        const offset = starts[r] + row.dir * 360 * (t / duration);
        cardRefs.current[r].forEach((el, i) => {
          if (!el) return;
          const visible = Math.abs(normalize(i * STEP + offset)) <= MAX_ANGLE;
          if (visible !== shown[r][i]) {
            el.style.visibility = visible ? "visible" : "hidden";
            shown[r][i] = visible;
          }
        });
      });
    };
    updateVisibility();

    let timer = 0;
    const play = () => {
      animations.forEach((a) => a && a.play());
      if (!timer && !reduceMotion) timer = setInterval(updateVisibility, 120);
    };
    const pause = () => {
      animations.forEach((a) => a && a.pause());
      clearInterval(timer);
      timer = 0;
    };

    // Pause everything when the section is off screen
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play();
      else pause();
    });
    io.observe(hero);

    return () => {
      io.disconnect();
      pause();
      animations.forEach((a) => a && a.cancel());
      window.removeEventListener("resize", fit);
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
    <section className="ch-hero" id="projects" ref={heroRef}>
      <div className="ch-wall" ref={wallRef} aria-hidden="true">
        <div className="ch-scene">
          {rings.map((ring, r) => (
            <div key={r} className="ch-ring" ref={(el) => (ringRefs.current[r] = el)}>
              {ring.map((p, i) => (
                <div
                  key={i}
                  className="ch-card"
                  style={{
                    "--card-bg": p.color,
                    transform: `translateY(${ROWS[r].y}px) rotateY(${i * STEP}deg) translateZ(-${RADIUS}px)`,
                  }}
                  ref={(el) => (cardRefs.current[r][i] = el)}
                >
                  {p.image ? (
                    <img src={p.image} alt="" loading="lazy" decoding="async" draggable="false" />
                  ) : (
                    <span className="ch-card-name">{p.title}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
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
