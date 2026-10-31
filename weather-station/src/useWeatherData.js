import { useState, useEffect, useCallback, useMemo } from "react";
import { API_URL } from "./metrics";

const LATEST_INTERVAL = 30 * 1000;
const HISTORY_INTERVAL = 5 * 60 * 1000;

/** Current time in ms, re-rendered every `interval` ms. */
export function useNow(interval) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

async function getJson(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (res.status === 404) return null; // server has no reading yet
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

/**
 * Loads the latest reading and the weekly history, and keeps both fresh.
 * The latest reading is polled often, the history less so.
 */
export function useWeatherData() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async (includeHistory = true) => {
    setLoading(true);
    try {
      const [latestData, historyData] = await Promise.all([
        getJson("/latest"),
        includeHistory ? getJson("/history") : undefined,
      ]);
      setLatest(latestData);
      if (historyData) setHistory(historyData);
      setError(false);
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(true);
    const latestId = setInterval(() => refresh(false), LATEST_INTERVAL);
    const historyId = setInterval(() => refresh(true), HISTORY_INTERVAL);
    return () => {
      clearInterval(latestId);
      clearInterval(historyId);
    };
  }, [refresh]);

  // The server returns days newest-first, so order the readings by time once here.
  const sortedHistory = useMemo(
    () => history.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    [history]
  );

  return { latest, sortedHistory, loading, error, refresh };
}
