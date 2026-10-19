export const TIME_ZONE = "America/Bogota";
const PRODUCTION_HOST = "21septiembre-eight.vercel.app";

export function isDeveloperPreview() {
  if (typeof window === "undefined") return false;
  const { hostname, protocol } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1")
    return true;
  // Vercel preview deployments require team authentication; the public alias does not.
  return hostname.endsWith(".vercel.app") && hostname !== PRODUCTION_HOST;
}

export const celebrations = [
  {
    id: "flores-amarillas",
    title: "Flores amarillas",
    date: "21 de septiembre",
    month: 9,
    day: 21,
    firstYear: 2026,
    symbol: "✿",
    tone: "sunflower",
    description: "Una galaxia de luz, flores y palabras que merecen quedarse.",
    path: "/flores-amarillas",
  },
  {
    id: "navidad",
    title: "Navidad",
    date: "25 de diciembre",
    month: 12,
    day: 25,
    firstYear: 2026,
    symbol: "✧",
    tone: "winter",
    description: "Un pequeño deseo envuelto para una noche especial.",
    path: "/navidad",
  },
  {
    id: "san-valentin",
    title: "San Valentín",
    date: "14 de febrero",
    month: 2,
    day: 14,
    firstYear: 2026,
    symbol: "♡",
    tone: "rose",
    description: "Un recordatorio amable de todo lo bonito que existe.",
    path: "/san-valentin",
  },
  {
    id: "cumpleanos",
    title: "Tu cumpleaños",
    date: "18 de marzo",
    month: 3,
    day: 18,
    firstYear: 2026,
    symbol: "✳",
    tone: "birthday",
    description: "Hoy el universo tiene una razón más para celebrar.",
    path: "/cumpleanos",
  },
];

function zonedParts(date) {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map(({ type, value }) => [type, Number(value)]),
  );
  return values;
}

function zonedMidnight(year, month, day) {
  const desired = Date.UTC(year, month - 1, day);
  let timestamp = desired;
  for (let i = 0; i < 3; i++) {
    const local = zonedParts(new Date(timestamp));
    const represented = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    );
    timestamp += desired - represented;
  }
  return timestamp;
}

export function getDateStatus(celebration, now = new Date()) {
  const local = zonedParts(now);
  const today = Date.UTC(local.year, local.month - 1, local.day);
  const occurrenceYear = Math.max(local.year, celebration.firstYear);
  const occurrence = Date.UTC(occurrenceYear, celebration.month - 1, celebration.day);
  if (local.year >= celebration.firstYear && today === occurrence)
    return { unlocked: true, target: null, remaining: 0 };

  const nextYear = local.year < celebration.firstYear || today < occurrence
    ? occurrenceYear
    : occurrenceYear + 1;
  const target = zonedMidnight(nextYear, celebration.month, celebration.day);
  return { unlocked: false, target, remaining: Math.max(0, target - now.getTime()) };
}
