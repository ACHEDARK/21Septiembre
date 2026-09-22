import { CONFIG, isSpecialName, normalizeName } from "./config.js";
import { Galaxy } from "./galaxy.js";
import { AmbientAudio } from "./audio.js";
import { MusicPlayer } from "./music.js";
import { dedicationAt, dedicationDuration } from "./dedication.js";
import {
  zorayaMessages,
  friendshipMessages,
  pinguinitaMessages,
  supportNotes,
  MessageBag,
} from "./messages.js";
const $ = (id) => document.getElementById(id);
const audio = new AmbientAudio();
const music = new MusicPlayer();
let galaxy;
try {
  galaxy = new Galaxy($("universe"));
} catch (error) {
  $("error").hidden = false;
  $("error").textContent =
    "Este navegador no pudo abrir el cielo 3D. Activa la aceleración gráfica o prueba otro navegador.";
  $("entry").querySelector("button").disabled = true;
  console.warn("WebGL no disponible:", error.message);
}
let state = "intro",
  special = false,
  name = "",
  bag,
  surpriseBag,
  noteBag,
  paused = false,
  elapsed = 0,
  finalAge = 0,
  secretAge = 0,
  secretFinaleAge = 0,
  lastFrame = performance.now(),
  nextMessage = 45,
  activity = performance.now(),
  shownStep = -1,
  poemLife = 0,
  pending = null,
  transition = 0,
  lastHover = 0,
  lastTap = 0,
  messageLock = 0,
  musicCountdown = 0,
  musicAutoplayDone = false;
let secretFinale = false;
let noteOpen = false;
let activeStar = null;
const secretDescriptions = {
  heart: "una chispa que aprendió a tener forma de corazón",
  comet: "un deseo bonito cruzando el cielo",
  rain: "una lluvia de estrellas para acompañarte",
  constellation: "una señal pequeña entre las estrellas",
  note: "una luz que llegó justo a tiempo",
};
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) {
  CONFIG.autoRotate = false;
  CONFIG.cameraSpeed = 0;
}
const poem = document.querySelector(".poem");
function show(text, category = "", duration = 8, priority = false) {
  if (!priority && messageLock > 0) return false;
  pending = { text, category, duration };
  if (priority) messageLock = duration + 0.65;
  poem.classList.remove("visible");
  transition = 0.65;
  return true;
}
function next(category, priority = false) {
  if (!priority && messageLock > 0) return false;
  const message = bag.next(category);
  show(message.text, message.category, 8, priority);
  audio.chime();
  return true;
}
function wake() {
  activity = performance.now();
  $("controls").classList.remove("idle");
}
function updateSoundButton(enabled, mutedByUser = false) {
  const button = $("sound");
  const icon = $("sound-icon");
  const label = $("sound-label");
  if (!button || !icon || !label) return;
  icon.textContent = enabled || !mutedByUser ? "♫" : "🔇";
  label.textContent = enabled || !mutedByUser ? "Música" : "Silencio";
  button.classList.toggle("music-ready", !enabled && !mutedByUser);
  button.classList.toggle("is-muted", !enabled);
  button.setAttribute("aria-pressed", String(enabled));
  button.setAttribute(
    "aria-label",
    enabled ? "Desactivar música" : "Activar música",
  );
}
async function startScheduledMusic() {
  if (music.enabled || paused || state !== "exploring") return;
  try {
    await music.play();
    updateSoundButton(true);
  } catch {
    // El navegador puede bloquear el autoplay; el botón queda animado para
    // que la música se active con el primer toque.
  }
}
function reset() {
  state = "intro";
  paused = false;
  elapsed = 0;
  shownStep = -1;
  pending = null;
  poemLife = 0;
  messageLock = 0;
  musicCountdown = 0;
  musicAutoplayDone = false;
  secretFinale = false;
  secretFinaleAge = 0;
  poem.classList.remove("visible");
  poem.classList.remove("final-dedication");
  poem.classList.remove("secret-dedication");
  $("secret-bloom")?.classList.remove("visible");
  $("secret-bloom")?.setAttribute("aria-hidden", "true");
  $("intro").hidden = false;
  $("intro").classList.remove("leaving");
  $("experience").hidden = true;
  $("controls").hidden = true;
  $("intro-footer").hidden = false;
  $("veil").style.opacity = "0";
  $("floating").replaceChildren();
  closeNote();
  $("title").textContent = "";
  document.querySelector(".dedication").style.opacity = "1";
  $("hint").textContent =
    "Mueve el universo \u00b7 toca una flor \u00b7 descubre una palabra";
  lastHover = 0;
  $("last").disabled = false;
  document.body.classList.remove("paused");
  $("pause").textContent = "Ⅱ";
  $("pause").setAttribute("aria-pressed", "false");
  $("pause").setAttribute("aria-label", "Pausar");
  audio.mute();
  audio.suspend(false);
  music.mute();
  updateSoundButton(false);
  galaxy?.reset();
  $("name").focus();
}
$("name").addEventListener("input", () => {
  $("name").setCustomValidity("");
  $("recognition").textContent = isSpecialName($("name").value)
    ? "Las estrellas parecen reconocer este nombre…"
    : "";
});
$("entry").addEventListener("submit", (event) => {
  event.preventDefault();
  name = $("name").value.normalize("NFC").trim().replace(/\s+/g, " ");
  if (!name) {
    $("name").setCustomValidity("Escribe un nombre para comenzar.");
    $("name").reportValidity();
    return;
  }
  if (!galaxy) return;
  special = isSpecialName(name);
  if (normalizeName(name) === normalizeName(CONFIG.specialName))
    name = CONFIG.specialName;
  bag = new MessageBag(special ? zorayaMessages : friendshipMessages);
  surpriseBag = special ? new MessageBag(pinguinitaMessages) : null;
  noteBag = special ? new MessageBag(supportNotes) : null;
  galaxy.start(special, name);
  state = "entering";
  elapsed = 0;
  finalAge = 0;
  nextMessage = special ? 57 : 39;
  shownStep = -1;
  $("intro").classList.add("leaving");
  $("intro-footer").hidden = true;
  $("veil").style.opacity = "1";
  wake();
});
function begin() {
  state = "exploring";
  elapsed = 0;
  musicCountdown = 5;
  musicAutoplayDone = false;
  $("music-track").value = "1";
  music.selectTrack(1).catch(() => {});
  $("intro").hidden = true;
  $("experience").hidden = false;
  $("controls").hidden = false;
  $("veil").style.opacity = "0";
  $("title").textContent = special
    ? `Para ti, ${name}.`
    : `Un cielo para ti, ${name}.`;
  $("subtitle").textContent = "Feliz Día de las Flores Amarillas";
  $("chapter").textContent = "01 — EL PRINCIPIO DE LA LUZ";
  $("hint").textContent =
    "Mueve el universo · toca una flor · toca una estrella de color para abrir una nota";
  $("back").focus({ preventScroll: true });
}
$("back").addEventListener("click", reset);
$("home").addEventListener("click", (e) => {
  e.preventDefault();
  reset();
});
$("sound").addEventListener("click", async () => {
  if (!CONFIG.enableSound) return;
  if (music.enabled || audio.enabled) {
    if (music.enabled) await music.toggle();
    audio.mute();
    updateSoundButton(false, true);
    return;
  }
  const [audioResult, musicResult] = await Promise.allSettled([
    audio.toggle(),
    music.toggle(),
  ]);
  const audioEnabled =
    audioResult.status === "fulfilled" ? audioResult.value : false;
  const musicEnabled =
    musicResult.status === "fulfilled" ? musicResult.value : false;
  if (audioResult.status === "rejected") audio.mute();
  if (musicResult.status === "rejected")
    $("sound").title = "La música no está disponible";
  const enabled = audioEnabled || musicEnabled;
  updateSoundButton(enabled, !enabled);
  if (paused) {
    audio.suspend(true);
    music.suspend(true);
  }
});
$("sound").hidden = !CONFIG.enableSound;
$("music-track").addEventListener("change", async (event) => {
  try {
    await music.selectTrack(event.target.value);
  } catch {
    $("sound").title = "La música no está disponible";
  }
});
function togglePause() {
  paused = !paused;
  document.body.classList.toggle("paused", paused);
  $("pause").textContent = paused ? "▷" : "Ⅱ";
  $("pause").setAttribute("aria-label", paused ? "Reanudar" : "Pausar");
  $("pause").setAttribute("aria-pressed", String(paused));
  audio.suspend(paused);
  music.suspend(paused);
  wake();
}
$("pause").addEventListener("click", togglePause);
function openNote(note, star = null) {
  if (star) activeStar = star;
  const selectedStar = star || activeStar;
  $("note-title").textContent = note.title;
  $("note-text").textContent = note.text;
  $("note").dataset.secret = selectedStar?.userData?.secretType || "note";
  $("note").querySelector(".note-signature").textContent = selectedStar
    ? `✦ ${secretDescriptions[selectedStar.userData.secretType]}`
    : secretDescriptions.note;
  $("note").classList.add("open");
  $("note").setAttribute("aria-hidden", "false");
  noteOpen = true;
  $("note-close").focus({ preventScroll: true });
  audio.chime();
}
function closeNote() {
  const note = $("note");
  if (!note) return;
  note.classList.remove("open");
  note.setAttribute("aria-hidden", "true");
  noteOpen = false;
  activeStar = null;
}
$("note-close").addEventListener("click", closeNote);
$("note").addEventListener("click", (event) => {
  if (event.target === $("note")) closeNote();
});
function finale() {
  if (state !== "exploring") return;
  messageLock = 0;
  if (special) {
    secret();
    return;
  }
  state = "finale";
  finalAge = 0;
  shownStep = -1;
  $("last").disabled = true;
  $("floating").replaceChildren();
  $("title").textContent = "";
  $("subtitle").textContent = "";
  $("chapter").textContent = "03 — LO QUE PERMANECE";
  $("hint").textContent = "Un nombre. Un instante. Un pequeño infinito.";
  poem.classList.remove("visible");
  pending = null;
}
$("last").addEventListener("click", finale);
function secret() {
  state = "secret";
  secretAge = 0;
  messageLock = 0;
  secretFinale = false;
  secretFinaleAge = 0;
  shownStep = -1;
  $("veil").style.opacity = special ? "0" : ".92";
  $("floating").replaceChildren();
  poem.classList.remove("final-dedication");
  poem.classList.toggle("secret-dedication", special);
  $("secret-bloom")?.classList.remove("visible");
  $("secret-bloom")?.classList.toggle("visible", special);
  $("secret-bloom")?.setAttribute("aria-hidden", String(!special));
  $("chapter").textContent = "UN PEQUEÑO SECRETO ENTRE LAS ESTRELLAS";
  if (special) {
    $("title").textContent = "Entre las estrellas, siempre.";
    $("subtitle").textContent = "Para ti, mi pinguinita";
    $("hint").textContent =
      "Hay sentimientos que el universo guarda para siempre.";
    $("last").disabled = true;
    pending = null;
    poem.classList.remove("visible");
  }
  audio.chime();
}
function returnToUniverse() {
  state = "exploring";
  secretFinale = false;
  secretFinaleAge = 0;
  secretAge = 0;
  elapsed = 60;
  shownStep = specialSequence.length - 1;
  nextMessage = elapsed + 8;
  pending = null;
  messageLock = 0;
  poem.classList.remove("visible", "final-dedication", "secret-dedication");
  $("secret-bloom")?.classList.remove("visible");
  $("secret-bloom")?.setAttribute("aria-hidden", "true");
  $("floating").replaceChildren();
  $("veil").style.opacity = "0";
  $("title").textContent = special
    ? `Para ti, ${name}.`
    : `Un cielo para ti, ${name}.`;
  $("subtitle").textContent = "Feliz Día de las Flores Amarillas";
  $("chapter").textContent = "02 — UN JARDÍN ENTRE LAS ESTRELLAS";
  $("hint").textContent =
    "La galaxia sigue aquí · toca una flor · descubre una nueva sorpresa";
  $("last").disabled = false;
  document.querySelector(".dedication").style.opacity = "1";
  audio.chime();
}
function floating(text, x, y) {
  if (
    $("floating").childElementCount >= 2 ||
    (innerWidth < 600 && $("floating").childElementCount >= 1)
  )
    return;
  const el = document.createElement("span");
  el.className = "floating-word";
  el.textContent = text;
  el.style.left = `${Math.min(75, Math.max(5, x))}%`;
  el.style.top = `${Math.min(58, Math.max(32, y))}%`;
  $("floating").append(el);
  el.addEventListener("animationend", () => el.remove());
}
let down = null;
$("universe").addEventListener("pointerdown", (e) => {
  down = { x: e.clientX, y: e.clientY };
});
$("universe").addEventListener("pointerup", (e) => {
  if (
    !down ||
    Math.hypot(e.clientX - down.x, e.clientY - down.y) > 15 ||
    state !== "exploring" ||
    paused
  )
    return;
  down = null;
  const flower = galaxy.hit(e.clientX, e.clientY);
  if (flower?.userData.hidden) {
    secret();
    return;
  }
  if (flower?.userData.interactiveStar) {
    if (special) openNote(noteBag.next(), flower);
    else
      openNote({
        title: "Una nota para ti",
        text: "Los días difíciles pasan. Sigue a tu ritmo, cuida tu corazón y deja que mañana traiga un poquito más de luz.",
      });
    const surprise = special ? surpriseBag.next() : null;
    if (surprise) show(surprise.text, `✦ ${surprise.category}`, 10, true);
    const secretType = flower.userData.secretType;
    galaxy.burst(flower.position, {
      count: secretType === "heart" ? 180 : 150,
      firework: secretType !== "heart" && secretType !== "comet",
      shape:
        secretType === "heart"
          ? "heart"
          : secretType === "comet"
            ? "comet"
            : undefined,
      color:
        secretType === "heart"
          ? 0xff8fae
          : secretType === "comet"
            ? 0x9ed2ff
            : 0xffe99a,
      duration: 3.8,
    });
    return;
  }
  if (flower) {
    if (special) {
      const surprise = surpriseBag.next();
      show(surprise.text, surprise.category, 10, true);
      audio.chime();
    } else next("flores", true);
    galaxy.burst(flower.position);
  } else {
    next(special ? "recuerdos" : "buenos deseos");
  }
  if (performance.now() - lastTap < 350) galaxy.burst(flower?.position);
  lastTap = performance.now();
});
document.addEventListener("pointermove", (e) => {
  wake();
  if (!paused) galaxy?.move(e.clientX, e.clientY);
  if (
    state === "exploring" &&
    !paused &&
    elapsed > 40 &&
    elapsed - lastHover > 16
  ) {
    lastHover = elapsed;
    const message = bag.next();
    floating(
      message.text,
      (e.clientX / innerWidth) * 100,
      (e.clientY / innerHeight) * 100,
    );
  }
});
document.addEventListener("pointerdown", wake);
document.addEventListener("keydown", (e) => {
  wake();
  if (e.key === "Escape" && noteOpen) {
    closeNote();
    return;
  }
  if (e.key === "Escape" && state !== "intro") reset();
  if (e.code === "Space" && state !== "intro" && e.target === document.body) {
    e.preventDefault();
    togglePause();
  }
  if (e.key === "ArrowRight" && state === "exploring" && !paused) next();
});
document.addEventListener(
  "wheel",
  (e) => {
    wake();
    if (state === "exploring" && !paused && e.deltaY > 0) {
      elapsed += Math.min(0.45, e.deltaY / 500);
    }
  },
  { passive: true },
);
addEventListener("resize", () => galaxy?.resize());
document.addEventListener("visibilitychange", () => {
  audio.suspend(document.hidden || paused);
  music.suspend(document.hidden || paused);
  lastFrame = performance.now();
});
$("universe").addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  paused = true;
  $("error").hidden = false;
  $("error").textContent =
    "La conexión con el cielo se ha interrumpido. Recarga la página para volver a entrar.";
});
const specialSequence = [
  [3, "Una pequeña luz, solo para ti."],
  [12, "No vine a pedirte nada."],
  [20, "Solo quería dejarte un pequeño pedazo de luz."],
  [
    29,
    "Porque incluso las flores necesitan recordar que fueron hechas para florecer.",
  ],
  [39, "Por si algún día lo necesitas."],
  [48, "Que sigas floreciendo."],
];
const friendlySequence = [
  [3, "Esta pequeña galaxia florece para ti."],
  [11, "Que nunca te falten motivos para sonreír."],
  [20, "Que la vida te sorprenda con cosas bonitas."],
  [30, "Hoy las estrellas también celebran que existas."],
];
function sequence(steps, age) {
  if (messageLock > 0) return;
  let index = -1;
  for (let i = 0; i < steps.length; i++) if (age >= steps[i][0]) index = i;
  if (index >= 0 && index !== shownStep) {
    shownStep = index;
    show(steps[index][1], "", steps[index][2] || 7);
  }
}
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - lastFrame) / 1000, 0.25);
  lastFrame = now;
  if (document.hidden) return;
  if (!paused) {
    if (state === "entering") {
      elapsed += dt;
      if (elapsed > 2.2) begin();
    } else if (state === "exploring") {
      elapsed += dt;
      if (messageLock > 0) messageLock = Math.max(0, messageLock - dt);
      if (!musicAutoplayDone) {
        musicCountdown -= dt;
        if (musicCountdown <= 0) {
          musicAutoplayDone = true;
          startScheduledMusic();
        }
      }
      sequence(special ? specialSequence : friendlySequence, elapsed);
      if (elapsed > 17)
        $("chapter").textContent = "02 — UN JARDÍN ENTRE LAS ESTRELLAS";
      if (elapsed > nextMessage) {
        const automaticMessageShown = next();
        nextMessage = elapsed + CONFIG.messageSeconds;
        if (automaticMessageShown) {
          const m = bag.next();
          floating(
            m.text,
            Math.random() > 0.5 ? 7 : 74,
            35 + Math.random() * 15,
          );
        }
      }
      if (elapsed > 60)
        $("hint").textContent =
          "Las estrellas de color guardan notas · también hay una flor diminuta escondida";
    } else if (state === "secret") {
      if (special) {
        if (secretFinale) {
          secretFinaleAge += dt;
          if (secretFinaleAge > 7) returnToUniverse();
        } else {
          secretAge += dt;
          const part = dedicationAt(secretAge);
          if (part && part.index !== shownStep) {
            shownStep = part.index;
            const isFinalDedication = part.index === 8;
            galaxy.setConstellation(
              part.constellation || part.text,
              isFinalDedication ? -2.4 : 0,
            );
            document.querySelector(".dedication").style.opacity =
              isFinalDedication ? "0" : "1";
            poem.classList.toggle("final-dedication", isFinalDedication);
            poem.classList.add("secret-dedication");
            $("secret-bloom")?.classList.add("visible");
            $("secret-bloom")?.setAttribute("aria-hidden", "false");
            show(
              part.text.replaceAll("\n", " "),
              part.caption || "",
              part.seconds - 2,
            );
            audio.chime();
          }
          if (secretAge > dedicationDuration) {
            secretFinale = true;
            secretFinaleAge = 0;
            secretAge = dedicationDuration - 0.01;
            $("hint").textContent =
              "Una última lluvia de flores para cerrar este pequeño universo.";
            poem.classList.remove("visible");
          }
        }
      } else {
        secretAge += dt;
        sequence(
          special
            ? [
                [1, "Encontraste una."],
                [5, "Hay cosas que uno no dice todos los días."],
                [10, "Pero eso no significa que dejen de ser verdad."],
                [15, "Te deseo una vida hermosa."],
                [20, "Siempre."],
              ]
            : [
                [1, "Encontraste una."],
                [5, "Las cosas pequeñas también guardan grandes deseos."],
                [11, "Que la vida te regale muchas alegrías."],
                [17, "Y personas con quienes compartirlas."],
              ],
          secretAge,
        );
        if (secretAge > 26) {
          state = "exploring";
          shownStep = (special ? specialSequence : friendlySequence).length - 1;
          nextMessage = elapsed + 8;
          $("veil").style.opacity = "0";
          $("chapter").textContent = "02 — UN JARDÍN ENTRE LAS ESTRELLAS";
        }
      }
    } else if (state === "finale") {
      finalAge += dt;
      sequence(
        special
          ? [
              [6, "Hay personas que pasan por nuestra vida."],
              [12, "Y hay personas que, de alguna manera, se quedan."],
              [18, "Tú eres de esas."],
              [23, "Feliz Día de las Flores Amarillas."],
              [28, "Cuídate mucho."],
              [36, "Que nunca dejes de florecer."],
              [42, "— Siempre habrá alguien deseándote cosas bonitas."],
            ]
          : [
              [6, `Que tu luz siga creciendo, ${name}.`],
              [12, `Que siempre encuentres motivos para celebrar, ${name}.`],
              [18, `Y compañía para compartir las cosas bonitas, ${name}.`],
              [23, "Feliz Día de las Flores Amarillas."],
              [28, "Llévate un poquito de este cielo contigo."],
              [36, "Que nunca dejes de florecer."],
              [42, "— Que la vida te sorprenda con cosas bonitas."],
            ],
        finalAge,
      );
      if (finalAge > 47) {
        $("veil").style.opacity = String(Math.min(1, (finalAge - 47) / 5));
        document.querySelector(".dedication").style.opacity = "0";
        $("hint").textContent = "";
      }
      if (finalAge > 54) {
        state = "ended";
        poem.classList.remove("visible");
        $("chapter").textContent = "";
      }
    }
    if (pending) {
      transition -= dt;
      if (transition <= 0) {
        $("message").textContent = pending.text;
        $("category").textContent = pending.category;
        poemLife = pending.duration;
        pending = null;
        poem.classList.add("visible");
      }
    } else if (poemLife > 0) {
      poemLife -= dt;
      if (poemLife <= 0) poem.classList.remove("visible");
    }
    if (state !== "entering" && state !== "ended")
      galaxy?.update(
        reduced ? dt * 0.22 : dt,
        elapsed,
        state === "finale" ? finalAge : -1,
        state === "secret" && special ? dedicationAt(secretAge) : null,
      );
  }
  if (performance.now() - activity > 5500 && !paused)
    $("controls").classList.add("idle");
}
requestAnimationFrame(frame);
