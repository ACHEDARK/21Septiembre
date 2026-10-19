import { celebrations, getDateStatus, TIME_ZONE } from "./special-dates.js";

const list = document.querySelector("#celebration-list");
const count = document.querySelector("#memory-count");
const formatter = new Intl.DateTimeFormat("es-CO", {
  timeZone: TIME_ZONE,
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const countdown = (milliseconds) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${days} d · ${String(hours).padStart(2, "0")} h · ${String(minutes).padStart(2, "0")} m · ${String(remainder).padStart(2, "0")} s`;
};

const cards = new Map();

function render() {
  const now = new Date();
  count.textContent = `${celebrations.length} recuerdos`;
  if (!cards.size) {
    list.replaceChildren(
      ...celebrations.map((celebration) => {
      const status = getDateStatus(celebration, now);
      const article = document.createElement("article");
      article.className = "memory-card";
      article.dataset.tone = celebration.tone;
      article.dataset.locked = String(!status.unlocked);
      article.innerHTML = `<div class="card-top"><span class="card-symbol" aria-hidden="true">${celebration.symbol}</span><span class="card-date">${celebration.date}</span></div><h3 class="card-title">${celebration.title}</h3><p class="card-description">${celebration.description}</p><div class="card-bottom"><span class="card-status"><i class="status-dot" aria-hidden="true"></i></span><span class="card-countdown"></span><span class="card-entry"></span></div>`;
      const message = article.querySelector(".card-status");
      const timer = article.querySelector(".card-countdown");
      const entry = article.querySelector(".card-entry");
      cards.set(celebration.id, { article, message, timer, entry, celebration });
      if (status.unlocked) {
        message.append("Disponible para volver");
        const link = document.createElement("a");
        link.className = "card-action";
        link.href = celebration.path;
        link.textContent = "Abrir recuerdo";
        entry.append(link);
      } else {
        message.append("Esperando su momento");
        timer.textContent = countdown(status.remaining);
        timer.setAttribute("aria-label", `Tiempo restante: ${timer.textContent}`);
        entry.innerHTML = '<span class="card-locked">Este pequeño detalle todavía está esperando su momento.</span>';
      }
      return article;
      }),
    );
    return;
  }

  for (const { article, message, timer, entry, celebration } of cards.values()) {
    const status = getDateStatus(celebration, now);
    if (status.unlocked && article.dataset.locked === "true") {
      article.dataset.locked = "false";
      const dot = document.createElement("i");
      dot.className = "status-dot";
      dot.setAttribute("aria-hidden", "true");
      message.replaceChildren(dot, "Disponible para volver");
      timer.textContent = "";
      timer.removeAttribute("aria-label");
      const link = document.createElement("a");
      link.className = "card-action";
      link.href = celebration.path;
      link.textContent = "Abrir recuerdo";
      entry.replaceChildren(link);
    } else if (!status.unlocked && article.dataset.locked === "false") {
      article.dataset.locked = "true";
      message.replaceChildren();
      const dot = document.createElement("i");
      dot.className = "status-dot";
      dot.setAttribute("aria-hidden", "true");
      message.append(dot, "Esperando su momento");
      const locked = document.createElement("span");
      locked.className = "card-locked";
      locked.textContent = "Este pequeño detalle todavía está esperando su momento.";
      entry.replaceChildren(locked);
    } else if (!status.unlocked) {
      timer.textContent = countdown(status.remaining);
      timer.setAttribute("aria-label", `Tiempo restante: ${timer.textContent}`);
    }
  }
}

render();
window.setInterval(render, 1000);
