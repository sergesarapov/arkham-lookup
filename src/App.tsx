import { useEffect, useState } from 'react';
import type { ArkhamPack } from './types/arkhamdb';
import { packPrefix } from './types/arkhamdb';
import { usePacks } from './hooks/usePacks';
import { useArkhamDB } from './hooks/useArkhamDB';
import { PackSelector } from './components/PackSelector';
import { ResultCard } from './components/ResultCard';

const PACK_KEY = 'arkham-lens-pack';

type Side = 'a' | 'b' | null;

function parseCardInput(cyclePrefix: string, raw: string): { code: string; side: Side } | null {
  const m = raw.trim().match(/^(\d{1,3})([ab]?)$/i);
  if (!m) return null;
  const n = parseInt(m[1] ?? '', 10);
  if (!n || n < 1 || n > 999) return null;
  const letter = (m[2] ?? '').toLowerCase();
  return {
    code: cyclePrefix + String(n).padStart(3, '0'),
    side: letter === 'a' ? 'a' : letter === 'b' ? 'b' : null,
  };
}

function App() {
  const { packs, isLoading: packsLoading } = usePacks();
  const { card, fetchCard, reset: resetCard, error: cardError } = useArkhamDB();

  const [selectedPack, setSelectedPack] = useState<ArkhamPack | null>(null);
  const [number, setNumber] = useState('');
  const [fetching, setFetching] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<Side>(null);

  useEffect(() => {
    if (packs.length === 0) return;
    const saved = localStorage.getItem(PACK_KEY);
    if (saved) {
      const found = packs.find((p) => p.code === saved);
      if (found) setSelectedPack(found);
    }
  }, [packs]);

  const handlePackSelect = (pack: ArkhamPack) => {
    setSelectedPack(pack);
    localStorage.setItem(PACK_KEY, pack.code);
    resetCard();
    setInputError(null);
    setSelectedSide(null);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPack) return;

    const prefix = packPrefix(selectedPack);
    if (!prefix) {
      setInputError('This set is not supported yet.');
      return;
    }

    const parsed = parseCardInput(prefix, number);
    if (!parsed) {
      setInputError('Enter a number like 36 or 41b.');
      return;
    }

    setInputError(null);
    setSelectedSide(parsed.side);
    setFetching(true);
    resetCard();
    const primaryCode = parsed.side ? parsed.code + parsed.side : parsed.code;
    const fallbackCode = parsed.side ? parsed.code : undefined;
    await fetchCard(primaryCode, fallbackCode);
    setFetching(false);
  };

  const dismiss = () => {
    resetCard();
    setNumber('');
    setInputError(null);
    setSelectedSide(null);
  };

  return (
    <div className="h-full flex flex-col bg-arkham-bg text-arkham-cream overflow-hidden">
      <header
        className="shrink-0 px-4 pt-3 pb-2 bg-arkham-surface border-b border-arkham-border"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <h1 className="font-serif text-lg text-arkham-gold tracking-wide">Arkham Lookup</h1>
      </header>

      <PackSelector
        packs={packs}
        isLoading={packsLoading}
        selectedPack={selectedPack}
        onSelect={handlePackSelect}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {!selectedPack ? (
          <p className="text-arkham-muted text-sm font-sans text-center">
            Select a campaign above to get started.
          </p>
        ) : (
          <form onSubmit={(e) => void handleLookup(e)} className="w-full max-w-sm flex flex-col gap-3">
            <label className="text-xs font-sans uppercase tracking-widest text-arkham-muted">
              Card number
            </label>
            <input
              type="text"
              inputMode="text"
              placeholder="e.g. 36 or 41b"
              value={number}
              onChange={(e) => { setNumber(e.target.value); setInputError(null); }}
              autoFocus
              className="w-full bg-arkham-bg border border-arkham-border text-arkham-cream rounded px-4 py-3 text-xl font-mono text-center focus:outline-none focus:border-arkham-gold"
            />
            {inputError && (
              <p className="text-arkham-danger text-xs font-sans text-center">{inputError}</p>
            )}
            {cardError === 'not-found' && (
              <p className="text-arkham-danger text-xs font-sans text-center">Card not found — check the number.</p>
            )}
            {cardError === 'network' && (
              <p className="text-arkham-danger text-xs font-sans text-center">Network error — check your connection.</p>
            )}
            <button
              type="submit"
              disabled={fetching || !number.trim()}
              className="w-full py-3 bg-arkham-gold/20 border border-arkham-gold/50 text-arkham-gold rounded font-sans text-sm hover:bg-arkham-gold/30 transition-colors disabled:opacity-40"
            >
              {fetching ? 'Looking up…' : 'Look up'}
            </button>
          </form>
        )}
      </div>

      {card && <ResultCard card={card} side={selectedSide} onDismiss={dismiss} />}
    </div>
  );
}

export default App;
