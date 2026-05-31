import type { ArkhamCard } from '../types/arkhamdb';

type Side = 'a' | 'b' | null;

interface ResultCardProps {
  card: ArkhamCard;
  side: Side;
  onDismiss: () => void;
}

export function ResultCard({ card, side, onDismiss }: ResultCardProps) {
  const hasBack = card.double_sided && card.back_text;
  const showFront = !hasBack || side !== 'b';
  const showBack = !!hasBack && (side === 'b' || side === null);
  const backName = card.back_name ?? card.name;

  return (
    <div
      className="absolute inset-x-0 bottom-0 max-h-[75vh] rounded-t-2xl card-texture border-t border-arkham-border shadow-2xl animate-slide-up overflow-hidden flex flex-col"
      role="dialog"
      aria-label={`Card: ${card.name}`}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1 shrink-0">
        <div className="w-10 h-1 rounded-full bg-arkham-border" />
      </div>

      <div className="overflow-y-auto px-5 pb-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3 mt-1">
          <div className="flex-1">
            <h2 className="font-serif text-xl text-arkham-cream leading-tight">
              {side === 'b' ? backName : card.name}
            </h2>
            <p className="text-xs text-arkham-gold font-sans mt-0.5">
              {card.type_name}
              {card.faction_name ? ` · ${card.faction_name}` : ''}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="shrink-0 text-arkham-muted hover:text-arkham-cream transition-colors text-xl leading-none p-1"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-3 text-xs font-sans">
          {card.traits && (
            <span className="text-arkham-gold italic">{card.traits}</span>
          )}
          <span className="text-arkham-muted">{card.pack_name}</span>
          <span className="text-arkham-muted font-mono">{card.code}</span>
        </div>

        <hr className="border-arkham-border mb-3" />

        {/* Front side */}
        {showFront && card.text && (
          <>
            {hasBack && side === null && (
              <p className="text-xs font-sans uppercase tracking-widest text-arkham-muted mb-1">Front</p>
            )}
            <div
              className="text-sm font-sans text-arkham-cream leading-relaxed whitespace-pre-wrap mb-3"
              dangerouslySetInnerHTML={{ __html: card.text }}
            />
            {card.flavor && side !== 'b' && (
              <p className="text-xs font-serif italic text-arkham-muted leading-relaxed border-t border-arkham-border pt-3 mb-3">
                {card.flavor.replace(/<[^>]+>/g, '')}
              </p>
            )}
          </>
        )}

        {/* Back side */}
        {showBack && card.back_text && (
          <>
            {side === null && (
              <hr className="border-arkham-border mb-3" />
            )}
            {hasBack && side === null && (
              <p className="text-xs font-sans uppercase tracking-widest text-arkham-muted mb-1">Back</p>
            )}
            <div
              className="text-sm font-sans text-arkham-cream leading-relaxed whitespace-pre-wrap mb-3"
              dangerouslySetInnerHTML={{ __html: card.back_text }}
            />
            {card.back_flavor && (
              <p className="text-xs font-serif italic text-arkham-muted leading-relaxed border-t border-arkham-border pt-3">
                {card.back_flavor.replace(/<[^>]+>/g, '')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
