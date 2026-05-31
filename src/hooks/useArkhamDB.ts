import { useState } from 'react';
import type { ArkhamCard } from '../types/arkhamdb';

type CardError = 'not-found' | 'network' | null;

interface UseArkhamDBReturn {
  card: ArkhamCard | null;
  isLoading: boolean;
  error: CardError;
  fetchCard: (code: string, fallback?: string) => Promise<void>;
  reset: () => void;
}

export function useArkhamDB(): UseArkhamDBReturn {
  const [card, setCard] = useState<ArkhamCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CardError>(null);

  const fetchCard = async (code: string, fallback?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setCard(null);
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

      const data = (await tryFetch(code)) ?? (fallback ? await tryFetch(fallback) : null);
      if (!data) { setError('not-found'); return; }
      setCard(data);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCard(null);
    setError(null);
  };

  return { card, isLoading, error, fetchCard, reset };
}
