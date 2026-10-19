import { celebrations, getDateStatus, isDeveloperPreview } from "./special-dates.js";

const list = document.querySelector("#celebration-list");
const count = document.querySelector("#memory-count");
const cards = new Map();
const toneColors = {
  sunflower: "#dfbc63",
  winter: "#8fc2b3",
  midnight: "#b2a3e7",
  rose: "#e59cac",
  birthday: "#cb9dda",
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
    near: "A pocos días",
    week: "Esta semana",
    eve: "Mañana",
    today: "Hoy",
  }[stage];
}

function updateSeasonalMood(statuses) {
  const upcoming = [...statuses].sort((a, b) => {
    const aTime = a.status.unlocked ? -1 : a.status.remaining;
    const bTime = b.status.unlocked ? -1 : b.status.remaining;
    return aTime - bTime;
  })[0];
  const stage = seasonalStage(upcoming.status);
  const nextDay = document.querySelector("#next-day");
  const nextMonth = document.querySelector("#next-month");
  const nextTitle = document.querySelector("#next-title");
  const nextLabel = document.querySelector("#next-label");
  if (nextDay && nextMonth && nextTitle && nextLabel) {
    nextDay.textContent = String(upcoming.celebration.day).padStart(2, "0");
    nextMonth.textContent = new Intl.DateTimeFormat("es", { month: "short" })
      .format(new Date(2026, upcoming.celebration.month - 1, 1))
      .replace(".", "")
      .toUpperCase();
    nextTitle.textContent = upcoming.celebration.title;
    const daysLeft = Math.ceil(upcoming.status.remaining / 86400000);
    nextLabel.textContent = upcoming.status.unlocked
      ? "Ya puedes abrir esta sorpresa"
      : daysLeft <= 1
        ? "Llega mañana"
        : `Faltan ${daysLeft} días para abrirla`;
  }
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
  if (unlocked) {
    message.textContent = "Disponible hoy";
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
    message.textContent = "Bloqueado para visitantes";
    const preview = document.createElement("a");
    preview.className = "card-action preview-action";
    preview.href = previewPath(card.celebration);
    preview.textContent = "Ver vista previa";
    entry.replaceChildren(preview);
    return;
  }

  message.textContent = "Esperando su momento";
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
      : celebration.id === "ano-nuevo"
        ? "/ano-nuevo.html"
    : `/experiencia.html?celebration=${encodeURIComponent(celebration.id)}`;
}

function initCardEffects() {
  const pointer = matchMedia("(pointer: fine)").matches;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!pointer || reducedMotion) return;

  document.querySelectorAll(".memory-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      card.style.setProperty("--tilt-x", `${(0.5 - y) * 3}deg`);
      card.style.setProperty("--tilt-y", `${(x - 0.5) * 3}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

function initCursorGlitter() {
  const canvas = document.querySelector("#cursor-glitter");
  const context = canvas?.getContext("2d");
  if (!context || !matchMedia("(pointer: fine)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let width = 0;
  let height = 0;
  let frame = 0;
  let previous = null;
  const particles = [];
  const colors = ["#f3ead6", "#bfd5cc", "#dfbdc4"];
  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const draw = () => {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";
    for (let index = particles.length - 1; index >= 0; index--) {
      const particle = particles[index];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.97;
      particle.vy *= 0.97;
      particle.life -= particle.decay;
      if (particle.life <= 0) {
        particles.splice(index, 1);
        continue;
      }
      const alpha = Math.min(1, particle.life * 1.35);
      const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 3.8);
      glow.addColorStop(0, `${particle.color}${Math.round(alpha * 95).toString(16).padStart(2, "0")}`);
      glow.addColorStop(1, `${particle.color}00`);
      context.fillStyle = glow;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius * 3.8, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = `${particle.color}${Math.round(alpha * 155).toString(16).padStart(2, "0")}`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius * alpha, 0, Math.PI * 2);
      context.fill();
      if (particle.radius > 2.8 && particle.life > .5) {
        context.globalAlpha = alpha * .26;
        context.strokeStyle = particle.color;
        context.lineWidth = .45;
        context.beginPath();
        context.moveTo(particle.x - particle.radius * 1.5, particle.y);
        context.lineTo(particle.x + particle.radius * 1.5, particle.y);
        context.moveTo(particle.x, particle.y - particle.radius * 1.5);
        context.lineTo(particle.x, particle.y + particle.radius * 1.5);
        context.stroke();
        context.globalAlpha = 1;
      }
    }
    context.globalCompositeOperation = "source-over";
    if (particles.length) frame = requestAnimationFrame(draw);
    else frame = 0;
  };
  const addParticle = (x, y) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = .25 + Math.random() * 1.2;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - .35,
      radius: .65 + Math.random() * 1.2,
      life: .6 + Math.random() * .25,
      decay: .025 + Math.random() * .015,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
    if (particles.length > 70) particles.splice(0, particles.length - 70);
    if (!frame) frame = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    if (!previous || Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 7) {
      addParticle(event.clientX, event.clientY);
      if (Math.random() > .58) addParticle(event.clientX + (Math.random() - .5) * 7, event.clientY + (Math.random() - .5) * 7);
      previous = { x: event.clientX, y: event.clientY };
    }
  }, { passive: true });
}

function render() {
  const now = new Date();
  count.textContent = `${celebrations.length} recuerdos`;

  if (!cards.size) {
    const statuses = [];
    list.replaceChildren(
      ...celebrations.map((celebration, index) => {
        const status = getDateStatus(celebration, now);
        const stage = seasonalStage(status);
        statuses.push({ celebration, status });
        const article = document.createElement("article");
        article.className = "memory-card";
        article.style.setProperty("--card-index", index);
        article.dataset.tone = celebration.tone;
        article.dataset.locked = String(!status.unlocked);
        article.dataset.proximity = stage;
        const monthShort = new Intl.DateTimeFormat("es", { month: "short" })
          .format(new Date(2026, celebration.month - 1, 1))
          .replace(".", "")
          .toUpperCase();
        article.innerHTML = `<div class="card-top"><span class="card-calendar" aria-hidden="true"><b>${monthShort}</b><strong>${String(celebration.day).padStart(2, "0")}</strong></span><span class="card-date-group"><span class="card-date">${celebration.date}</span><span class="card-season">${stageLabel(stage)}</span></span></div><div class="card-info"><h3 class="card-title">${celebration.title}</h3><p class="card-description">${celebration.description}</p></div><div class="card-bottom"><span class="card-status"></span><span class="card-countdown"></span><span class="card-entry"></span></div>`;

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
initCardEffects();
initCursorGlitter();
window.setInterval(render, 1000);
