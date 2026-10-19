import { celebrations, getDateStatus } from "../special-dates.js";

const celebration = celebrations.find((item) => item.id === "flores-amarillas");
if (!getDateStatus(celebration).unlocked) {
  location.replace("/");
} else {
  document.body.hidden = false;
  document.body.style.visibility = "visible";
}
