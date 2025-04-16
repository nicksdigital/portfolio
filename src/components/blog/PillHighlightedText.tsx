'use client';

import { useEffect, useRef, useState } from 'react';
import { createRangeFromOffsets } from '@/lib/utils/textPositioning';

interface Clap {
  id: number;
  textFragment: string;
  position: { startOffset: number; endOffset: number };
  count: number;
  domPosition?: { top: number; left: number; width: number };
  isNew?: boolean;
}

interface PillHighlightedTextProps {
  content: string;
  claps: Clap[];
  onHighlightPositionsFound?: (positions: Map<number, { top: number; left: number; width: number }>) => void;
}

export default function PillHighlightedText({ content, claps, onHighlightPositionsFound }: PillHighlightedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Map<number, { top: number; left: number; width: number }>>(new Map());

  // Calculate positions for clap indicators
  useEffect(() => {
    if (!containerRef.current || claps.length === 0) return;

    const newPositions = new Map();

    // Wait for content to render
    setTimeout(() => {
      claps.forEach(clap => {
        try {
          // Create a range from the offsets
          const range = createRangeFromOffsets(
            containerRef.current!,
            clap.position.startOffset,
            clap.position.endOffset
          );

          if (range) {
            const rect = range.getBoundingClientRect();
            const containerRect = containerRef.current!.getBoundingClientRect();

            newPositions.set(clap.id, {
              top: rect.top - containerRect.top + containerRef.current!.scrollTop,
              left: rect.left - containerRect.left + containerRef.current!.scrollLeft,
              width: rect.width
            });
          }
        } catch (error) {
          console.error('Error calculating position for clap:', error);
        }
      });

      setPositions(newPositions);

      // Pass positions to parent if callback provided
      if (onHighlightPositionsFound) {
        onHighlightPositionsFound(newPositions);
      }
    }, 100);
  }, [content, claps, onHighlightPositionsFound]);

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="prose prose-invert prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Clap indicators */}
      {Array.from(positions.entries()).map(([id, position]) => {
        const clap = claps.find(c => c.id === id);
        if (!clap) return null;

        return (
          <div
            key={id}
            className="absolute pointer-events-none"
            style={{
              top: `${position.top - 8}px`,
              left: `${position.left + position.width / 2}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className={`
              bg-luxury-accent/20 backdrop-blur-sm text-luxury-accent px-1.5 py-0.5 
              rounded-full text-xs font-medium flex items-center gap-1
              ${clap.isNew ? 'animate-pulse' : ''}
            `}>
              <span>❤️</span>
              <span>{clap.count}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
