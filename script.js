// portfolio — Ayush Kumar

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

/* ---------- clock ---------- */
function tickClock() {
  const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  document.querySelectorAll("[data-clock]").forEach(el => el.textContent = t + " IST");
}
tickClock();
setInterval(tickClock, 30000);

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(entries => {
  for (const en of entries) {
    if (en.isIntersecting) {
      en.target.style.transition = "opacity .6s ease, transform .6s ease";
      en.target.style.opacity = "1";
      en.target.style.transform = "translateY(0)";
      io.unobserve(en.target);
    }
  }
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ---------- smooth anchor scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
