'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComment, FaUserCircle } from 'react-icons/fa';
import { FaHandsClapping } from 'react-icons/fa6';
import { X } from 'lucide-react';

interface NotificationProps {
  type: 'clap' | 'annotation';
  message: string;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export default function RealtimeNotification({
  type,
  message,
  onClose,
  onAction,
  actionLabel,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Handle close animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '100%' }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-card p-3 rounded-lg shadow-lg max-w-xs"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 rounded-full bg-luxury-accent/10">
              {type === 'clap' ? (
                <FaHandsClapping className="text-luxury-accent" size={16} />
              ) : (
                <FaComment className="text-luxury-accent" size={16} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FaUserCircle size={14} className="text-luxury-silver" />
                <span className="text-xs text-luxury-silver">Just now</span>
              </div>

              <p className="text-sm mb-2">{message}</p>

              {onAction && actionLabel && (
                <button
                  onClick={onAction}
                  className="text-xs text-luxury-accent hover:text-luxury-accent/80 transition-colors"
                >
                  {actionLabel}
                </button>
              )}
            </div>

            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-full hover:bg-luxury-gray/30 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
