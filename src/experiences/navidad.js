import { celebrations, getDateStatus, isDeveloperPreview } from "../special-dates.js";

const christmas = celebrations.find((item) => item.id === "navidad");
const available = getDateStatus(christmas).unlocked || isDeveloperPreview();

if (!available) {
  location.replace("/");
} else {
  document.body.hidden = false;
  startChristmas();
}

function startChristmas() {
  const dialog = document.querySelector("#gift-dialog");
  const visited = new Set();
  const gifts = {
    calma: {
      title: "Una pausa tibia",
      message: "Que esta noche te permita soltar un poquito el día. No tienes que resolverlo todo ahora; también mereces descansar, respirar hondo y dejar que alguien más cuide de ti por un rato.",
    },
    orgullo: {
      title: "Todo lo que has logrado",
      message: "Me alegra saber de cada paso que has dado, incluso de esos que nadie vio. Ojalá hoy puedas mirarte con el mismo orgullo y la misma ternura con que yo recuerdo todo tu esfuerzo.",
    },
    esperanza: {
      title: "Un deseo sereno",
      message: "Que el año nuevo te acerque a lugares donde puedas ser tú, a personas que te cuiden bonito y a días que se sientan un poco más livianos. Lo mereces sin tener que demostrar nada.",
    },
    deseos: {
      title: "Algo que sigue aquí",
      message: "Aunque la vida haya cambiado y cada quien siga su camino, te sigo deseando bienestar. Sin espera, sin deuda y sin pedir nada: simplemente porque sigues siendo alguien muy especial para mí.",
    },
    estrella: {
      title: "El deseo escondido en la estrella",
      message: "Hay luces que no piden que vuelvas; solo acompañan un instante y te recuerdan que mereces encontrar tu propio camino, a tu ritmo. Que nunca te falte una de esas luces.",
    },
    final: {
      title: "El regalo que faltaba",
      message: "Este deseo no tiene condiciones: que la vida te devuelva, multiplicado, todo el cariño que sabes dar. Y que, entre tantas luces, siempre reconozcas la tuya.",
    },
  };
  const wishes = [
    "Que encuentres calma en los días ruidosos y alegría en las cosas pequeñas.",
    "Que siempre haya una ventana con luz cuando necesites volver a empezar.",
    "Que te rodeen personas que sepan cuidar la ternura que llevas contigo.",
    "Que el próximo año te sorprenda con motivos nuevos para sonreír.",
    "Que cada sueño encuentre su momento, y tú el tiempo para disfrutarlo.",
    "Que tengas días suaves, abrazos sinceros y mucha paz para lo que viene.",
    "Que todo lo bueno que das encuentre el camino de vuelta hacia ti.",
    "Que nunca te falten razones para celebrar lo lejos que has llegado.",
  ];
  let wishIndex = 0;

  function openGift(id) {
    const gift = gifts[id];
    if (!gift) return;
    if (id !== "final") visited.add(id);
    document.querySelector("#dialog-title").textContent = gift.title;
    document.querySelector("#dialog-message").textContent = gift.message;
    document.querySelector("#discovery-count").textContent =
      `Has abierto ${visited.size} de 5 sorpresas`;
    if (visited.size === 5) {
      document.querySelector("#discovery-count").textContent =
        "Encontraste todas las sorpresas. Hay un último regalo para ti.";
      document.querySelector("#bonus-reveal").hidden = false;
    }
    dialog.showModal();
  }

  document.querySelectorAll("[data-gift]").forEach((item) => {
    item.addEventListener("click", () => openGift(item.dataset.gift));
    if (item.matches("[role='button']")) {
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          item.click();
        }
      });
    }
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.querySelector("#bonus-reveal").addEventListener("click", () => {
    openGift("final");
  });

  const tree = document.querySelector("#tree-scene");
  const lightsToggle = document.querySelector("#lights-toggle");
  lightsToggle.addEventListener("click", () => {
    const enabled = tree.classList.toggle("lights-on");
    lightsToggle.setAttribute("aria-pressed", String(enabled));
    lightsToggle.innerHTML = enabled
      ? '<span aria-hidden="true">✦</span> Las luces están encendidas'
      : '<span aria-hidden="true">✧</span> Encender las luces';
  });

  const snowfall = document.querySelector("#snowfall");
  const snowToggle = document.querySelector("#snow-toggle");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    snowToggle.setAttribute("aria-pressed", "false");
    snowToggle.textContent = "Nieve en pausa por movimiento reducido";
    snowToggle.disabled = true;
  } else {
    const flakes = ["❄", "·", "✧", "❅"];
    for (let index = 0; index < 34; index++) {
      const flake = document.createElement("span");
      flake.className = "snowflake";
      flake.textContent = flakes[index % flakes.length];
      flake.style.setProperty("--left", `${Math.random() * 100}%`);
      flake.style.setProperty("--size", `${7 + Math.random() * 10}px`);
      flake.style.setProperty("--opacity", `${0.2 + Math.random() * 0.52}`);
      flake.style.setProperty("--duration", `${12 + Math.random() * 19}s`);
      flake.style.setProperty("--delay", `${-Math.random() * 28}s`);
      snowfall.append(flake);
    }
    snowToggle.addEventListener("click", () => {
      const paused = snowfall.classList.toggle("paused");
      snowToggle.setAttribute("aria-pressed", String(paused));
      snowToggle.innerHTML = paused
        ? '<span aria-hidden="true">❄</span> Reanudar la nieve'
        : '<span aria-hidden="true">❄</span> Pausar la nieve';
    });
  }

  document.querySelector("#next-wish").addEventListener("click", () => {
    wishIndex = (wishIndex + 1) % wishes.length;
    const message = document.querySelector("#wish-message");
    message.classList.add("wish-changing");
    window.setTimeout(() => {
      message.textContent = wishes[wishIndex];
      message.classList.remove("wish-changing");
    }, 180);
  });
}
