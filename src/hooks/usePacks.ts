import { useEffect, useState } from 'react';
import type { ArkhamPack } from '../types/arkhamdb';
import { CYCLE_POSITION_TO_CODE } from '../types/arkhamdb';

interface RawPack {
  code: string;
  name: string;
  position: number;
  cycle_position: number;
}

interface UsePacksReturn {
  packs: ArkhamPack[];
  isLoading: boolean;
  error: string | null;
}

export function usePacks(): UsePacksReturn {
  const [packs, setPacks] = useState<ArkhamPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const res = await fetch('https://arkhamdb.com/api/public/packs/');
        if (!res.ok) throw new Error('Failed to fetch packs');
        const raw = (await res.json()) as RawPack[];
        const data: ArkhamPack[] = raw.map((p) => ({
          code: p.code,
          name: p.name,
          position: p.position,
          cycle_code: CYCLE_POSITION_TO_CODE[p.cycle_position] ?? `cycle_${p.cycle_position}`,
        }));
        const sorted = [...data].sort((a, b) => {
          const cycleCompare = a.cycle_code.localeCompare(b.cycle_code);
          return cycleCompare !== 0 ? cycleCompare : a.position - b.position;
        });
        setPacks(sorted);
      } catch {
        setError('Could not load pack list. Check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPacks();
  }, []);

  return { packs, isLoading, error };
}
