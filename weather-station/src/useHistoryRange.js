import { useState, useEffect } from "react";
import { API_URL } from "./metrics";

/**
 * Loads every stored reading between two instants (ms).
 * `loading` is true until the response for the current range has arrived.
 */
export function useHistoryRange(startMs, endMs) {
  const key = `${startMs}-${endMs}`;
  const [result, setResult] = useState({ key: null, readings: [], error: false });

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({
      from: new Date(startMs).toISOString(),
      to: new Date(endMs).toISOString(),
    });

    fetch(`${API_URL}/history/range?${query}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status} on /history/range`);
        return res.json();
      })
      .then((readings) => setResult({ key, readings, error: false }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch historical data:", err);
        setResult({ key, readings: [], error: true });
      });

    return () => controller.abort();
  }, [key, startMs, endMs]);

  const ready = result.key === key;
  return { readings: ready ? result.readings : [], loading: !ready, error: ready && result.error };
}

/** First and last day with stored data, as UTC "YYYY-MM-DD" strings (null while unknown). */
export function useAvailableDates() {
  const [available, setAvailable] = useState({ from: null, to: null });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/history/available`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`API error ${res.status}`))))
      .then(setAvailable)
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Failed to fetch available dates:", err);
      });
    return () => controller.abort();
  }, []);

  return available;
}
