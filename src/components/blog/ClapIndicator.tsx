'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface ClapIndicatorProps {
  count: number;
  isNew?: boolean;
}

export default function ClapIndicator({ count, isNew = false }: ClapIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center gap-1 px-2 py-1 
        bg-luxury-accent/10 text-luxury-accent 
        rounded-full text-xs font-medium
        ${isNew ? 'animate-pulse' : ''}
      `}
    >
      <Heart size={12} className="fill-luxury-accent" />
      <span>{count}</span>
    </motion.div>
  );
}
