import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getGlossaryEntry, GlossaryEntry } from '../data/glossaryData';

interface GlossaryTermProps {
  /** The term name or ID to look up in the glossary */
  term: string;
  /** Explicit display text if different from children or canonical title */
  display?: React.ReactNode;
  /** Inline text content to wrap with the dotted underline */
  children?: React.ReactNode;
  /** Custom additional styling for the trigger text */
  className?: string;
  /** Optional custom definition override if ever needed */
  customDefinition?: string;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({
  term,
  display,
  children,
  className = '',
  customDefinition
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    position: 'top' | 'bottom';
    width: number;
    arrowLeft: number;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const entry: GlossaryEntry | undefined = getGlossaryEntry(term);
  const title = entry ? entry.title : term;
  const definition = customDefinition || (entry ? entry.definition : 'A core concept in game theory.');
  const shortTag = entry?.shortTag || 'Game Theory Concept';

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Responsive width: up to 320px, but always fits with at least 16px padding on both sides
    const tooltipWidth = Math.min(320, Math.max(260, viewportWidth - 32));

    // Calculate center of the trigger element
    const triggerCenter = rect.left + rect.width / 2;

    // Calculate left coordinate clamped within viewport margins [16px, viewportWidth - tooltipWidth - 16px]
    let left = triggerCenter - tooltipWidth / 2;
    left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));

    // Relative arrow position inside the tooltip pointing at the trigger
    const arrowLeft = Math.max(16, Math.min(triggerCenter - left, tooltipWidth - 16));

    // Determine whether to show above or below based on available space
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const showAbove = spaceBelow < 180 && spaceAbove > spaceBelow;

    const top = showAbove
      ? Math.max(12, rect.top - 8)
      : Math.min(viewportHeight - 160, rect.bottom + 8);

    setCoords({
      top,
      left,
      position: showAbove ? 'top' : 'bottom',
      width: tooltipWidth,
      arrowLeft
    });
  }, []);

  // Update position when opened or when scrolling/resizing
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  // Outside click/touch detection to close tooltip on tap elsewhere
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle desktop hover interactions
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
    // Only open on hover if screen is large enough (desktop/mouse)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Handle click / tap on mobile and desktop
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  const renderedContent = children || display || title;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-expanded={isOpen}
        aria-label={`${title} glossary definition`}
        className={`inline-flex items-baseline text-left font-inherit cursor-pointer border-b border-dotted border-sky-400/80 hover:border-sky-300 text-sky-200 hover:text-white transition-colors duration-150 relative focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 rounded-sm touch-manipulation after:content-[''] after:absolute after:-inset-x-2 after:-inset-y-2 after:min-h-[44px] after:z-10 ${className}`}
      >
        <span className="relative z-10">{renderedContent}</span>
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'fixed',
              top: coords.position === 'top' ? undefined : `${coords.top}px`,
              bottom: coords.position === 'top' ? `${window.innerHeight - coords.top}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999
            }}
            role="tooltip"
            className="animate-in fade-in-50 zoom-in-95 duration-150 p-3 rounded-xl bg-slate-900/98 backdrop-blur-md border border-sky-500/50 shadow-2xl shadow-sky-950/80 ring-1 ring-sky-500/20 text-slate-100"
          >
            {/* Pointer arrow */}
            <div
              style={{ left: `${coords.arrowLeft}px` }}
              className={`absolute -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-sky-500/50 rotate-45 ${
                coords.position === 'top'
                  ? 'bottom-[-6px] border-r border-b'
                  : 'top-[-6px] border-l border-t'
              }`}
            />

            {/* Header with Title, Tag, and Close Button */}
            <div className="flex items-start justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-800">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-extrabold text-white tracking-tight">
                    {title}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60 uppercase">
                    {shortTag}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="shrink-0 text-slate-400 hover:text-white p-1 -m-1 rounded-md transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                aria-label="Close tooltip"
              >
                <span className="text-xs font-bold leading-none">✕</span>
              </button>
            </div>

            {/* Plain English definition */}
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              {definition}
            </p>

            {/* Quick helper tip */}
            <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="italic">💡 Solo Lab Game Theory Concept</span>
              <span className="text-slate-500">Tap anywhere to close</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

interface MatchSpan {
  start: number;
  end: number;
  termId: string;
  matchedText: string;
}

const KEYWORD_MAPPINGS: { pattern: RegExp; termId: string }[] = [
  { pattern: /\bsubgame\s+perfect\s+nash\s+equilibrium\b/gi, termId: 'spne' },
  { pattern: /\bsubgame\s+perfect\s+equilibrium\b/gi, termId: 'spne' },
  { pattern: /\bsubgame\s+perfection\b/gi, termId: 'spne' },
  { pattern: /\bSPNE\b/g, termId: 'spne' },
  { pattern: /\bbackward\s+induction\b/gi, termId: 'backward-induction' },
  { pattern: /\bevolutionarily\s+stable\s+strateg(?:y|ies)\b/gi, termId: 'ess' },
  { pattern: /\bevolutionary\s+stable\s+strateg(?:y|ies)\b/gi, termId: 'ess' },
  { pattern: /\bmixed\s+ESS\b/gi, termId: 'ess' },
  { pattern: /\bESS\b/g, termId: 'ess' },
  { pattern: /\bstrictly\s+dominant\s+strateg(?:y|ies)\b/gi, termId: 'dominant-strategy' },
  { pattern: /\bweakly\s+dominant\s+strateg(?:y|ies)\b/gi, termId: 'dominant-strategy' },
  { pattern: /\bdominant\s+strateg(?:y|ies)\b/gi, termId: 'dominant-strategy' },
  { pattern: /\bmixed-strategy\s+nash\s+equilibrium\b/gi, termId: 'mixed-strategy' },
  { pattern: /\bmixed-strategy\b/gi, termId: 'mixed-strategy' },
  { pattern: /\bmixed\s+strateg(?:y|ies)\b/gi, termId: 'mixed-strategy' },
  { pattern: /\bminimax\s+randomization\b/gi, termId: 'minimax' },
  { pattern: /\bminimax\s+EV\b/gi, termId: 'minimax' },
  { pattern: /\bminimax\b/gi, termId: 'minimax' },
  { pattern: /\bnash\s+equilibri(?:um|a)\b/gi, termId: 'nash-equilibrium' },
  { pattern: /\bnash\s+trap\b/gi, termId: 'nash-equilibrium' },
  { pattern: /\bnash\s+benchmark\b/gi, termId: 'nash-equilibrium' },
  { pattern: /\bpareto\s+efficienc(?:y|ies)\b/gi, termId: 'pareto-efficiency' },
  { pattern: /\bpareto\s+optimum\b/gi, termId: 'pareto-efficiency' },
  { pattern: /\bpareto\s+optimal\b/gi, termId: 'pareto-efficiency' },
  { pattern: /\bpareto-dominated\b/gi, termId: 'pareto-efficiency' },
  { pattern: /\bpareto-dominates\b/gi, termId: 'pareto-efficiency' },
  { pattern: /\bpareto\b/gi, termId: 'pareto-efficiency' },
  { pattern: /\bfree-riding\b/gi, termId: 'free-riding' },
  { pattern: /\bfree\s+riding\b/gi, termId: 'free-riding' },
  { pattern: /\bfree-riders?\b/gi, termId: 'free-riding' },
  { pattern: /\bfree\s+riders?\b/gi, termId: 'free-riding' },
  { pattern: /\btit-for-tat\b/gi, termId: 'tit-for-tat' },
  { pattern: /\btit\s+for\s+tat\b/gi, termId: 'tit-for-tat' },
  { pattern: /\bsocial\s+optimum\b/gi, termId: 'social-optimum' },
  { pattern: /\bsocial\s+maximum\b/gi, termId: 'social-optimum' },
  { pattern: /\bpayoff-dominant\b/gi, termId: 'payoff-dominance' },
  { pattern: /\bpayoff\s+dominant\b/gi, termId: 'payoff-dominance' },
  { pattern: /\brisk-dominant\b/gi, termId: 'risk-dominance' },
  { pattern: /\brisk\s+dominant\b/gi, termId: 'risk-dominance' },
];

export function annotateTextWithGlossary(text: string): React.ReactNode[] {
  if (!text) return [text];

  const matches: MatchSpan[] = [];

  for (const { pattern, termId } of KEYWORD_MAPPINGS) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      const start = m.index;
      const end = m.index + m[0].length;
      const overlaps = matches.some(
        existing => !(end <= existing.start || start >= existing.end)
      );
      if (!overlaps) {
        matches.push({
          start,
          end,
          termId,
          matchedText: m[0]
        });
      }
    }
  }

  if (matches.length === 0) {
    return [text];
  }

  matches.sort((a, b) => a.start - b.start);

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach((m, idx) => {
    if (m.start > cursor) {
      nodes.push(text.slice(cursor, m.start));
    }
    nodes.push(
      <GlossaryTerm key={`glossary-${idx}-${m.start}`} term={m.termId}>
        {m.matchedText}
      </GlossaryTerm>
    );
    cursor = m.end;
  });

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

export const AnnotateGlossaryText: React.FC<{ text: string; className?: string }> = ({
  text,
  className
}) => {
  const nodes = annotateTextWithGlossary(text);
  return <span className={className}>{nodes}</span>;
};

export default GlossaryTerm;
