import { celebrations, getDateStatus, isDeveloperPreview } from "../special-dates.js";

const celebration = celebrations.find((item) => item.id === "flores-amarillas");
if (!getDateStatus(celebration).unlocked && !isDeveloperPreview()) {
  location.replace("/");
} else {
  document.body.hidden = false;
  document.body.style.visibility = "visible";
}
