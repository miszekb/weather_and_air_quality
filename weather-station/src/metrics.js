import {
  FaTemperatureHigh,
  FaSmog,
  FaTint,
  FaWind,
  FaTachometerAlt,
} from "react-icons/fa";

// In production the app is served by the API server itself, so relative URLs work;
// `npm run dev` runs on another port and needs the API's address.
export const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:5000" : "");

const HOUR = 60 * 60 * 1000;

// `flat` is the change over an hour below which the trend is shown as steady.
// `zero` makes the chart's y axis start at 0 (not meaningful for temperature or pressure).
export const METRICS = [
  { key: "temperature", unit: "°C", icon: FaTemperatureHigh, color: "teal.500", decimals: 1, flat: 0.2 },
  { key: "temp2", unit: "°C", icon: FaTemperatureHigh, color: "cyan.500", decimals: 1, flat: 0.2 },
  { key: "pm25", unit: "µg/m³", icon: FaSmog, color: "red.500", decimals: 1, flat: 1, zero: true },
  { key: "no2", unit: "ppb", icon: FaWind, color: "blue.500", decimals: 1, flat: 1, zero: true },
  { key: "humidity", unit: "%", icon: FaTint, color: "purple.500", decimals: 0, flat: 1 },
  { key: "hPa", unit: "hPa", icon: FaTachometerAlt, color: "orange.500", decimals: 0, flat: 1 },
];

export const RANGES = ["24h", "today", "7d"];

/** Time window [start, end] in ms that a range covers, in local time. */
export function rangeWindow(range, now) {
  if (range === "today") {
    const start = new Date(now).setHours(0, 0, 0, 0);
    return { start, end: start + 24 * HOUR };
  }
  return { start: now - (range === "7d" ? 7 * 24 : 24) * HOUR, end: now };
}

/** Numeric readings of one metric as {x: ms, y: value}, oldest first. */
export function toPoints(sortedHistory, key) {
  return sortedHistory
    .filter((d) => typeof d[key] === "number")
    .map((d) => ({ x: new Date(d.timestamp).getTime(), y: d[key] }));
}

export function pointsInWindow(points, { start, end }) {
  return points.filter((p) => p.x >= start && p.x <= end);
}

export function getStats(points) {
  if (points.length === 0) return null;
  const ys = points.map((p) => p.y);
  return {
    min: Math.min(...ys),
    max: Math.max(...ys),
    avg: ys.reduce((a, b) => a + b, 0) / ys.length,
  };
}

/** Change of the latest value against the reading closest to one hour earlier. */
export function getTrend(points, latestValue, latestTime, metric) {
  if (typeof latestValue !== "number" || points.length === 0) return null;
  const target = latestTime - HOUR;
  let nearest = null;
  for (const p of points) {
    if (nearest === null || Math.abs(p.x - target) < Math.abs(nearest.x - target)) nearest = p;
  }
  if (Math.abs(nearest.x - target) > HOUR / 2) return null;

  const delta = latestValue - nearest.y;
  if (Math.abs(delta) < metric.flat) return { direction: "flat", delta: 0 };
  return { direction: delta > 0 ? "up" : "down", delta };
}

const LEVELS = [
  { labelKey: "level.good", colorScheme: "green" },
  { labelKey: "level.moderate", colorScheme: "yellow" },
  { labelKey: "level.poor", colorScheme: "orange" },
  { labelKey: "level.veryPoor", colorScheme: "red" },
];

// Upper bounds of the first three levels; anything above is "Very poor".
const LEVEL_LIMITS = {
  pm25: [12, 35.4, 150], // µg/m³, US EPA PM2.5 breakpoints
  no2: [53, 100, 360], // ppb, US EPA NO2 breakpoints
};

export function airQualityLevel(key, value) {
  const limits = LEVEL_LIMITS[key];
  if (!limits || typeof value !== "number") return null;
  const index = limits.findIndex((limit) => value <= limit);
  return LEVELS[index === -1 ? limits.length : index];
}

export function formatValue(value, decimals, lang) {
  if (typeof value !== "number") return "-";
  return value.toLocaleString(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatAgo(ms, t) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return t("ago.now");
  if (minutes < 60) return t("ago.minutes", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return t("ago.hours", { n: hours });
  return t("ago.days", { n: Math.floor(hours / 24) });
}

// ---- Calendar dates ("YYYY-MM-DD" strings in local time, as used by <input type="date">) ----

export function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(str, days) {
  const date = parseDate(str);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/** Number of days from `a` to `b` (0 when they are the same day). */
export function daysBetween(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / (24 * HOUR));
}

/** Time window covering whole local days from `from` to `to`, both included. */
export function dateWindow(from, to) {
  return { start: parseDate(from).getTime(), end: parseDate(addDays(to, 1)).getTime() - 1 };
}
