'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, HelpCircle } from 'lucide-react';
import { getOffsetsFromSelection } from '@/lib/utils/textPositioning';

interface SelectionPopupProps {
  onClap: (text: string, position: { startOffset: number, endOffset: number }) => void;
  onAnnotate: (text: string, position: { startOffset: number, endOffset: number }) => void;
  onExplain: (text: string, position: { startOffset: number, endOffset: number }) => void;
}

export default function SelectionPopup({ onClap, onAnnotate, onExplain }: SelectionPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [textPosition, setTextPosition] = useState({ startOffset: 0, endOffset: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Listen for selections
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setIsVisible(false);
        return;
      }

      const text = selection.toString().trim();
      
      if (text === '') {
        setIsVisible(false);
        return;
      }

      // Get the range
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Set popup position
      const x = rect.left + rect.width / 2;
      const y = rect.top - 10;
      setPosition({ x, y });
      
      // Set selected text
      setSelectedText(text);
      
      // Find the content container (parent with enhanced-selection class)
      let containerNode = range.startContainer;
      while (containerNode && containerNode.nodeType === Node.TEXT_NODE) {
        containerNode = containerNode.parentNode;
      }
      
      // Find the closest enhanced-selection container
      let container = null;
      let node = containerNode;
      while (node && node !== document.body) {
        if (node instanceof HTMLElement && node.classList.contains('enhanced-selection')) {
          container = node;
          break;
        }
        node = node.parentNode;
      }
      
      if (container) {
        // Get the offsets
        const offsets = getOffsetsFromSelection(container, selection);
        if (offsets) {
          setTextPosition(offsets);
        }
      }
      
      setIsVisible(true);
    };

    const handleClick = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleClap = () => {
    onClap(selectedText, textPosition);
    setIsVisible(false);
  };

  const handleAnnotate = () => {
    onAnnotate(selectedText, textPosition);
    setIsVisible(false);
  };

  const handleExplain = () => {
    onExplain(selectedText, textPosition);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-50 bg-luxury-gray/90 backdrop-blur-sm rounded-full shadow-lg flex items-center"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <button
            onClick={handleClap}
            className="p-3 text-luxury-accent hover:text-luxury-accent/70 transition-colors"
            title="Appreciate"
          >
            <Heart size={20} />
          </button>
          <button
            onClick={handleAnnotate}
            className="p-3 text-luxury-accent hover:text-luxury-accent/70 transition-colors"
            title="Annotate"
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={handleExplain}
            className="p-3 text-luxury-accent hover:text-luxury-accent/70 transition-colors"
            title="Explain This"
          >
            <HelpCircle size={20} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
