import type { ArkhamPack } from '../types/arkhamdb';
import { CYCLE_PREFIX_MAP, CYCLE_DISPLAY_NAMES, CAMPAIGN_PACK_CODES, RETURN_TO_PARENT_CYCLE, packPrefix } from '../types/arkhamdb';

interface PackSelectorProps {
  packs: ArkhamPack[];
  isLoading: boolean;
  selectedPack: ArkhamPack | null;
  onSelect: (pack: ArkhamPack) => void;
}

function displayCycle(pack: ArkhamPack): string {
  return RETURN_TO_PARENT_CYCLE[pack.code] ?? pack.cycle_code;
}

export function PackSelector({ packs, isLoading, selectedPack, onSelect }: PackSelectorProps) {
  const campaigns = packs
    .filter((p) => CAMPAIGN_PACK_CODES.has(p.code))
    .sort((a, b) => (packPrefix(a) ?? '99').localeCompare(packPrefix(b) ?? '99'));

  const knownCycles = Object.keys(CYCLE_PREFIX_MAP);
  const grouped = knownCycles.reduce<Record<string, ArkhamPack[]>>((acc, cycle) => {
    const cyclePacks = campaigns.filter((p) => displayCycle(p) === cycle);
    if (cyclePacks.length > 0) acc[cycle] = cyclePacks;
    return acc;
  }, {});

  const unknownPacks = campaigns.filter((p) => !knownCycles.includes(displayCycle(p)));

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
            {packPrefix(selectedPack) ?? '??'}
          </span>
          {!packPrefix(selectedPack) && (
            <span className="ml-2 text-arkham-danger">
              (unsupported — try manual entry)
            </span>
          )}
        </p>
      )}
    </div>
  );
}
