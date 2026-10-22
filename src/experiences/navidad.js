import { christmasConfig as content } from "../christmas-config.js";
import { createChristmasWorld } from "../christmas-world.js";
import { celebrations, getDateStatus, isDeveloperPreview } from "../special-dates.js";

const christmas = celebrations.find((item) => item.id === "navidad");
if (!christmas || (!getDateStatus(christmas).unlocked && !isDeveloperPreview())) {
  location.replace("/");
} else {
  document.body.hidden = false;
  startChristmas();
}

function startChristmas() {
  const $ = (selector) => document.querySelector(selector);
  const intro = $("#invitation");
  const experience = $("#experience");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wishWriter = createWishWriter($("#winter-moment"), $("#wish-feedback"), reducedMotion);
  createCandyCursor(reducedMotion);
  const world = createChristmasWorld(
    $("#christmas-world-canvas"),
    [...Object.values(content.worldScenes), ...content.memories.map((memory) => memory.image), ...content.gifts.map((gift) => gift.image)],
    reducedMotion,
    [content.worldScenes.gifts, ...content.gifts.map((gift) => gift.image)],
  );

  const sceneObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) world?.setScene(visible.target.dataset.worldScene);
  }, { threshold: [0.25, 0.5, 0.75] });
  document.querySelectorAll("[data-world-scene]").forEach((section) => sceneObserver.observe(section));

  $("#opening-greeting").textContent = content.openingGreeting;
  $("#greeting-name").textContent = content.recipientName.trim()
    ? `Para ${content.recipientName.trim()}`
    : "Para ti";
  $("#hero-message").textContent = content.heroMessage;
  $("#hero-signoff").textContent = content.heroSignoff;
  $("#letter-message").textContent = content.letter.message;
  $("#letter-date").textContent = content.letter.greeting;
  $("#letter-signoff").textContent = content.senderName;
  $("#closing-title").textContent = content.finalMessage;
  $("#closing-signature").textContent = content.senderName;
  $("#gift-progress").textContent = `Hay ${content.gifts.length} regalos esperando.`;

  const gallery = $("#memory-gallery");
  const photoDialog = $("#photo-dialog");
  const largePhoto = $("#photo-large");
  content.memories.forEach((memory, index) => {
    const frame = document.createElement("figure");
    frame.className = "memory-frame";
    const image = document.createElement("img");
    image.className = "memory-photo";
    image.src = memory.image;
    image.alt = memory.alt;
    image.loading = "lazy";
    const open = document.createElement("button");
    open.className = "memory-open";
    open.type = "button";
    open.setAttribute("aria-label", `Ampliar postal ${index + 1}: ${memory.caption}`);
    open.addEventListener("click", () => {
      world?.setScene(memory.image, index);
      largePhoto.src = memory.image;
      largePhoto.alt = memory.alt;
      $("#photo-caption").textContent = memory.caption;
      photoDialog.showModal();
    });
    const caption = document.createElement("figcaption");
    caption.className = "memory-caption";
    caption.append(document.createTextNode(memory.caption));
    const note = document.createElement("small");
    note.textContent = memory.note;
    caption.append(note);
    frame.append(image, open, caption);
    gallery.append(frame);
  });
  photoDialog.addEventListener("click", (event) => {
    if (event.target === photoDialog) photoDialog.close();
  });

  const revealDialog = $("#reveal-dialog");
  const revealGift = (gift, index = null, source = null) => {
    $("#reveal-title").textContent = gift.title;
    $("#reveal-message").textContent = gift.message;
    $("#reveal-signoff").textContent = content.senderName;
    const origin = index === null ? null : world?.giftScreenPosition(index);
    const bounds = source?.getBoundingClientRect();
    const x = origin?.x ?? (bounds ? bounds.left + bounds.width / 2 - window.innerWidth / 2 : 0);
    const y = origin?.y ?? (bounds ? bounds.top + bounds.height / 2 - window.innerHeight / 2 : 0);
    revealDialog.style.setProperty("--gift-origin-x", `${x}px`);
    revealDialog.style.setProperty("--gift-origin-y", `${y}px`);
    revealDialog.showModal();
  };
  revealDialog.addEventListener("click", (event) => {
    if (event.target === revealDialog) revealDialog.close();
  });

  let openedGifts = 0;
  let giftRevealTimer = 0;
  const giftTable = $("#gift-table");
  const giftAnchors = [];
  content.gifts.forEach((gift, index) => {
    const button = document.createElement("button");
    button.className = "world-choice";
    button.type = "button";
    button.setAttribute("aria-label", `Abrir regalo: ${gift.title}`);
    button.setAttribute("aria-pressed", "false");
    const title = document.createElement("span");
    title.className = "gift-name";
    title.textContent = gift.title;
    const hint = document.createElement("span");
    hint.className = "gift-hint";
    hint.textContent = gift.hint;
    button.append(title, hint);
    button.addEventListener("click", () => {
      giftTable.querySelectorAll(".world-choice").forEach((choice) => choice.classList.remove("is-selected"));
      button.classList.add("is-selected");
      world?.setScene(gift.image, index + 1);
      world?.selectGift(index);
      if (!button.classList.contains("is-opened")) {
        button.classList.add("is-opened");
        button.setAttribute("aria-pressed", "true");
        openedGifts += 1;
        $("#gift-progress").textContent = `Has abierto ${openedGifts} de ${content.gifts.length} regalos.`;
      }
      if (openedGifts === content.gifts.length) {
        $("#gift-progress").textContent = "Los regalos ya están abiertos. Quedó uno más escondido.";
        $("#hidden-gift").hidden = false;
      }
      window.clearTimeout(giftRevealTimer);
      giftRevealTimer = window.setTimeout(() => revealGift(gift, index, button), reducedMotion ? 0 : 1550);
    });
    giftTable.append(button);
    giftAnchors.push(button);
  });
  world?.setGiftAnchors($("#regalos"), giftAnchors);
  $("#hidden-gift").addEventListener("click", (event) => revealGift(content.hiddenGift, null, event.currentTarget));

  const letterButton = $("#open-letter");
  const openLetter = () => {
    const paper = $("#letter-paper");
    if (!paper.hidden) return;
    paper.hidden = false;
    world?.setScene(content.worldScenes.letter);
    $("#letter-envelope").classList.add("is-open");
    letterButton.setAttribute("aria-expanded", "true");
    letterButton.textContent = "El sobre está abierto";
    letterButton.disabled = true;
    letterButton.hidden = true;
  };
  letterButton.addEventListener("click", openLetter);
  $("#reopen-letter").addEventListener("click", () => {
    $("#carta").scrollIntoView({ behavior: "smooth", block: "center" });
    openLetter();
  });

  const dateStatus = getDateStatus({
    month: content.specialDate.month,
    day: content.specialDate.day,
    firstYear: christmas.firstYear,
  });
  const days = Math.ceil(dateStatus.remaining / 86400000);
  const countdown = $("#christmas-countdown");
  if (dateStatus.unlocked) {
    countdown.textContent = "La Navidad ya llegó. Ojalá te encuentre en calma y rodeada de luz.";
  } else {
    const now = new Intl.DateTimeFormat("en", {
      timeZone: "America/Bogota", month: "numeric", day: "numeric",
    }).formatToParts(new Date());
    const parts = Object.fromEntries(now.map(({ type, value }) => [type, Number(value)]));
    const passedThisYear = parts.month > content.specialDate.month ||
      (parts.month === content.specialDate.month && parts.day > content.specialDate.day);
    countdown.textContent = passedThisYear
      ? `La Navidad de este año ya pasó. Faltan ${days} días para volver a encenderla.`
      : `Faltan ${days} días para Navidad.`;
  }

  let wishIndex = -1;
  $("#wish-button").addEventListener("click", () => {
    wishIndex = (wishIndex + 1) % content.wishes.length;
    wishWriter.write(content.wishes[wishIndex]);
    world?.setScene(content.worldScenes.winter, wishIndex + 1);
  });

  const snowToggle = $("#snow-toggle");
  if (!reducedMotion) {
    snowToggle.addEventListener("click", () => {
      const paused = snowToggle.getAttribute("aria-pressed") !== "true";
      world?.setSnowPaused(paused);
      snowToggle.setAttribute("aria-pressed", String(paused));
      snowToggle.textContent = paused ? "Reanudar nieve" : "Pausar nieve";
    });
  } else {
    snowToggle.textContent = "Nieve desactivada";
    snowToggle.disabled = true;
    world?.setSnowPaused(true);
  }

  const audio = $("#christmas-audio");
  const audioToggle = $("#audio-toggle");
  const muteToggle = $("#mute-toggle");
  if (content.musicSrc.trim()) {
    audio.src = content.musicSrc;
    audioToggle.hidden = false;
    muteToggle.hidden = false;
    audioToggle.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
          audioToggle.textContent = "Pausar música";
          audioToggle.setAttribute("aria-pressed", "true");
        } catch {
          audioToggle.textContent = "No se pudo reproducir";
          audioToggle.disabled = true;
        }
      } else {
        audio.pause();
        audioToggle.textContent = "Escuchar música";
        audioToggle.setAttribute("aria-pressed", "false");
      }
    });
    muteToggle.addEventListener("click", () => {
      audio.muted = !audio.muted;
      muteToggle.textContent = audio.muted ? "Activar sonido" : "Silenciar";
      muteToggle.setAttribute("aria-pressed", String(audio.muted));
    });
    audio.addEventListener("error", () => {
      audioToggle.textContent = "Música no disponible";
      audioToggle.disabled = true;
    });
  }

  $("#open-experience").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (button.disabled) return;
    button.disabled = true;
    const ceremony = $("#christmas-ceremony");
    const worldElement = $("#christmas-world");
    ceremony.hidden = false;
    ceremony.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-ceremony");
    intro.classList.add("is-ceremony");
    worldElement.classList.add("is-ceremony");
    requestAnimationFrame(() => ceremony.classList.add("is-active"));
    const onCeremonyState = (state) => {
      if (state === "MESSAGE_REVEAL") {
        ceremony.classList.add("has-message");
        $("#ceremony-copy").classList.add("is-shown");
      }
      if (state === "GIFT_SECTION") {
        world?.setScene(content.worldScenes.gifts);
        experience.hidden = false;
        requestAnimationFrame(() => experience.classList.add("is-visible"));
      }
    };
    await (world?.playGreeting(onCeremonyState) ?? new Promise((resolve) => {
      window.setTimeout(() => { onCeremonyState("MESSAGE_REVEAL"); }, reducedMotion ? 900 : 7000);
      window.setTimeout(() => { onCeremonyState("GIFT_SECTION"); resolve(); }, reducedMotion ? 1600 : 9000);
    }));

    world?.endGreeting();
    worldElement.classList.remove("is-ceremony");
    document.body.classList.remove("is-ceremony");
    ceremony.classList.add("is-leaving");
    intro.classList.add("is-leaving");
    document.body.classList.add("is-entered");
    world?.setScene(content.worldScenes.gifts);
    requestAnimationFrame(() => {
      experience.classList.add("is-visible");
      $("#regalos").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
    window.setTimeout(() => {
      intro.hidden = true;
      ceremony.hidden = true;
      ceremony.setAttribute("aria-hidden", "true");
      ceremony.classList.remove("is-active", "is-leaving", "has-message");
      intro.classList.remove("is-ceremony");
      $("#gift-title").setAttribute("tabindex", "-1");
      $("#gift-title").focus({ preventScroll: true });
    }, reducedMotion ? 0 : 760);
  });
}

function createWishWriter(section, liveText, reducedMotion) {
  const canvas = document.createElement("canvas");
  canvas.className = "wish-sky-canvas";
  canvas.setAttribute("aria-hidden", "true");
  section.prepend(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });
  const points = [];
  let frame = 0;
  let started = 0;
  let stopped = true;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let textLines = [];
  let textLeft = 0;
  let textTop = 0;
  let textFont = "";
  let textLineHeight = 0;

  const resize = () => {
    const bounds = section.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
  };
  const observer = new ResizeObserver(resize);
  observer.observe(section);
  resize();

  const draw = (time) => {
    frame = 0;
    if (stopped) return;
    const elapsed = time - started;
    const progress = reducedMotion ? 1 : Math.min(1, elapsed / 1900);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    const twinkle = (time) => .82 + Math.sin(time / 380) * .15;
    for (const point of points) {
      const delay = point.delay;
      const local = reducedMotion ? 1 : Math.max(0, Math.min(1, (progress - delay) / (1 - delay * .65)));
      const p = 1 - Math.pow(1 - local, 3);
      const x = point.fromX + (point.x - point.fromX) * p;
      const y = point.fromY + (point.y - point.fromY) * p;
      const alpha = (local > 0 ? .86 : 0) * twinkle(time + point.phase);
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      ctx.globalAlpha *= .62;
      ctx.shadowBlur = point.r * 1.45;
      ctx.shadowColor = "#f7d88e";
      ctx.fillStyle = point.r > 1.1 ? "#fff5cf" : "#f6cf79";
      ctx.beginPath();
      ctx.arc(x, y, point.r * (.72 + .28 * twinkle(time + point.phase)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (progress > .72) {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.globalAlpha = Math.min(1, (progress - .72) / .28);
      ctx.font = textFont;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff0c6";
      ctx.shadowColor = "#f6d987";
      ctx.shadowBlur = 2;
      textLines.forEach((line, index) => ctx.fillText(line, textLeft, textTop + index * textLineHeight));
      ctx.restore();
    }
    if (progress < 1) frame = requestAnimationFrame(draw);
    else stopped = true;
  };

  return {
    write(message) {
      liveText.textContent = message;
      resize();
      points.length = 0;
      const bounds = section.getBoundingClientRect();
      const textBounds = liveText.getBoundingClientRect();
      const left = textBounds.left - bounds.left;
      const top = textBounds.top - bounds.top;
      const maxWidth = Math.min(textBounds.width || 570, width - left - 20);
      const fontSize = Math.min(22, Math.max(18, parseFloat(getComputedStyle(liveText).fontSize) || 18));
      const lineHeight = fontSize * 1.55;
      const measure = document.createElement("canvas").getContext("2d");
      const fontFamily = getComputedStyle(liveText).fontFamily;
      const font = `italic ${fontSize}px ${fontFamily}`;
      measure.font = font;
      const lines = [];
      let line = "";
      for (const word of message.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (line && measure.measureText(next).width > maxWidth) {
          lines.push(line);
          line = word;
        } else line = next;
      }
      if (line) lines.push(line);
      const raster = document.createElement("canvas");
      raster.width = canvas.width;
      raster.height = canvas.height;
      const rasterCtx = raster.getContext("2d", { willReadFrequently: true });
      rasterCtx.scale(dpr, dpr);
      rasterCtx.fillStyle = "#fff";
      rasterCtx.textAlign = "left";
      rasterCtx.textBaseline = "top";
      rasterCtx.font = font;
      textLines = lines;
      textLeft = left;
      textTop = top + (lineHeight - fontSize) / 2;
      textLineHeight = lineHeight;
      textFont = font;
      lines.forEach((text, index) => rasterCtx.fillText(text, textLeft, textTop + index * lineHeight));
      const pixels = rasterCtx.getImageData(0, 0, raster.width, raster.height).data;
      const stride = Math.max(1, Math.round(1.35 * dpr));
      for (let py = 0; py < raster.height; py += stride) {
        for (let px = 0; px < raster.width; px += stride) {
          if (pixels[(py * raster.width + px) * 4 + 3] > 90 && Math.random() > .09) {
            const x = px / dpr;
            const y = py / dpr;
            points.push({ x, y, fromX: x + (Math.random() - .5) * 36, fromY: y + 24 + Math.random() * 42,
              delay: reducedMotion ? 0 : Math.min(.68, (x - left) / Math.max(maxWidth, 1) * .6),
              r: 1.55 + Math.random() * .75, phase: Math.random() * 2000 });
          }
        }
      }
      stopped = false;
      started = performance.now();
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    },
  };
}

function createCandyCursor(reducedMotion) {
  if (reducedMotion || !matchMedia("(pointer: fine)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.className = "candy-cursor";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  const ctx = canvas.getContext("2d");
  const particles = [];
  const palette = [[246, 212, 137], [224, 127, 133], [166, 209, 190], [255, 242, 213]];
  let frame = 0, lastPoint = null, lastFrame = 0;
  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });
  const draw = (timestamp) => {
    frame = 0;
    const delta = Math.min((timestamp - (lastFrame || timestamp)) / 16.67, 2);
    lastFrame = timestamp;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = "lighter";
    for (let index = particles.length - 1; index >= 0; index--) {
      const particle = particles[index];
      const progress = (timestamp - particle.born) / particle.life;
      if (progress >= 1) { particles.splice(index, 1); continue; }
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      const alpha = Math.min(progress * 7, 1) * Math.pow(1 - progress, 1.65) * particle.opacity;
      const twinkle = .84 + Math.sin(timestamp / particle.twinkleSpeed + particle.phase) * .16;
      const radius = particle.size * (.82 + progress * .28);
      const [red, green, blue] = particle.color;
      const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius * 5.5);
      glow.addColorStop(0, `rgba(${red},${green},${blue},${alpha * twinkle * .58})`);
      glow.addColorStop(.24, `rgba(${red},${green},${blue},${alpha * twinkle * .23})`);
      glow.addColorStop(1, `rgba(${red},${green},${blue},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(particle.x, particle.y, radius * 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,248,232,${alpha * twinkle * .78})`;
      ctx.beginPath(); ctx.arc(particle.x, particle.y, Math.max(.55, radius * .55), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    if (particles.length) frame = requestAnimationFrame(draw);
    else { frame = 0; lastFrame = 0; }
  };
  const emit = (x, y, directionX, directionY, density = 1) => {
    const angle = Math.random() * Math.PI * 2;
    const spread = 2 + Math.random() * 9;
    particles.push({
      x: x + Math.cos(angle) * spread, y: y + Math.sin(angle) * spread,
      vx: -directionX * (.12 + Math.random() * .2) + (Math.random() - .5) * .24,
      vy: -directionY * (.12 + Math.random() * .2) + (Math.random() - .5) * .24,
      size: (.9 + Math.random() * 2.4) * density, opacity: .46 + Math.random() * .4,
      born: performance.now(), life: 900 + Math.random() * 750, phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 190 + Math.random() * 280, color: palette[Math.floor(Math.random() * palette.length)],
    });
    if (particles.length > 180) particles.splice(0, particles.length - 180);
    if (!frame) frame = requestAnimationFrame(draw);
  };
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    if (!lastPoint) { lastPoint = { x: event.clientX, y: event.clientY }; emit(event.clientX, event.clientY, 0, 0, 1.1); return; }
    const dx = event.clientX - lastPoint.x, dy = event.clientY - lastPoint.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 3) return;
    const steps = Math.ceil(distance / 8);
    for (let step = 1; step <= steps; step++) {
      const ratio = step / steps;
      const x = lastPoint.x + dx * ratio, y = lastPoint.y + dy * ratio;
      emit(x, y, dx / distance, dy / distance);
      if (Math.random() > .43) emit(x, y, dx / distance, dy / distance, .55);
    }
    lastPoint = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { particles.length = 0; lastPoint = null; lastFrame = 0; if (frame) cancelAnimationFrame(frame); frame = 0; }
  });
}
