// portfolio — Ayush Kumar
import * as THREE from "three";

const { gsap } = window;
gsap.registerPlugin(window.ScrollTrigger);

/* ---------- theme toggle ---------- */
const themeBtn = document.querySelector("[data-theme-toggle]");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

/* ---------- loader ---------- */
const loader = document.querySelector("[data-loader]");
const countEl = document.querySelector("[data-count]");
const barEl = document.querySelector("[data-bar]");
const statusEl = document.querySelector("[data-loader-status]");

if (loader) {
  const tl = gsap.timeline({ onComplete: bootSite });
  tl.to({ v: 0 }, {
    v: 100, duration: 2.2, ease: "power2.inOut",
    onUpdate() {
      const v = Math.round(this.targets()[0].v);
      countEl.textContent = String(v).padStart(3, "0");
      barEl.style.width = v + "%";
      statusEl.textContent = v < 30 ? "loading assets" : v < 70 ? "warming gpu" : v < 95 ? "polishing" : "ready";
    }
  })
  .to(loader, { yPercent: -100, duration: 1.0, ease: "expo.inOut" }, "+=.15")
  .set(loader, { display: "none" });
} else {
  bootSite();
}

/* ---------- smooth scroll ---------- */
const lenis = new window.Lenis({ duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
lenis.on("scroll", window.ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- custom cursor ---------- */
const cursor = document.querySelector("[data-cursor]");
const cx = { v: window.innerWidth / 2 };
const cy = { v: window.innerHeight / 2 };
let tx = cx.v, ty = cy.v, lastTx = tx, lastTy = ty, mvx = 0, mvy = 0;
window.addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; });
gsap.ticker.add(() => {
  cx.v += (tx - cx.v) * 0.18;
  cy.v += (ty - cy.v) * 0.18;
  if (cursor) cursor.style.transform = `translate(${cx.v}px,${cy.v}px)`;
  mvx = tx - lastTx; mvy = ty - lastTy;
  lastTx = tx; lastTy = ty;
});

document.querySelectorAll("a, button, [data-magnet]").forEach(el => {
  el.addEventListener("mouseenter", () => cursor && cursor.classList.add("is-hover"));
  el.addEventListener("mouseleave", () => cursor && cursor.classList.remove("is-hover"));
});

/* ---------- magnet links ---------- */
document.querySelectorAll("[data-magnet]").forEach(el => {
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: .5, ease: "power3.out" });
  });
  el.addEventListener("mouseleave", () => {
    gsap.to(el, { x: 0, y: 0, duration: .6, ease: "elastic.out(1, .4)" });
  });
});

/* ---------- clock ---------- */
function tickClock() {
  const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  document.querySelectorAll("[data-clock]").forEach(el => el.textContent = t + " IST");
}
tickClock();
setInterval(tickClock, 30000);

function bootSite() {
  gsap.from(".hero__title .word__inner", { yPercent: 110, duration: 1.1, stagger: 0.06, ease: "expo.out" });
  gsap.from(".hero__top, .hero__foot", { opacity: 0, y: 14, duration: 1, delay: .35, stagger: .12, ease: "power3.out" });
  gsap.from(".nav > *", { opacity: 0, y: -10, duration: .9, delay: .2, stagger: .08, ease: "power3.out" });

  const track = document.querySelector(".marquee__track");
  if (track) gsap.to(track, { xPercent: -50, duration: 28, repeat: -1, ease: "none" });

  gsap.utils.toArray(".reveal").forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" } });
  });

  gsap.utils.toArray(".proj").forEach(el => {
    gsap.from(el, { opacity: 0, y: 30, duration: .9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  gsap.utils.toArray(".about__label").forEach(el => {
    gsap.from(el, { opacity: 0, y: 12, duration: .8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  gsap.utils.toArray(".contact__big .word__inner").forEach((el, i) => {
    gsap.fromTo(el, { yPercent: 110 }, {
      yPercent: 0, duration: 1.1, ease: "expo.out", delay: i * .05,
      scrollTrigger: { trigger: ".contact__big", start: "top 75%" }
    });
  });

  initHeroReveal();
  initThree();
  initWorkHover();
}

/* ---------- hero cursor spotlight reveal ---------- */
function initHeroReveal() {
  const wrap = document.querySelector(".hero__title-wrap");
  const reveal = document.querySelector("[data-headline-reveal]");
  if (!wrap || !reveal) return;
  gsap.from(".hero__title--reveal .word__inner", { yPercent: 110, duration: 1.1, stagger: 0.06, ease: "expo.out" });

  let rx = 0, ry = 0, trx = 0, tryy = 0, active = false;
  const RAD = 160;
  wrap.addEventListener("pointermove", e => {
    const r = wrap.getBoundingClientRect();
    trx = e.clientX - r.left;
    tryy = e.clientY - r.top;
    active = true;
  });
  wrap.addEventListener("pointerleave", () => { active = false; });

  gsap.ticker.add(() => {
    rx += (trx - rx) * .18;
    ry += (tryy - ry) * .18;
    const rad = active ? RAD : 0;
    reveal.style.clipPath = `circle(${rad}px at ${rx}px ${ry}px)`;
    reveal.style.webkitClipPath = `circle(${rad}px at ${rx}px ${ry}px)`;
  });
}

/* ---------- work hover WebGL preview ---------- */
function initWorkHover() {
  const host = document.querySelector("[data-hover-preview]");
  const canvas = document.querySelector("[data-hover-canvas]");
  const list = document.querySelector("[data-work-list]");
  if (!host || !canvas || !list) return;

  const W = 360, H = 260;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H, false);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  camera.position.z = 1;

  const texLoader = new THREE.TextureLoader();
  texLoader.crossOrigin = "anonymous";
  const textures = new Map();

  const uniforms = {
    uTex: { value: null },
    uTime: { value: 0 },
    uVel: { value: new THREE.Vector2() },
    uOpacity: { value: 0 },
    uAspectImg: { value: 1.33 },
    uAspectPlane: { value: W / H },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uVel;
      void main(){
        vUv = uv;
        vec3 p = position;
        p.x += sin(uv.y * 7.0 + uTime * 1.6) * uVel.x * 0.02;
        p.y += cos(uv.x * 7.0 + uTime * 1.6) * uVel.y * 0.02;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uTex;
      uniform vec2 uVel;
      uniform float uOpacity;
      uniform float uAspectImg;
      uniform float uAspectPlane;
      void main(){
        vec2 uv = vUv;
        float r = uAspectImg / uAspectPlane;
        if (r > 1.0) {
          uv.x = (uv.x - 0.5) / r + 0.5;
        } else {
          uv.y = (uv.y - 0.5) * r + 0.5;
        }
        float amt = 0.004 + min(length(uVel) * 0.0008, 0.025);
        vec4 cr = texture2D(uTex, uv + vec2(amt, 0.0));
        vec4 cg = texture2D(uTex, uv);
        vec4 cb = texture2D(uTex, uv - vec2(amt, 0.0));
        gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a) * uOpacity;
      }
    `
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 24, 16), mat);
  scene.add(mesh);

  function setTexture(url) {
    if (!url) return;
    if (textures.has(url)) {
      const t = textures.get(url);
      uniforms.uTex.value = t;
      uniforms.uAspectImg.value = (t.image.width || 4) / (t.image.height || 3);
      return;
    }
    texLoader.load(url, t => {
      t.colorSpace = THREE.SRGBColorSpace;
      textures.set(url, t);
      uniforms.uTex.value = t;
      uniforms.uAspectImg.value = (t.image.width || 4) / (t.image.height || 3);
    });
  }

  list.querySelectorAll(".proj").forEach(p => {
    const url = p.dataset.image;
    if (url) texLoader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; textures.set(url, t); });
  });

  list.querySelectorAll(".proj").forEach(p => {
    p.addEventListener("pointerenter", () => {
      setTexture(p.dataset.image);
      host.classList.add("is-on");
      gsap.to(uniforms.uOpacity, { value: 1, duration: .35, ease: "power3.out" });
    });
    p.addEventListener("pointerleave", () => {
      host.classList.remove("is-on");
      gsap.to(uniforms.uOpacity, { value: 0, duration: .25, ease: "power3.in" });
    });
  });

  let hx = -200, hy = -200;
  gsap.ticker.add(() => {
    hx += (tx - hx) * 0.12;
    hy += (ty - hy) * 0.12;
    host.style.transform = `translate(${hx}px, ${hy}px) translate(-50%, -50%)`;
    uniforms.uVel.value.set(mvx, mvy);
    uniforms.uTime.value += 0.016;
    renderer.render(scene, camera);
  });
}

/* ---------- three.js — stack scene ---------- */
function initThree() {
  const canvas = document.getElementById("three-canvas");
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  function colors() {
    const dark = document.documentElement.getAttribute("data-theme") !== "light";
    return {
      shell: dark ? 0xededea : 0x121211,
      accent: dark ? 0xc4ff3d : 0x1a3df7,
      pts: dark ? 0xededea : 0x121211,
    };
  }
  let c = colors();

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 1),
    new THREE.MeshBasicMaterial({ color: c.shell, wireframe: true, transparent: true, opacity: .85 })
  );
  scene.add(shell);
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(.55, 0),
    new THREE.MeshBasicMaterial({ color: c.accent, wireframe: true })
  );
  scene.add(core);

  const ptsGeo = new THREE.BufferGeometry();
  const N = 220;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 1.9 + Math.random() * .8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  ptsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(ptsGeo, new THREE.PointsMaterial({ color: c.pts, size: .015, transparent: true, opacity: .6 }));
  scene.add(pts);

  function applyTheme() {
    c = colors();
    shell.material.color.setHex(c.shell);
    core.material.color.setHex(c.accent);
    pts.material.color.setHex(c.pts);
  }
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  let dragging = false, lx = 0, ly = 0, rx = 0, ry = 0, trx = 0, tryy = 0;
  canvas.addEventListener("pointerdown", e => { dragging = true; lx = e.clientX; ly = e.clientY; });
  window.addEventListener("pointerup", () => dragging = false);
  window.addEventListener("pointermove", e => {
    if (!dragging) return;
    trx += (e.clientY - ly) * .005;
    tryy += (e.clientX - lx) * .005;
    lx = e.clientX; ly = e.clientY;
  });

  let mx = 0, my = 0;
  canvas.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - .5) * 2;
    my = ((e.clientY - r.top) / r.height - .5) * 2;
  });

  const clock = new THREE.Clock();
  function loop() {
    const t = clock.getElapsedTime();
    rx += (trx - rx) * .08;
    ry += (tryy - ry) * .08;
    shell.rotation.x = rx + t * .12 + my * .25;
    shell.rotation.y = ry + t * .18 + mx * .25;
    core.rotation.x = -t * .35;
    core.rotation.y = t * .25;
    pts.rotation.y = t * .04;
    pts.rotation.x = t * .02;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
}
