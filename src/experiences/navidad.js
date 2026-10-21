import { christmasConfig as content } from "../christmas-config.js";
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
  const revealGift = (gift) => {
    $("#reveal-title").textContent = gift.title;
    $("#reveal-message").textContent = gift.message;
    $("#reveal-signoff").textContent = content.senderName;
    revealDialog.showModal();
  };
  revealDialog.addEventListener("click", (event) => {
    if (event.target === revealDialog) revealDialog.close();
  });

  let openedGifts = 0;
  const giftTable = $("#gift-table");
  content.gifts.forEach((gift, index) => {
    const button = document.createElement("button");
    button.className = "gift-button";
    button.type = "button";
    button.setAttribute("aria-label", `Abrir regalo: ${gift.title}`);
    button.setAttribute("aria-pressed", "false");
    const box = document.createElement("span");
    box.className = "gift-box";
    box.setAttribute("aria-hidden", "true");
    const ribbon = document.createElement("span");
    ribbon.className = "gift-ribbon";
    const lid = document.createElement("span");
    lid.className = "gift-lid";
    lid.setAttribute("aria-hidden", "true");
    box.append(lid, ribbon);
    const title = document.createElement("span");
    title.className = "gift-name";
    title.textContent = gift.title;
    const hint = document.createElement("span");
    hint.className = "gift-hint";
    hint.textContent = gift.hint;
    button.append(box, title, hint);
    button.addEventListener("click", () => {
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
      revealGift(gift);
    });
    giftTable.append(button);
  });
  $("#hidden-gift").addEventListener("click", () => revealGift(content.hiddenGift));

  const letterButton = $("#open-letter");
  const openLetter = () => {
    const paper = $("#letter-paper");
    if (!paper.hidden) return;
    paper.hidden = false;
    $("#letter-envelope").classList.add("is-open");
    letterButton.setAttribute("aria-expanded", "true");
    letterButton.textContent = "El sobre está abierto";
    letterButton.disabled = true;
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
    $("#wish-feedback").textContent = content.wishes[wishIndex];
  });

  const snowfall = $("#snowfall");
  const snowToggle = $("#snow-toggle");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotion) {
    const flakes = ["✧", "·", "❄", "✦"];
    for (let index = 0; index < 34; index += 1) {
      const flake = document.createElement("span");
      flake.className = "snowflake";
      flake.textContent = flakes[index % flakes.length];
      flake.style.setProperty("--left", `${Math.random() * 100}%`);
      flake.style.setProperty("--size", `${6 + Math.random() * 9}px`);
      flake.style.setProperty("--opacity", `${0.18 + Math.random() * 0.42}`);
      flake.style.setProperty("--duration", `${15 + Math.random() * 19}s`);
      flake.style.setProperty("--delay", `${-Math.random() * 30}s`);
      snowfall.append(flake);
    }
    snowToggle.addEventListener("click", () => {
      const paused = snowfall.classList.toggle("paused");
      snowToggle.setAttribute("aria-pressed", String(paused));
      snowToggle.textContent = paused ? "Reanudar nieve" : "Pausar nieve";
    });
  } else {
    snowToggle.textContent = "Nieve desactivada";
    snowToggle.disabled = true;
    snowfall.classList.add("paused");
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

  $("#open-experience").addEventListener("click", () => {
    document.body.classList.add("is-entered");
    experience.hidden = false;
    requestAnimationFrame(() => experience.classList.add("is-visible"));
    intro.classList.add("is-leaving");
    window.setTimeout(() => {
      intro.hidden = true;
      $("#christmas-title").setAttribute("tabindex", "-1");
      $("#christmas-title").focus({ preventScroll: true });
    }, reducedMotion ? 0 : 760);
  });
}
