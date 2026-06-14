import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cardDisplayName } from '../types/arkhamdb';
import type { ArkhamCard, Side } from '../types/arkhamdb';

interface ResultCardProps {
  card: ArkhamCard;
  side: Side;
  isSidedFallback?: boolean;
  onDismiss: () => void;
}

export function ResultCard({ card, side, isSidedFallback, onDismiss }: ResultCardProps) {
  const hasBack = card.double_sided && card.back_text;
  const showFront = !hasBack || side !== 'b';
  const showBack = !!hasBack && (side === 'b' || side === null);

  const [modalImage, setModalImage] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);
  const dragging = useRef(false);
  const startY = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    startY.current = e.clientY;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  };

  const onPointerUp = () => {
    dragging.current = false;
    if (dragY > 80) {
      onDismiss();
    } else {
      setDragY(0);
    }
  };

  return (
    <>
    <div
      className="absolute inset-x-0 bottom-0 max-h-[75vh] rounded-t-2xl card-texture border-t border-arkham-border shadow-2xl animate-slide-up overflow-hidden flex flex-col"
      role="dialog"
      aria-label={`Card: ${card.name}`}
      style={{
        transform: `translateY(${dragY}px)`,
        transition: dragging.current ? 'none' : 'transform 0.25s ease-out',
      }}
    >
      {/* Drag handle */}
      <div className="relative flex items-center justify-center w-full py-6">
        <div
          className="absolute inset-0 flex justify-center items-center cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="w-10 h-1 rounded-full bg-arkham-border" />
        </div>
        <button
          onClick={onDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 shrink-0 text-arkham-muted hover:text-arkham-cream transition-colors text-xl leading-none p-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="overflow-y-auto px-5 pb-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3 mt-1">
          <div className="flex-1">
            <h2 className="font-serif text-xl text-arkham-cream leading-tight">
              {cardDisplayName(card, side)}
            </h2>
            <p className="text-xs text-arkham-gold font-sans mt-0.5">
              {card.type_name}
              {card.faction_name ? ` · ${card.faction_name}` : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-3 text-xs font-sans">
              {card.traits && (
                <span className="text-arkham-gold italic">{card.traits}</span>
              )}
              <span className="text-arkham-muted">{card.pack_name}</span>
              <span className="text-arkham-muted font-mono">{card.code}</span>
            </div>

            {isSidedFallback && (
              <p className="text-xs font-sans text-arkham-burgundy mb-3">
                This card has multiple sides — showing side A. Add a, b, c… to look up a specific side.
              </p>
            )}

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
          {(card.imagesrc || card.backimagesrc) && (
            <div className="shrink-0 flex flex-col gap-2">
              {card.imagesrc && (
                <img
                  src={`https://arkhamdb.com${card.imagesrc}`}
                  alt={card.name}
                  className="w-32 rounded-lg shadow-lg cursor-zoom-in"
                  onClick={() => setModalImage(`https://arkhamdb.com${card.imagesrc}`)}
                />
              )}
              {card.backimagesrc && (
                <img
                  src={`https://arkhamdb.com${card.backimagesrc}`}
                  alt={`${card.name} (back)`}
                  className="w-32 rounded-lg shadow-lg cursor-zoom-in"
                  onClick={() => setModalImage(`https://arkhamdb.com${card.backimagesrc}`)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {modalImage && createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={() => setModalImage(null)}
      >
        <img
          src={modalImage}
          alt={card.name}
          className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
          onClick={e => e.stopPropagation()}
        />
      </div>,
      document.body,
    )}
    </>
  );
}
