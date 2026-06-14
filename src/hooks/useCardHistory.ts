import { useEffect, useState } from 'react';
import type { ArkhamCard, Side } from '../types/arkhamdb';

const HISTORY_KEY = 'arkham-lens-history';
const MAX_HISTORY = 20;

export interface HistoryEntry {
  code: string;
  number: string;
  name: string;
  side: Side;
  card: ArkhamCard;
  usedFallback: boolean;
}

interface UseCardHistoryReturn {
  history: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  removeEntry: (entry: HistoryEntry) => void;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function entryKey(entry: Pick<HistoryEntry, 'code' | 'side'>): string {
  return `${entry.code}:${entry.side ?? ''}`;
}

export function useCardHistory(): UseCardHistoryReturn {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addEntry = (entry: HistoryEntry) => {
    setHistory((prev) => {
      const filtered = prev.filter((e) => entryKey(e) !== entryKey(entry));
      return [entry, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  const removeEntry = (entry: HistoryEntry) => {
    setHistory((prev) => prev.filter((e) => entryKey(e) !== entryKey(entry)));
  };

  return { history, addEntry, removeEntry };
}
