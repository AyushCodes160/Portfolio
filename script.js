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
