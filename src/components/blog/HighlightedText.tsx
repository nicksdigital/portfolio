'use client';

import { useRef, useEffect } from 'react';
import { findTextPositions } from '@/lib/utils/textPositioning';

interface HighlightedTextProps {
  content: string;
  highlights: {
    id: number;
    textFragment: string;
    count: number;
    position: { startOffset: number; endOffset: number };
  }[];
  onHighlightPositionsFound: (positions: Map<number, { top: number; left: number; width: number }>) => void;
}

export default function HighlightedText({ 
  content, 
  highlights, 
  onHighlightPositionsFound 
}: HighlightedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Find positions of highlighted text fragments
  useEffect(() => {
    if (!containerRef.current || highlights.length === 0) return;
    
    // Wait for the content to be rendered
    const timer = setTimeout(() => {
      const positions = new Map<number, { top: number; left: number; width: number }>();
      
      highlights.forEach(highlight => {
        const textPositions = findTextPositions(containerRef.current!, highlight.textFragment);
        
        if (textPositions.length > 0) {
          // For simplicity, we'll use the first occurrence
          // In a real app, you would use the position data to find the exact occurrence
          const position = textPositions[0];
          
          // Create a range to get the width
          const range = document.createRange();
          const textNodes = Array.from(containerRef.current!.querySelectorAll('*'))
            .filter(node => node.textContent?.includes(highlight.textFragment))
            .flatMap(node => Array.from(node.childNodes))
            .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent?.includes(highlight.textFragment));
          
          if (textNodes.length > 0) {
            const textNode = textNodes[0];
            const text = textNode.textContent || '';
            const index = text.indexOf(highlight.textFragment);
            
            if (index !== -1) {
              range.setStart(textNode, index);
              range.setEnd(textNode, index + highlight.textFragment.length);
              const rect = range.getBoundingClientRect();
              
              positions.set(highlight.id, {
                top: position.top,
                left: position.left,
                width: rect.width
              });
            }
          }
        }
      });
      
      onHighlightPositionsFound(positions);
    }, 500); // Give time for the content to render
    
    return () => clearTimeout(timer);
  }, [content, highlights, onHighlightPositionsFound]);
  
  // Process the content to add highlight spans
  const processContent = () => {
    let processedContent = content;
    
    // Sort highlights by length (longest first) to avoid nested replacements
    const sortedHighlights = [...highlights].sort(
      (a, b) => b.textFragment.length - a.textFragment.length
    );
    
    // Replace each highlight with a span
    sortedHighlights.forEach(highlight => {
      const highlightId = `highlight-${highlight.id}`;
      const highlightHtml = `<span class="bg-luxury-accent/10 rounded-full px-1 py-0.5 text-luxury-accent" data-highlight-id="${highlightId}">${highlight.textFragment}</span>`;
      
      // Use a regex with word boundaries to avoid partial replacements
      const regex = new RegExp(`\\b${highlight.textFragment}\\b`, 'g');
      processedContent = processedContent.replace(regex, highlightHtml);
    });
    
    return processedContent;
  };
  
  return (
    <div 
      ref={containerRef}
      className="prose prose-invert prose-lg max-w-none relative"
      dangerouslySetInnerHTML={{ __html: processContent() }}
    />
  );
}
