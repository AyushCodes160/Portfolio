// portfolio — Ayush Kumar
import * as THREE from "three";

const { gsap } = window;
gsap.registerPlugin(window.ScrollTrigger);

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
let tx = cx.v, ty = cy.v;
window.addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; });
gsap.ticker.add(() => {
  cx.v += (tx - cx.v) * 0.18;
  cy.v += (ty - cy.v) * 0.18;
  if (cursor) cursor.style.transform = `translate(${cx.v}px,${cy.v}px)`;
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

  initThree();
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

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 1),
    new THREE.MeshBasicMaterial({ color: 0xededea, wireframe: true, transparent: true, opacity: .85 })
  );
  scene.add(shell);
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(.55, 0),
    new THREE.MeshBasicMaterial({ color: 0xc4ff3d, wireframe: true })
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
  const pts = new THREE.Points(ptsGeo, new THREE.PointsMaterial({ color: 0xededea, size: .015, transparent: true, opacity: .6 }));
  scene.add(pts);

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
