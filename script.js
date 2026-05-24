// portfolio — Ayush Kumar

/* ---------- clock ---------- */
function tickClock() {
  const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  document.querySelectorAll("[data-clock]").forEach(el => el.textContent = t + " IST");
}
tickClock();
setInterval(tickClock, 30000);
