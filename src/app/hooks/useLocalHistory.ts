"use client";

import { useState, useEffect, useCallback } from "react";

export type QRMode = "url" | "wifi" | "vcard" | "email" | "sms";

export interface HistoryEntry {
  id: string;
  mode: QRMode;
  label: string;       // Human-readable label shown in the list
  data: string;        // Encoded QR string
  rawData: Record<string, string>; // Form field values to restore state
  timestamp: number;
}

const STORAGE_KEY = "qr-gen-history";
const MAX_HISTORY = 10;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage might be unavailable (private mode, quota exceeded…)
  }
}

export function useLocalHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Hydrate on mount (avoids SSR mismatch)
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addEntry = useCallback((entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    setHistory((prev) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      // Deduplicate by encoded data string
      const deduped = prev.filter((h) => h.data !== entry.data);
      const next = [newEntry, ...deduped].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
