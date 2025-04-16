'use client';

import { useState, useEffect } from 'react';
import { FaLayerGroup } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';

interface LayerToggleProps {
  layers: string[];
  defaultVisibleLayers: string[];
  onToggle: (layer: string, isVisible: boolean) => void;
}

export default function LayerToggle({ layers, defaultVisibleLayers, onToggle }: LayerToggleProps) {
  const [visibleLayers, setVisibleLayers] = useState<string[]>(defaultVisibleLayers);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize with default visible layers
  useEffect(() => {
    setVisibleLayers(defaultVisibleLayers);
  }, [defaultVisibleLayers]);

  const toggleLayer = (layer: string) => {
    const isVisible = !visibleLayers.includes(layer);
    const updatedLayers = isVisible 
      ? [...visibleLayers, layer]
      : visibleLayers.filter(l => l !== layer);
    
    // Ensure at least one layer is visible - always keep headline
    if (updatedLayers.length === 0) {
      updatedLayers.push('headline');
    }
    
    setVisibleLayers(updatedLayers);
    onToggle(layer, isVisible);
  };

  const getButtonLabel = (layer: string) => {
    switch (layer) {
      case 'headline':
        return 'Headline';
      case 'context':
        return 'Context';
      case 'detail':
        return 'Detail';
      case 'discussion':
        return 'Discussion';
      default:
        return layer.charAt(0).toUpperCase() + layer.slice(1);
    }
  };

  const getButtonColor = (layer: string) => {
    const isVisible = visibleLayers.includes(layer);
    
    switch (layer) {
      case 'headline':
        return isVisible ? 'bg-luxury-accent text-black' : 'bg-luxury-black/50 text-luxury-accent';
      case 'context':
        return isVisible ? 'bg-luxury-accent/80 text-black' : 'bg-luxury-black/50 text-luxury-accent/80';
      case 'detail':
        return isVisible ? 'bg-luxury-accent/60 text-black' : 'bg-luxury-black/50 text-luxury-accent/60';
      case 'discussion':
        return isVisible ? 'bg-luxury-accent/40 text-black' : 'bg-luxury-black/50 text-luxury-accent/40';
      default:
        return isVisible ? 'bg-luxury-accent/60 text-black' : 'bg-luxury-black/50 text-luxury-silver';
    }
  };

  return (
    <div className="sticky top-4 z-10 mb-6">
      <div className="flex justify-end">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-luxury-accent/10 hover:bg-luxury-accent/20 text-luxury-accent rounded-full transition-colors"
          >
            <FaLayerGroup size={16} />
            <span>Layers</span>
            <span className="bg-luxury-accent text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {visibleLayers.length}
            </span>
          </button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 p-2 bg-luxury-gray/90 backdrop-blur-sm rounded-lg shadow-xl min-w-[180px]"
              >
                <div className="flex flex-col gap-2">
                  {layers.map((layer) => (
                    <button
                      key={layer}
                      onClick={() => toggleLayer(layer)}
                      disabled={layer === 'headline'} // Headline is always visible
                      className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${getButtonColor(layer)}`}
                    >
                      <span>{getButtonLabel(layer)}</span>
                      <span className={`w-3 h-3 rounded-full ${visibleLayers.includes(layer) ? 'bg-white' : 'bg-transparent border border-luxury-silver'}`} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
