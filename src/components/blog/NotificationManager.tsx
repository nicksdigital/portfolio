'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, ArrowRight } from 'lucide-react';

interface Notification {
  id: string;
  type: 'clap' | 'annotation';
  text: string;
  count?: number;
  annotationId?: number;
  timestamp: number;
}

interface NotificationManagerProps {
  onJumpToAnnotation?: (id: number) => void;
}

export default function NotificationManager({ onJumpToAnnotation }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Register the notification manager in the window object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.notificationManager = {
        addClapNotification: (text: string, count: number) => {
          addNotification({
            type: 'clap',
            text,
            count,
          });
        },
        addAnnotationNotification: (text: string, annotationId: number) => {
          addNotification({
            type: 'annotation',
            text,
            annotationId,
          });
        },
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        delete window.notificationManager;
      }
    };
  }, []);

  const addNotification = ({ type, text, count, annotationId }: { type: 'clap' | 'annotation', text: string, count?: number, annotationId?: number }) => {
    const id = `${type}-${Date.now()}`;
    
    setNotifications(current => [
      ...current,
      {
        id,
        type,
        text: text.length > 50 ? text.substring(0, 50) + '...' : text,
        count,
        annotationId,
        timestamp: Date.now(),
      }
    ]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(current => current.filter(n => n.id !== id));
    }, 5000);
  };

  const handleAnnotationClick = (annotationId?: number) => {
    if (annotationId && onJumpToAnnotation) {
      onJumpToAnnotation(annotationId);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-xs w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className={`
              glass-card backdrop-blur-sm rounded-lg p-3 shadow-lg
              ${notification.type === 'annotation' ? 'border-l-2 border-luxury-accent' : ''}
              pointer-events-auto
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                p-1.5 rounded-full
                ${notification.type === 'clap' ? 'bg-luxury-accent/20 text-luxury-accent' : 'bg-luxury-accent/20 text-luxury-accent'}
              `}>
                {notification.type === 'clap' ? (
                  <Heart size={16} className="fill-luxury-accent" />
                ) : (
                  <MessageSquare size={16} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-luxury-silver mb-1">
                  {notification.type === 'clap' 
                    ? `Someone appreciated this text ${notification.count && notification.count > 1 ? `(${notification.count})` : ''}`
                    : 'New annotation added'
                  }
                </p>
                <p className="text-white text-sm italic">"{notification.text}"</p>
                
                {notification.type === 'annotation' && notification.annotationId && (
                  <button 
                    onClick={() => handleAnnotationClick(notification.annotationId)}
                    className="mt-2 text-xs text-luxury-accent hover:text-luxury-accent/80 transition-colors flex items-center gap-1"
                  >
                    View annotation <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
