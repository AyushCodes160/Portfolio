// portfolio — Ayush Kumar
import * as THREE from "three";

const { gsap } = window;
gsap.registerPlugin(window.ScrollTrigger);

/* ---------- view transitions ---------- */
document.addEventListener("click", e => {
  const a = e.target.closest("a[data-page-link], a[href$='.html'], a[href^='case.html']");
  if (!a) return;
  if (a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("http")) return;
  if (!document.startViewTransition) return;
  e.preventDefault();
  document.startViewTransition(() => { window.location.href = href; });
});

/* ---------- contact form ---------- */
const form = document.querySelector("[data-cform]");
if (form) {
  const status = form.querySelector("[data-cform-status]");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const action = form.getAttribute("action");
    if (action.includes("YOUR_FORM_ID")) {
      status.textContent = "Demo mode — add a Formspree ID to send.";
      status.className = "cform__status err";
      return;
    }
    status.textContent = "Sending…";
    status.className = "cform__status";
    try {
      const r = await fetch(action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (r.ok) {
        status.textContent = "Sent. Talk soon.";
        status.className = "cform__status ok";
        form.reset();
      } else {
        const j = await r.json().catch(() => ({}));
        status.textContent = (j.errors && j.errors[0] && j.errors[0].message) || "Couldn’t send. Try email.";
        status.className = "cform__status err";
      }
    } catch {
      status.textContent = "Network error. Try email.";
      status.className = "cform__status err";
    }
  });
}

/* ---------- theme toggle ---------- */
const themeBtn = document.querySelector("[data-theme-toggle]");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
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
  cx.v += (tx - cx.v) * 0.2;
  cy.v += (ty - cy.v) * 0.2;
  if (cursor) cursor.style.transform = `translate(${cx.v}px,${cy.v}px)`;
});

document.querySelectorAll("a, button, [data-magnet]").forEach(el => {
  el.addEventListener("mouseenter", () => cursor && cursor.classList.add("is-hover"));
  el.addEventListener("mouseleave", () => cursor && cursor.classList.remove("is-hover"));
});

/* ---------- magnet links (gentle) ---------- */
document.querySelectorAll("[data-magnet]").forEach(el => {
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    gsap.to(el, { x: x * 0.15, y: y * 0.15, duration: .5, ease: "power3.out" });
  });
  el.addEventListener("mouseleave", () => {
    gsap.to(el, { x: 0, y: 0, duration: .7, ease: "elastic.out(1, .5)" });
  });
});

/* ---------- clock ---------- */
function tickClock() {
  const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  document.querySelectorAll("[data-clock]").forEach(el => el.textContent = t + " IST");
}
tickClock();
setInterval(tickClock, 30000);

boot();

function boot() {
  gsap.from(".hero__title .word__inner", { yPercent: 110, duration: 1.1, stagger: 0.07, ease: "expo.out", delay: .15 });
  gsap.from(".hero__top, .hero__foot > *", { opacity: 0, y: 14, duration: 1, delay: .45, stagger: .1, ease: "power3.out" });
  gsap.from(".nav > *", { opacity: 0, y: -10, duration: .9, delay: .2, stagger: .08, ease: "power3.out" });

  const track = document.querySelector(".marquee__track");
  if (track) gsap.to(track, { xPercent: -50, duration: 38, repeat: -1, ease: "none" });

  gsap.utils.toArray(".reveal").forEach(el => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" } });
  });

  gsap.utils.toArray(".section-head").forEach(el => {
    gsap.from(el.children, { opacity: 0, y: 14, duration: .9, stagger: .08, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  gsap.utils.toArray(".proj").forEach(el => {
    gsap.from(el, { opacity: 0, y: 24, duration: .8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 92%" } });
  });

  gsap.from(".contact__big", { opacity: 0, y: 30, duration: 1.1, ease: "expo.out",
    scrollTrigger: { trigger: ".contact__big", start: "top 80%" } });

  initWorkHover();
  initThree();
}

/* ---------- work hover preview (refined) ---------- */
function initWorkHover() {
  const host = document.querySelector("[data-hover-preview]");
  const canvas = document.querySelector("[data-hover-canvas]");
  const list = document.querySelector("[data-work-list]");
  if (!host || !canvas || !list) return;

  const W = 320, H = 220;
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
    uOpacity: { value: 0 },
    uHover: { value: 0 },
    uAspectImg: { value: 1.33 },
    uAspectPlane: { value: W / H },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uHover;
      void main(){
        vUv = uv;
        vec3 p = position;
        p.x += sin(uv.y * 4.0 + uTime * 0.6) * 0.012 * uHover;
        p.y += cos(uv.x * 4.0 + uTime * 0.6) * 0.012 * uHover;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uTex;
      uniform float uOpacity;
      uniform float uHover;
      uniform float uAspectImg;
      uniform float uAspectPlane;
      void main(){
        vec2 uv = vUv;
        float r = uAspectImg / uAspectPlane;
        if (r > 1.0) { uv.x = (uv.x - 0.5) / r + 0.5; }
        else         { uv.y = (uv.y - 0.5) * r + 0.5; }
        vec4 c = texture2D(uTex, uv);
        // subtle warm tone
        c.rgb = mix(c.rgb, c.rgb * vec3(1.05, 0.98, 0.92), 0.25);
        gl_FragColor = vec4(c.rgb, c.a * uOpacity);
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
      gsap.to(uniforms.uHover, { value: 1, duration: .6, ease: "power3.out" });
    });
    p.addEventListener("pointerleave", () => {
      host.classList.remove("is-on");
      gsap.to(uniforms.uOpacity, { value: 0, duration: .25, ease: "power3.in" });
      gsap.to(uniforms.uHover, { value: 0, duration: .4, ease: "power3.in" });
    });
  });

  let hx = -200, hy = -200;
  gsap.ticker.add(() => {
    hx += (tx - hx) * 0.14;
    hy += (ty - hy) * 0.14;
    host.style.transform = `translate(${hx}px, ${hy}px) translate(-50%, -50%)`;
    uniforms.uTime.value += 0.016;
    renderer.render(scene, camera);
  });
}

/* ---------- three.js — stack scene (refined) ---------- */
function initThree() {
  const canvas = document.getElementById("three-canvas");
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 4.4);

  function colors() {
    const dark = document.documentElement.getAttribute("data-theme") !== "light";
    return {
      shell: dark ? 0xd9d9d3 : 0x16181a,
      accent: dark ? 0xd6a76a : 0x8a5a1a,
      pts: dark ? 0xa8a8a3 : 0x4f534f,
    };
  }
  let c = colors();

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.3, 1),
    new THREE.MeshBasicMaterial({ color: c.shell, wireframe: true, transparent: true, opacity: .55 })
  );
  scene.add(shell);
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(.6, 0),
    new THREE.MeshBasicMaterial({ color: c.accent, wireframe: true, transparent: true, opacity: .9 })
  );
  scene.add(core);

  const ptsGeo = new THREE.BufferGeometry();
  const N = 260;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 1.95 + Math.random() * .85;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  ptsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(ptsGeo, new THREE.PointsMaterial({ color: c.pts, size: .014, transparent: true, opacity: .55 }));
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
    shell.rotation.x = rx + t * .08 + my * .2;
    shell.rotation.y = ry + t * .12 + mx * .2;
    core.rotation.x = -t * .22;
    core.rotation.y = t * .18;
    pts.rotation.y = t * .03;
    pts.rotation.x = t * .015;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
}
