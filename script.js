// portfolio — Ayush Kumar

const { gsap } = window;

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
}
