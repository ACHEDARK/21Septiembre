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

  let width = 0, height = 0, frame = 0, lastPoint = null, lastFrame = 0;
  const particles = [];
  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const draw = (timestamp) => {
    const delta = Math.min((timestamp - (lastFrame || timestamp)) / 16.67, 2);
    lastFrame = timestamp;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";
    for (let index = particles.length - 1; index >= 0; index--) {
      const particle = particles[index];
      const progress = (timestamp - particle.born) / particle.life;
      if (progress >= 1) { particles.splice(index, 1); continue; }
      particle.x += particle.vx * delta; particle.y += particle.vy * delta;
      const fadeIn = Math.min(progress * 7, 1);
      const fadeOut = Math.pow(1 - progress, 1.65);
      const alpha = fadeIn * fadeOut * particle.opacity;
      const twinkle = 0.82 + Math.sin(timestamp / particle.twinkleSpeed + particle.phase) * 0.18;
      const radius = particle.size * (0.82 + progress * 0.28);
      const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius * 5.5);
      glow.addColorStop(0, "rgba(255, 239, 196, " + (alpha * twinkle * 0.62) + ")");
      glow.addColorStop(0.24, "rgba(245, 211, 139, " + (alpha * twinkle * 0.25) + ")");
      glow.addColorStop(1, "rgba(245, 211, 139, 0)");
      context.fillStyle = glow;
      context.beginPath(); context.arc(particle.x, particle.y, radius * 5.5, 0, Math.PI * 2); context.fill();
      context.fillStyle = "rgba(255, 247, 224, " + (alpha * twinkle * 0.82) + ")";
      context.beginPath(); context.arc(particle.x, particle.y, Math.max(0.55, radius * 0.58), 0, Math.PI * 2); context.fill();
    }
    context.globalCompositeOperation = "source-over";
    if (particles.length) frame = requestAnimationFrame(draw); else { frame = 0; lastFrame = 0; }
  };
  const emit = (x, y, directionX, directionY, density = 1) => {
    const angle = Math.random() * Math.PI * 2;
    const spread = 2 + Math.random() * 9;
    const life = 850 + Math.random() * 650;
    particles.push({
      x:x + Math.cos(angle) * spread, y:y + Math.sin(angle) * spread,
      vx:-directionX * (0.12 + Math.random() * 0.2) + (Math.random() - 0.5) * 0.24,
      vy:-directionY * (0.12 + Math.random() * 0.2) + (Math.random() - 0.5) * 0.24,
      size:(0.9 + Math.random() * 2.4) * density,
      opacity:0.46 + Math.random() * 0.4, born:performance.now(), life,
      phase:Math.random() * Math.PI * 2, twinkleSpeed:190 + Math.random() * 280,
    });
    if (particles.length > 180) particles.splice(0, particles.length - 180);
    if (!frame) frame = requestAnimationFrame(draw);
  };

  resize(); window.addEventListener("resize", resize, { passive:true });
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    if (!lastPoint) { lastPoint = { x:event.clientX, y:event.clientY }; emit(event.clientX, event.clientY, 0, 0, 1.15); return; }
    const dx = event.clientX - lastPoint.x, dy = event.clientY - lastPoint.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 3) return;
    const steps = Math.ceil(distance / 8);
    for (let step = 1; step <= steps; step++) {
      const ratio = step / steps;
      const x = lastPoint.x + dx * ratio, y = lastPoint.y + dy * ratio;
      emit(x, y, dx / distance, dy / distance);
      if (Math.random() > 0.43) emit(x, y, dx / distance, dy / distance, 0.55);
    }
    lastPoint = { x:event.clientX, y:event.clientY };
  }, { passive:true });
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
