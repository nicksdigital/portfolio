'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface AnnotationFormProps {
  selectedText: string;
  position: { startOffset: number; endOffset: number };
  onSubmit: (note: string) => void;
  onCancel: () => void;
}

export default function AnnotationForm({ selectedText, position, onSubmit, onCancel }: AnnotationFormProps) {
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim()) {
      onSubmit(note);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="glass-card max-w-lg w-full rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-luxury-accent">Add Annotation</h3>
          <button
            onClick={onCancel}
            className="text-luxury-silver hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-luxury-silver mb-2">Selected text:</p>
          <div className="bg-luxury-black/30 p-3 rounded-lg">
            <p className="text-white italic">"{selectedText}"</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="annotation" className="block text-sm text-luxury-silver mb-2">
              Your annotation:
            </label>
            <textarea
              id="annotation"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-luxury-black/30 border border-luxury-gray/50 rounded-lg p-3 text-white focus:border-luxury-accent focus:outline-none focus:ring-1 focus:ring-luxury-accent min-h-[100px]"
              placeholder="Add your thoughts, questions, or insights..."
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-luxury-gray/50 hover:bg-luxury-gray/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!note.trim()}
              className="px-4 py-2 bg-luxury-accent text-black hover:bg-luxury-accent/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
