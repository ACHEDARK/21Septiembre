// Cada fragmento se reúne en estrellas y vuelve a dispersarse antes del siguiente.
export const secretDedication = [
  { text: "Siempre, siempre estaré para ti.", seconds: 9 },
  {
    text: "Porque lo que siento por ti\nno termina con el tiempo ni con la distancia;",
    seconds: 12,
  },
  {
    text: "te amé, te amo y te amaré\nhasta el último latido del universo…",
    seconds: 12,
  },
  { text: "y hasta más allá del fin.", seconds: 9 },
  {
    text: "Porque hay sentimientos\nque no necesitan estar cerca",
    seconds: 10,
  },
  { text: "para seguir siendo eternos,", seconds: 8 },
  {
    text: "y el mío por ti siempre tendrá\nun lugar entre las estrellas.",
    seconds: 12,
    caption: "🌌💛",
  },
  { text: "Mi pinguinita.", seconds: 10 },
  {
    text: "Hasta más allá del Fin\nZORAYA",
    seconds: 15,
  },
];
export const dedicationDuration = secretDedication.reduce(
  (total, part) => total + part.seconds,
  0,
);
export function dedicationAt(age) {
  let start = 0;
  for (let index = 0; index < secretDedication.length; index++) {
    const part = secretDedication[index];
    if (age < start + part.seconds) return { ...part, index, age: age - start };
    start += part.seconds;
  }
  return null;
}
