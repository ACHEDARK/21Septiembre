export const CONFIG = {
  specialName: "Zoraya",
  galaxyParticles: 18000,
  flowerCount: 80,
  autoRotate: true,
  enableSound: true,
  quality: "auto",
  speed: 1,
  cameraSpeed: 0.6,
  glow: 0.8,
  colors: { inner: "#fff2a6", outer: "#bd7927", flower: "#ffd95a" },
  messageSeconds: 10,
  specialAliases: [
    "Zoraya",
    "Zoraya Estefania Sailema Palate",
    "Zoraya Stefania Sailema Palate",
    "Soraya ",
    "Pinguinita",
    "Bubucita",
    "Mumilona",
    "Enojona",
    "Cachetonsita",
    "Perver",
    "Comelona",
  ],
};
export const normalizeName = (value) =>
  value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
export const isSpecialName = (value) =>
  CONFIG.specialAliases.some(
    (alias) => normalizeName(value) === normalizeName(alias),
  );
export function qualitySettings() {
  const tier =
    CONFIG.quality === "auto"
      ? innerWidth < 600
        ? "LOW"
        : innerWidth < 1200
          ? "MEDIUM"
          : "HIGH"
      : CONFIG.quality.toUpperCase();
  return (
    {
      LOW: { factor: 0.38, dpr: 1, flowers: 0.32 },
      MEDIUM: { factor: 0.7, dpr: 1.4, flowers: 0.65 },
      HIGH: { factor: 1, dpr: 1.75, flowers: 1 },
    }[tier] || { factor: 0.7, dpr: 1.4, flowers: 0.65 }
  );
}
