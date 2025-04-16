'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ExplanationPopupProps {
  text: string;
  explanation: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ExplanationPopup({ text, explanation, position, onClose }: ExplanationPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        ref={popupRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="fixed z-50 glass-card backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-md"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%)',
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-luxury-accent">Explanation</h3>
          <button
            onClick={onClose}
            className="text-luxury-silver hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-3 pb-2 border-b border-luxury-gray/30">
          <p className="text-xs text-luxury-silver">Selected text:</p>
          <p className="text-sm italic">"{text}"</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none">
          <p>{explanation}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
