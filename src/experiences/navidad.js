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
      image: "assets/image copy 2.png",
      imageAlt: "Un osito con gorro de Navidad comparte una pequeña sorpresa.",
      message: "Que esta noche te permita soltar un poquito el día. No tienes que resolverlo todo ahora; también mereces descansar, respirar hondo y dejar que alguien más cuide de ti por un rato.",
    },
    orgullo: {
      title: "Todo lo que has logrado",
      image: "assets/image copy 6.png",
      imageAlt: "Dos amigos atraviesan juntos un paisaje nevado en un trineo.",
      message: "Me alegra saber de cada paso que has dado, incluso de esos que nadie vio. Ojalá hoy puedas mirarte con el mismo orgullo y la misma ternura con que yo recuerdo todo tu esfuerzo.",
    },
    esperanza: {
      title: "Un deseo sereno",
      image: "assets/image copy 7.png",
      imageAlt: "Una habitación acogedora alrededor del árbol de Navidad.",
      message: "Que encuentres lugares donde puedas ser tú, personas que te cuiden bonito y días que se sientan un poco más livianos. Lo mereces sin tener que demostrar nada.",
    },
    deseos: {
      title: "Algo que sigue aquí",
      image: "assets/image copy 3.png",
      imageAlt: "Un adorno de cristal guarda un pequeño osito.",
      message: "Aunque la vida haya cambiado y cada quien siga su camino, te sigo deseando bienestar. Sin espera, sin deuda y sin pedir nada: simplemente porque sigues siendo alguien muy especial para mí.",
    },
    estrella: {
      title: "El deseo escondido en la estrella",
      image: "assets/bear-ornament.webp",
      imageAlt: "Un osito con un bastón de caramelo dentro de una esfera de cristal.",
      message: "Hay luces que no piden que vuelvas; solo acompañan un instante y te recuerdan que mereces encontrar tu propio camino, a tu ritmo. Que nunca te falte una de esas luces.",
    },
    final: {
      title: "El regalo que faltaba",
      message: "Este deseo no tiene condiciones: que la vida te devuelva, multiplicado, todo el cariño que sabes dar. Y que, entre tantas luces, siempre reconozcas la tuya.",
    },
  };

  function openGift(id) {
    const gift = gifts[id];
    if (!gift) return;
    if (id !== "final") visited.add(id);
    document.querySelector("#dialog-title").textContent = gift.title;
    document.querySelector("#dialog-message").textContent = gift.message;
    const art = document.querySelector("#dialog-art");
    art.hidden = !gift.image;
    if (gift.image) { art.src = gift.image; art.alt = gift.imageAlt; }
    document.querySelector("#discovery-count").textContent =
      `Has encontrado ${visited.size} de 5 luces`;
    if (visited.size === 5) {
      document.querySelector("#discovery-count").textContent =
        "Encendiste cada luz. La estrella guardaba una última sorpresa.";
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

  const scenes = [
    { title: "Donde empiezan las luces", label: "EL ÁRBOL", image: "assets/image.png", alt: "Ositos decorando un árbol de Navidad bajo un cielo nevado.", copy: "Alguien subió una escalera para dejar una estrella en lo alto. Abajo, los regalos esperan sin apuro." },
    { title: "Un viaje sin reloj", label: "EL TRINEO", image: "assets/image copy 6.png", alt: "Dos ositos cruzan juntos la nieve en un trineo con un árbol de Navidad.", copy: "El camino cruza el bosque y la nieve borra las huellas detrás. Por un rato, basta con dejarse llevar." },
    { title: "Una ventana encendida", label: "LA CABAÑA", image: "assets/image copy 7.png", alt: "Una cabaña cálida con ositos y un árbol navideño decorado.", copy: "Dentro huele a madera y a noche tranquila. Hay sitio junto al árbol, una taza tibia y tiempo para respirar." },
    { title: "La luz que guardaste", label: "EL LAGO DE ESTRELLAS", image: "assets/image copy 17.png", reflection: "assets/image copy 18.png", alt: "Un osito encuentra una pequeña estrella luminosa junto al agua, bajo el cielo nocturno.", copy: "Dos pequeñas luces se encuentran sobre el agua oscura. Cada una puede seguir su propio camino y aun así iluminar la noche." },
  ];
  let activeScene = 0;
  const world = document.querySelector("#journey-world");
  const sceneImage = document.querySelector("#journey-art");
  const reflection = document.querySelector("#journey-reflection");
  const prevScene = document.querySelector("#journey-prev");
  const nextScene = document.querySelector("#journey-next");
  function showScene(index) {
    activeScene = Math.max(0, Math.min(scenes.length - 1, index));
    const scene = scenes[activeScene];
    world.classList.add("is-transitioning");
    window.setTimeout(() => {
      sceneImage.src = scene.image;
      sceneImage.alt = scene.alt;
      reflection.hidden = !scene.reflection;
      if (scene.reflection) reflection.src = scene.reflection;
      document.querySelector("#journey-step").textContent = `PARADA 0${activeScene + 1} · ${scene.label}`;
      document.querySelector("#journey-scene-title").textContent = scene.title;
      document.querySelector("#journey-copy").textContent = scene.copy;
      world.dataset.scene = String(activeScene);
      document.querySelectorAll(".journey-dot").forEach((dot, dotIndex) => {
        const selected = dotIndex === activeScene;
        dot.classList.toggle("is-active", selected);
        dot.setAttribute("aria-pressed", String(selected));
      });
      prevScene.disabled = activeScene === 0;
      nextScene.disabled = activeScene === scenes.length - 1;
      document.querySelector("#journey-hint").textContent = activeScene === scenes.length - 1
        ? "Llegaste al final del sendero. La luz sigue contigo."
        : "Una historia a la vez. Avanza cuando quieras.";
      world.classList.remove("is-transitioning");
    }, 240);
  }
  document.querySelectorAll(".journey-dot").forEach((dot) => dot.addEventListener("click", () => showScene(Number(dot.dataset.scene))));
  prevScene.addEventListener("click", () => showScene(activeScene - 1));
  nextScene.addEventListener("click", () => showScene(activeScene + 1));

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

  const letterButton = document.querySelector("#open-letter");
  letterButton.addEventListener("click", () => {
    const paper = document.querySelector("#letter-paper");
    paper.hidden = false;
    document.querySelector("#letter-envelope").classList.add("is-open");
    letterButton.setAttribute("aria-expanded", "true");
    letterButton.textContent = "La carta es tuya";
    letterButton.disabled = true;
  });
}
