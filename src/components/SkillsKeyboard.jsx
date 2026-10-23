import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { skills } from "../data/skills";
import "./SkillsKeyboard.css";

const COLS = 6;
const PITCH = 1.08; // distance between keys
const START_INDEX = 3; // skill shown before any key is hovered
const COMPACT_WIDTH = 700; // below this width: phone layout

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function fitText(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `700 ${size}px "Inter Tight", system-ui, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 20) {
    size -= 4;
    ctx.font = `700 ${size}px "Inter Tight", system-ui, sans-serif`;
  }
}

// Top of a keycap: the label, or an icon with a small label under it
function keyTexture(label, icon) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const drawLabel = (y, size) => {
    fitText(ctx, label, 210, size);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 128, y);
  };

  drawLabel(136, 104);

  if (icon) {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, 256, 256);
      const box = 140;
      const scale = Math.min(box / img.width, box / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, 128 - w / 2, 98 - h / 2, w, h);
      drawLabel(208, 36);
      tex.needsUpdate = true;
    };
    img.src = icon;
  }

  return tex;
}

export default function SkillsKeyboard() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(START_INDEX);
  const [visibleText, setVisibleText] = useState(true);
  const [compact, setCompact] = useState(false);
  const [touch] = useState(() => window.matchMedia("(hover: none)").matches);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const rows = Math.ceil(skills.length / COLS);

    // Renderer, scene, camera
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#060608");
    const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 200);

    // Lights
    scene.add(new THREE.HemisphereLight("#ffffff", "#1a1a24", 2.6));
    const sun = new THREE.DirectionalLight("#ffffff", 3.6);
    sun.position.set(-5, 12, -3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
    sun.shadow.bias = -0.0008;
    scene.add(sun);
    const fill = new THREE.DirectionalLight("#ffffff", 1.1);
    fill.position.set(8, 4, 6);
    scene.add(fill);

    // Keycap geometry: rounded, beveled, slightly tapered toward the top
    const keyGeo = new THREE.ExtrudeGeometry(roundedRect(0.84, 0.84, 0.17), {
      depth: 0.46,
      bevelEnabled: true,
      bevelThickness: 0.09,
      bevelSize: 0.08,
      bevelSegments: 5,
      curveSegments: 10,
    });
    const pos = keyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const t = Math.max(0, Math.min(1, pos.getZ(i) / 0.55));
      const k = 1 - 0.17 * t;
      pos.setX(i, pos.getX(i) * k);
      pos.setY(i, pos.getY(i) * k);
    }
    keyGeo.rotateX(-Math.PI / 2);
    keyGeo.computeVertexNormals();

    const labelGeo = new THREE.PlaneGeometry(0.62, 0.62);
    labelGeo.rotateX(-Math.PI / 2);

    // Base plate
    const gx = (rows - 1) * PITCH;
    const gz = (COLS - 1) * PITCH;
    const baseGeo = new THREE.ExtrudeGeometry(roundedRect(gx + 1.5, gz + 1.5, 0.4), {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    });
    baseGeo.rotateX(-Math.PI / 2);
    const baseMat = new THREE.MeshStandardMaterial({ color: "#101014", roughness: 0.7 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.3;
    base.receiveShadow = true;
    scene.add(base);

    // Keys
    const keys = [];
    const hitMeshes = [];
    const disposables = [keyGeo, labelGeo, baseGeo, baseMat];

    skills.forEach(([label, , , color, icon], i) => {
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      const group = new THREE.Group();

      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.42 });
      const cap = new THREE.Mesh(keyGeo, mat);
      cap.castShadow = true;
      cap.receiveShadow = true;
      cap.userData.index = i;

      const tex = keyTexture(label, icon);
      const labelMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.y = 0.555;
      labelMesh.rotation.y = Math.PI / 2;

      group.add(cap, labelMesh);
      group.position.set(r * PITCH - gx / 2, 3, gz / 2 - c * PITCH);
      scene.add(group);

      hitMeshes.push(cap);
      keys.push({ group, press: 0, target: 0, delay: (r + c) * 0.06 });
      disposables.push(mat, tex, labelMat);
    });

    // Interaction
    let current = START_INDEX;
    let hovered = -1;
    const timers = new Set();

    // Swap the skill text with a short fade
    const showSkill = (i) => {
      if (i === current) return;
      current = i;
      setVisibleText(false);
      const t = setTimeout(() => {
        setActive(i);
        setVisibleText(true);
        timers.delete(t);
      }, 160);
      timers.add(t);
    };

    // Mouse hover: key stays down while the cursor is on it
    const hold = (i) => {
      keys[i].target = 1;
      showSkill(i);
    };
    const release = (i) => {
      if (i >= 0) keys[i].target = 0;
    };

    // Touch tap and physical keyboard: quick press and release
    const tap = (i) => {
      keys[i].target = 1;
      showSkill(i);
      const t = setTimeout(() => {
        if (hovered !== i) keys[i].target = 0;
        timers.delete(t);
      }, 150);
      timers.add(t);
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pick = (e) => {
      const b = canvas.getBoundingClientRect();
      pointer.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(hitMeshes)[0];
      return hit ? hit.object.userData.index : -1;
    };

    const onPointerMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const i = pick(e);
      canvas.style.cursor = i >= 0 ? "pointer" : "default";
      if (i === hovered) return;
      release(hovered);
      hovered = i;
      if (i >= 0) hold(i);
    };
    const onPointerLeave = () => {
      release(hovered);
      hovered = -1;
      canvas.style.cursor = "default";
    };
    const onPointerDown = (e) => {
      if (e.pointerType === "mouse") return; // mouse already handled by hover
      const i = pick(e);
      if (i >= 0) tap(i);
    };
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerdown", onPointerDown);

    // Physical keyboard: only while the section is on screen, never while typing in a field
    let inView = false;
    const onKeyDown = (e) => {
      if (!inView || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
      const ch = e.key.toUpperCase();
      const matches = skills.map((_, i) => i).filter((i) => skills[i][0][0].toUpperCase() === ch);
      const i = matches.length
        ? matches[(matches.indexOf(current) + 1) % matches.length]
        : Math.floor(Math.random() * skills.length);
      tap(i);
    };
    window.addEventListener("keydown", onKeyDown);

    // Sizing: on phones the camera comes closer so the keyboard fills the width
    const fit = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const isCompact = w < COMPACT_WIDTH;
      setCompact(isCompact);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const d = isCompact ? 24.4 / camera.aspect : 30 / Math.min(1, camera.aspect * 1.25);
      camera.position.set(d * 0.62, d * 0.72, d * 0.62);
      if (isCompact) camera.lookAt(0, -0.25, 0);
      else camera.lookAt(0.35, -0.2, 0.35);
      camera.updateProjectionMatrix();
    };
    fit();
    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(stage);

    // Render loop runs only while visible; keys drop in the first time
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let dropStart = null;

    const loop = (now) => {
      if (dropStart === null) dropStart = now;
      const elapsed = (now - dropStart) / 1000;
      keys.forEach((k) => {
        k.press += (k.target - k.press) * 0.35;
        const a = reduceMotion ? 1 : Math.min(1, Math.max(0, (elapsed - k.delay) / 0.55));
        const drop = Math.pow(1 - a, 3) * 3;
        k.group.position.y = drop - 0.16 * k.press;
      });
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !raf) raf = requestAnimationFrame(loop);
        if (!inView && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.15 }
    );
    io.observe(section);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      io.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  const [, name, description] = skills[active];

  return (
    <section className={`sk-section ${compact ? "is-compact" : ""}`} id="skills" ref={sectionRef}>
      <header className="sk-head">
        <h2>SKILLS</h2>
        <p>{touch ? "(hint: tap a key)" : "(hint: hover a key)"}</p>
      </header>

      <div className="sk-body">
        <div className="sk-stage" ref={stageRef}>
          <canvas ref={canvasRef} className="sk-canvas" aria-hidden="true" />
        </div>
        <div className={`sk-info ${visibleText ? "is-visible" : ""}`} aria-live="polite">
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
      </div>

      {/* Same list as plain text for screen readers and search engines */}
      <ul className="sk-sr-only">
        {skills.map(([, n, d]) => (
          <li key={n}>
            {n}: {d}
          </li>
        ))}
      </ul>
    </section>
  );
}
