'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Pencil, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface Annotation {
  id: number;
  textFragment: string;
  position: { startOffset: number; endOffset: number };
  note: string;
  userId: string;
  createdAt: string;
}

interface AnnotationPanelProps {
  annotations: Annotation[];
  onEdit: (id: number, note: string) => void;
  onDelete: (id: number) => void;
  currentUserId: string;
  activeAnnotationId: number | null;
  onAnnotationSelected: (id: number | null) => void;
}

export default function AnnotationPanel({
  annotations,
  onEdit,
  onDelete,
  currentUserId,
  activeAnnotationId,
  onAnnotationSelected
}: AnnotationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNote, setEditNote] = useState('');

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      // Close any active editing
      setEditingId(null);
    }
  };

  const startEditing = (annotation: Annotation) => {
    setEditingId(annotation.id);
    setEditNote(annotation.note);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditNote('');
  };

  const saveEdit = (id: number) => {
    if (editNote.trim()) {
      onEdit(id, editNote);
      setEditingId(null);
      setEditNote('');
    }
  };

  const confirmDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this annotation?')) {
      onDelete(id);
    }
  };

  const handleAnnotationClick = (id: number) => {
    onAnnotationSelected(id === activeAnnotationId ? null : id);
  };

  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-20">
      {/* Toggle Button */}
      <button
        onClick={togglePanel}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-l-lg bg-luxury-accent/20 backdrop-blur-sm
          text-luxury-accent hover:bg-luxury-accent/30 transition-colors
          ${annotations.length > 0 ? 'animate-pulse' : ''}
        `}
        aria-label={isOpen ? 'Close annotations' : 'Open annotations'}
      >
        {isOpen ? <ChevronRight size={20} /> : <><MessageSquare size={16} /> {annotations.length > 0 && <span className="absolute -top-1 -right-1 bg-luxury-accent text-black text-xs w-4 h-4 rounded-full flex items-center justify-center">{annotations.length}</span>}</>}
      </button>

      {/* Annotation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-80 glass-card backdrop-blur-sm p-4 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-luxury-accent flex items-center gap-2">
                <MessageSquare size={20} />
                Annotations
                <span className="bg-luxury-accent text-luxury-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {annotations.length}
                </span>
              </h3>
              <button
                onClick={togglePanel}
                className="text-luxury-silver hover:text-white transition-colors"
                aria-label="Close annotations"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {annotations.length === 0 ? (
              <div className="text-center py-8 text-luxury-silver">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p>No annotations yet</p>
                <p className="text-sm mt-2 opacity-70">Select text to add annotations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`
                      glass-card p-3 rounded-lg
                      ${activeAnnotationId === annotation.id ? 'ring-2 ring-luxury-accent' : ''}
                      ${annotation.userId === currentUserId ? 'border-l-2 border-luxury-accent' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-luxury-silver">
                        {annotation.createdAt ? format(new Date(annotation.createdAt), 'MMM d, yyyy - h:mm a') : 'Just now'}
                      </p>
                      {annotation.userId === currentUserId && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(annotation)}
                            className="text-luxury-silver hover:text-luxury-accent transition-colors"
                            aria-label="Edit annotation"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => confirmDelete(annotation.id)}
                            className="text-luxury-silver hover:text-red-500 transition-colors"
                            aria-label="Delete annotation"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mb-2 text-sm">
                      <p className="text-luxury-silver">Selected text:</p>
                      <button
                        onClick={() => handleAnnotationClick(annotation.id)}
                        className="text-white italic bg-luxury-black/30 p-2 rounded-lg w-full text-left hover:bg-luxury-black/40 transition-colors"
                      >
                        "{annotation.textFragment.length > 50
                          ? annotation.textFragment.substring(0, 50) + '...'
                          : annotation.textFragment}"
                      </button>
                    </div>

                    {editingId === annotation.id ? (
                      <div>
                        <textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="w-full bg-luxury-black/30 border border-luxury-gray/50 rounded-lg p-2 text-white focus:border-luxury-accent focus:outline-none focus:ring-1 focus:ring-luxury-accent text-sm min-h-[80px] mb-2"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEditing}
                            className="px-2 py-1 text-xs bg-luxury-gray/50 hover:bg-luxury-gray/80 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(annotation.id)}
                            className="px-2 py-1 text-xs bg-luxury-accent text-black hover:bg-luxury-accent/80 rounded-lg transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white">{annotation.note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
