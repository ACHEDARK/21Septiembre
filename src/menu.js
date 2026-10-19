import { celebrations, getDateStatus, isDeveloperPreview } from "./special-dates.js";

const list = document.querySelector("#celebration-list");
const count = document.querySelector("#memory-count");
const cards = new Map();
const toneColors = {
  sunflower: "#e8d17e",
  winter: "#a9cfca",
  rose: "#e8aab9",
  birthday: "#d9b9e7",
};

const countdown = (milliseconds) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${days} d · ${String(hours).padStart(2, "0")} h · ${String(minutes).padStart(2, "0")} m · ${String(remainder).padStart(2, "0")} s`;
};

function seasonalStage(status) {
  if (status.unlocked) return "today";
  const days = Math.ceil(status.remaining / 86400000);
  if (days <= 1) return "eve";
  if (days <= 7) return "week";
  if (days <= 30) return "near";
  return "distant";
}

function stageLabel(stage) {
  return {
    distant: "",
    near: "✧ Se acerca",
    week: "✧ Esta semana",
    eve: "✧ Mañana",
    today: "✧ Hoy",
  }[stage];
}

function updateSeasonalMood(statuses) {
  const upcoming = [...statuses].sort((a, b) => {
    const aTime = a.status.unlocked ? -1 : a.status.remaining;
    const bTime = b.status.unlocked ? -1 : b.status.remaining;
    return aTime - bTime;
  })[0];
  const stage = seasonalStage(upcoming.status);
  document.body.dataset.seasonalStage = stage;
  document.body.dataset.seasonalTone = upcoming.celebration.tone;
  document.body.style.setProperty(
    "--seasonal-accent",
    toneColors[upcoming.celebration.tone] || "#ead17c",
  );
  const note = document.querySelector(".timezone-note");
  if (isDeveloperPreview()) {
    note.textContent = "Vista previa para desarrollo · todas las fechas abiertas";
    note.classList.add("preview-notice");
  }
  document.body.style.setProperty(
    "--ambient-strength",
    stage === "today"
      ? "18%"
      : stage === "eve"
        ? "15%"
        : stage === "week"
          ? "12%"
          : stage === "near"
            ? "8%"
            : "3%",
  );
}

function updateAvailability(card, unlocked) {
  const { article, message, timer, entry } = card;
  article.dataset.locked = String(!unlocked);
  const dot = document.createElement("i");
  dot.className = "status-dot";
  dot.setAttribute("aria-hidden", "true");
  if (unlocked) {
    message.replaceChildren(dot, "Disponible hoy");
    timer.textContent = "";
    timer.removeAttribute("aria-label");
    const link = document.createElement("a");
    link.className = "card-action";
    link.href = card.celebration.path;
    link.textContent = "Abrir recuerdo";
    entry.replaceChildren(link);
    return;
  }

  if (isDeveloperPreview()) {
    message.replaceChildren(dot, "Bloqueado para visitantes");
    const preview = document.createElement("a");
    preview.className = "card-action preview-action";
    preview.href = previewPath(card.celebration);
    preview.textContent = "Ver vista previa";
    entry.replaceChildren(preview);
    return;
  }

  message.replaceChildren(dot, "Esperando su momento");
  const locked = document.createElement("span");
  locked.className = "card-locked";
  locked.textContent = "Este pequeño detalle todavía está esperando su momento.";
  entry.replaceChildren(locked);
}

function previewPath(celebration) {
  if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1")
    return celebration.path;
  return celebration.id === "flores-amarillas"
    ? "/flores-amarillas.html"
    : celebration.id === "navidad"
      ? "/navidad.html"
    : `/experiencia.html?celebration=${encodeURIComponent(celebration.id)}`;
}

function render() {
  const now = new Date();
  count.textContent = `${celebrations.length} recuerdos`;

  if (!cards.size) {
    const statuses = [];
    list.replaceChildren(
      ...celebrations.map((celebration) => {
        const status = getDateStatus(celebration, now);
        const stage = seasonalStage(status);
        statuses.push({ celebration, status });
        const article = document.createElement("article");
        article.className = "memory-card";
        article.dataset.tone = celebration.tone;
        article.dataset.locked = String(!status.unlocked);
        article.dataset.proximity = stage;
        article.innerHTML = `<div class="card-top"><span class="card-symbol" aria-hidden="true">${celebration.symbol}</span><span class="card-date-group"><span class="card-date">${celebration.date}</span><span class="card-season" aria-hidden="true">${stageLabel(stage)}</span></span></div><h3 class="card-title">${celebration.title}</h3><p class="card-description">${celebration.description}</p><div class="card-bottom"><span class="card-status"><i class="status-dot" aria-hidden="true"></i></span><span class="card-countdown"></span><span class="card-entry"></span></div>`;

        const card = {
          article,
          message: article.querySelector(".card-status"),
          timer: article.querySelector(".card-countdown"),
          entry: article.querySelector(".card-entry"),
          season: article.querySelector(".card-season"),
          celebration,
        };
        cards.set(celebration.id, card);
        updateAvailability(card, status.unlocked);
        if (!status.unlocked) {
          card.timer.textContent = countdown(status.remaining);
          card.timer.setAttribute(
            "aria-label",
            `Tiempo restante: ${card.timer.textContent}`,
          );
        }
        return article;
      }),
    );
    updateSeasonalMood(statuses);
    return;
  }

  const statuses = [];
  for (const card of cards.values()) {
    const status = getDateStatus(card.celebration, now);
    const stage = seasonalStage(status);
    statuses.push({ celebration: card.celebration, status });

    if (card.article.dataset.proximity !== stage) {
      card.article.dataset.proximity = stage;
      card.season.textContent = stageLabel(stage);
    }
    if (card.article.dataset.locked !== String(!status.unlocked)) {
      updateAvailability(card, status.unlocked);
    }
    if (!status.unlocked) {
      card.timer.textContent = countdown(status.remaining);
      card.timer.setAttribute(
        "aria-label",
        `Tiempo restante: ${card.timer.textContent}`,
      );
    }
  }
  updateSeasonalMood(statuses);
}

render();
window.setInterval(render, 1000);
