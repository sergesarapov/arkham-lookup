import type { HistoryEntry } from '../hooks/useCardHistory';

interface HistoryListProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (entry: HistoryEntry) => void;
}

export function HistoryList({ history, onSelect, onRemove }: HistoryListProps) {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-sm flex flex-col gap-2">
      <p className="text-xs font-sans uppercase tracking-widest text-arkham-muted">
        Recent lookups
      </p>
      <ul className="flex flex-col gap-1 max-h-48 overflow-y-auto">
        {history.map((entry) => (
          <li
            key={`${entry.code}:${entry.side ?? ''}`}
            className="flex items-center gap-1 bg-arkham-surface border border-arkham-border rounded"
          >
            <button
              onClick={() => onSelect(entry)}
              className="flex-1 flex items-baseline gap-2 text-left px-3 py-2 text-sm font-sans text-arkham-cream truncate hover:text-arkham-gold transition-colors"
            >
              <span className="font-mono text-xs text-arkham-muted shrink-0">{entry.number}</span>
              <span className="truncate">{entry.name}</span>
              <span className="text-xs text-arkham-gold shrink-0">{entry.card.type_name}</span>
            </button>
            <button
              onClick={() => onRemove(entry)}
              aria-label={`Remove ${entry.name} from history`}
              className="shrink-0 text-arkham-muted hover:text-arkham-danger transition-colors text-lg leading-none px-3 py-2"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
