import { useState } from 'react';
import type { ArkhamCard } from '../types/arkhamdb';

type CardError = 'not-found' | 'network' | null;

interface FetchResult {
  card: ArkhamCard;
  usedFallback: boolean;
}

interface UseArkhamDBReturn {
  card: ArkhamCard | null;
  isLoading: boolean;
  error: CardError;
  usedFallback: boolean;
  fetchCard: (code: string, fallback?: string) => Promise<FetchResult | null>;
  selectCard: (card: ArkhamCard, usedFallback: boolean) => void;
  reset: () => void;
}

export function useArkhamDB(): UseArkhamDBReturn {
  const [card, setCard] = useState<ArkhamCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CardError>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const fetchCard = async (code: string, fallback?: string): Promise<FetchResult | null> => {
    setIsLoading(true);
    setError(null);
    setCard(null);
    setUsedFallback(false);
    try {
      const tryFetch = async (c: string): Promise<ArkhamCard | null> => {
        try {
          const res = await fetch(`https://arkhamdb.com/api/public/card/${c}`);
          if (res.ok) return (await res.json()) as ArkhamCard;
          return null;
        } catch {
          return null;
        }
      };

      const primary = await tryFetch(code);
      if (primary) {
        setCard(primary);
        return { card: primary, usedFallback: false };
      }
      const fallbackData = fallback ? await tryFetch(fallback) : null;
      if (!fallbackData) {
        setError('not-found');
        return null;
      }
      setUsedFallback(true);
      setCard(fallbackData);
      return { card: fallbackData, usedFallback: true };
    } finally {
      setIsLoading(false);
    }
  };

  const selectCard = (selected: ArkhamCard, fallback: boolean) => {
    setError(null);
    setUsedFallback(fallback);
    setCard(selected);
  };

  const reset = () => {
    setCard(null);
    setError(null);
    setUsedFallback(false);
  };

  return { card, isLoading, error, usedFallback, fetchCard, selectCard, reset };
}
