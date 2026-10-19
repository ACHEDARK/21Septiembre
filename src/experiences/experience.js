import { celebrations, getDateStatus } from "../special-dates.js";

const id = new URLSearchParams(location.search).get("celebration");
const celebration = celebrations.find((item) => item.id === id);
if (!celebration || !getDateStatus(celebration).unlocked) {
  location.replace("/");
} else {
  document.title = `${celebration.title} · Un pequeño universo`;
  document.querySelector("#experience-symbol").textContent = celebration.symbol;
  document.querySelector("#experience-date").textContent = celebration.date;
  document.querySelector("#experience-title").textContent = celebration.title;
  document.querySelector("#experience-description").textContent = celebration.description;
  document.body.hidden = false;
}
