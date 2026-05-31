import type { ArkhamPack } from '../types/arkhamdb';
import { CYCLE_PREFIX_MAP, CYCLE_DISPLAY_NAMES } from '../types/arkhamdb';

interface PackSelectorProps {
  packs: ArkhamPack[];
  isLoading: boolean;
  selectedPack: ArkhamPack | null;
  onSelect: (pack: ArkhamPack) => void;
}

export function PackSelector({ packs, isLoading, selectedPack, onSelect }: PackSelectorProps) {
  const campaigns = packs.filter((p) => p.position === 1);
  const knownCycles = Object.keys(CYCLE_PREFIX_MAP);
  const grouped = knownCycles.reduce<Record<string, ArkhamPack[]>>((acc, cycle) => {
    const cyclePacks = campaigns.filter((p) => p.cycle_code === cycle);
    if (cyclePacks.length > 0) acc[cycle] = cyclePacks;
    return acc;
  }, {});

  const unknownPacks = campaigns.filter((p) => !knownCycles.includes(p.cycle_code));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pack = campaigns.find((p) => p.code === e.target.value);
    if (pack) onSelect(pack);
  };

  return (
    <div className="px-4 py-3 bg-arkham-surface border-b border-arkham-border">
      <label className="block text-xs font-sans uppercase tracking-widest text-arkham-muted mb-1">
        Campaign
      </label>
      <select
        className="w-full bg-arkham-bg border border-arkham-border text-arkham-cream rounded px-3 py-2 font-sans text-sm focus:outline-none focus:border-arkham-gold appearance-none"
        value={selectedPack?.code ?? ''}
        onChange={handleChange}
        disabled={isLoading}
      >
        <option value="" disabled>
          {isLoading ? 'Loading packs…' : '— Select your campaign —'}
        </option>

        {Object.entries(grouped).map(([cycleCode, cyclePacks]) => (
          <optgroup key={cycleCode} label={CYCLE_DISPLAY_NAMES[cycleCode] ?? cycleCode}>
            {cyclePacks.map((pack) => (
              <option key={pack.code} value={pack.code}>
                {pack.name}
              </option>
            ))}
          </optgroup>
        ))}

        {unknownPacks.length > 0 && (
          <optgroup label="Other">
            {unknownPacks.map((pack) => (
              <option key={pack.code} value={pack.code}>
                {pack.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {selectedPack && (
        <p className="mt-1 text-xs text-arkham-muted font-sans">
          Prefix:{' '}
          <span className="text-arkham-gold font-mono">
            {CYCLE_PREFIX_MAP[selectedPack.cycle_code] ?? '??'}
          </span>
          {!CYCLE_PREFIX_MAP[selectedPack.cycle_code] && (
            <span className="ml-2 text-arkham-danger">
              (unsupported — try manual entry)
            </span>
          )}
        </p>
      )}
    </div>
  );
}
