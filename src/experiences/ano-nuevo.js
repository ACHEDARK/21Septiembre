import { celebrations, getDateStatus, isDeveloperPreview } from "../special-dates.js";

const occasion = celebrations.find((item) => item.id === "ano-nuevo");
if (getDateStatus(occasion).unlocked || isDeveloperPreview()) {
  document.body.hidden = false;
  startNewYear();
} else {
  location.replace("/");
}

function startNewYear() {
  const canvas = document.querySelector("#fireworks");
  const context = canvas.getContext("2d");
  const prefersLessMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let particles = [];
  const colors = ["#f4d890", "#d6b6ff", "#f28e9c", "#9be2df", "#fff2d0"];

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function burst(x, y, count = 54) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let index = 0; index < count; index++) {
      const angle = (Math.PI * 2 * index) / count;
      const speed = 1.2 + Math.random() * 4.2;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color, size: 1 + Math.random() * 2 });
    }
  }

  function animate() {
    context.clearRect(0, 0, width, height);
    particles = particles.filter((particle) => particle.life > 0.02);
    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.018;
      particle.vx *= 0.992;
      particle.vy *= 0.992;
      particle.life *= 0.978;
      context.globalAlpha = particle.life;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    if (!prefersLessMotion) requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener("resize", resize);
  const fireAt = (x, y) => {
    burst(x, y);
    if (prefersLessMotion) animate();
  };
  document.querySelector("#sky-button").addEventListener("click", () => {
    fireAt(width * (0.25 + Math.random() * 0.5), height * (0.2 + Math.random() * 0.35));
    window.setTimeout(() => fireAt(width * (0.25 + Math.random() * 0.5), height * (0.2 + Math.random() * 0.35), 36), 260);
  });
  document.querySelector(".new-year-hero").addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    fireAt(event.clientX, event.clientY, 32);
  });

  const input = document.querySelector("#wish-input");
  const length = document.querySelector("#wish-length");
  input.addEventListener("input", () => { length.textContent = `${input.value.length} / 150`; });
  document.querySelector("#wish-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const wish = input.value.trim();
    if (!wish) return;
    const status = document.querySelector("#wish-status");
    status.textContent = `“${wish}”`;
    fireAt(width * 0.5, height * 0.42, 82);
    input.value = "";
    length.textContent = "0 / 150";
  });
}
