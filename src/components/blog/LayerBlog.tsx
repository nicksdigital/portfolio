'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LayerToggle from './LayerToggle';
import SelectionPopup from './SelectionPopup';
import AnnotationForm from './AnnotationForm';
import ClapIndicator from './ClapIndicator';
import AnnotationPanel from './AnnotationPanel';
import ExplanationPopup from './ExplanationPopup';
import NotificationManager from './NotificationManager';
import PillHighlightedText from './PillHighlightedText';
import { websocketService } from '@/lib/services/websocketService';
import { findPositionByOffset } from '@/lib/utils/textPositioning';

interface Clap {
  id: number;
  textFragment: string;
  position: { startOffset: number; endOffset: number };
  count: number;
}

interface Annotation {
  id: number;
  textFragment: string;
  position: { startOffset: number; endOffset: number };
  note: string;
  userId: string;
  createdAt: string;
}

interface LayerBlogProps {
  articleId: number;
  articleSlug: string;
  articleLocale: string;
  layers: {
    headline: { content: string };
    context: { content: string };
    detail: { content: string };
    discussion: { content: string };
  };
  userId: string;
}

export default function LayerBlog({
  articleId,
  articleSlug,
  articleLocale,
  layers,
  userId,
}: LayerBlogProps) {
  // Layer visibility state
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['headline', 'context']);

  // Claps and annotations state
  const [claps, setClaps] = useState<Clap[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // Real-time state
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [newClaps, setNewClaps] = useState<Clap[]>([]);
  const [newAnnotations, setNewAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotationId, setActiveAnnotationId] = useState<number | null>(null);

  // Highlight positions
  const [highlightPositions, setHighlightPositions] = useState<Map<number, { top: number; left: number; width: number }>>(new Map());

  // UI state
  const [selectedText, setSelectedText] = useState('');
  const [selectedPosition, setSelectedPosition] = useState({ startOffset: 0, endOffset: 0 });
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState('');
  const [explanationPosition, setExplanationPosition] = useState({ x: 0, y: 0 });

  // Refs
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate positions for claps and annotations
  const calculatePositions = useCallback(() => {
    if (!contentRef.current) return;

    // Process new claps and add position information
    const processedClaps = newClaps.map(clap => {
      const position = findPositionByOffset(
        contentRef.current!,
        clap.textFragment,
        clap.position
      );

      return {
        ...clap,
        domPosition: position || { top: 100, left: 100 } // Fallback position
      };
    });

    // Add the processed claps to the main claps array
    if (processedClaps.length > 0) {
      setClaps(prev => {
        // Create a new array to avoid mutating the previous state
        const merged = [...prev];

        for (const newClap of processedClaps) {
          // Check if this is a duplicate by comparing text and position
          const existingIndex = merged.findIndex(c => 
            c.textFragment === newClap.textFragment && 
            c.position.startOffset === newClap.position.startOffset
          );

          if (existingIndex >= 0) {
            // Update existing clap with new count and position
            merged[existingIndex] = {
              ...merged[existingIndex],
              count: newClap.count,
              domPosition: newClap.domPosition,
              isNew: true
            };
          } else {
            // Add as a new clap
            merged.push({
              ...newClap,
              isNew: true
            });
          }
        }

        return merged;
      });

      // Clear the new claps
      setNewClaps([]);
    }
  }, [newClaps]);

  // Fetch claps and annotations on mount and connect to WebSocket
  useEffect(() => {
    const fetchClaps = async () => {
      try {
        console.log(`[LayerBlog] Fetching claps for article ${articleId}`);
        const response = await fetch(`/api/articles/${articleId}/claps`);
        if (response.ok) {
          const data = await response.json();
          console.log('[LayerBlog] Fetched claps:', data);

          // Add position information to each clap
          setClaps(data.map((clap: Clap) => ({
            ...clap,
            domPosition: { top: 100, left: 100 } // Default position until calculated
          })));
        } else {
          console.error('[LayerBlog] Failed to fetch claps:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching claps:', error);
      }
    };

    const fetchAnnotations = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}/annotations`);
        if (response.ok) {
          const data = await response.json();
          setAnnotations(data);
        }
      } catch (error) {
        console.error('Error fetching annotations:', error);
      }
    };

    // Connect to WebSocket for real-time updates
    const connectRealtime = () => {
      websocketService.connect(articleId);

      // Subscribe to clap events
      websocketService.subscribe('clap', (data: Clap) => {
        // Only add claps from other users
        if (data.articleId === articleId) {
          setNewClaps(prev => [...prev, data]);
        }
      });

      // Subscribe to annotation events
      websocketService.subscribe('annotation', (data: Annotation) => {
        // Add articleId check to ensure we only handle annotations for this article
        if (data.articleId === articleId) {
          // For annotations from other users, show a notification first
          if (data.userId !== userId) {
            setNewAnnotations(prev => [...prev, data]);
            
            // Add to the main annotations array after a delay to allow notification to be seen
            setTimeout(() => {
              setAnnotations(prev => {
                // Check if annotation already exists to prevent duplicates
                const exists = prev.some(a => a.id === data.id);
                if (exists) return prev;
                return [...prev, data];
              });
              
              // Remove from new annotations
              setNewAnnotations(prevNew => prevNew.filter(a => a.id !== data.id));
            }, 5000);
          } else {
            // For annotations from the current user, add them immediately
            setAnnotations(prev => {
              // Check if annotation already exists to prevent duplicates
              const exists = prev.some(a => a.id === data.id);
              if (exists) return prev;
              return [...prev, data];
            });
          }
        }
      });

      setRealtimeConnected(true);
    };

    fetchClaps();
    fetchAnnotations();
    connectRealtime();

    // Cleanup function
    return () => {
      websocketService.disconnect();
    };
  }, [articleId, userId]);

  // Handle layer toggle
  const handleLayerToggle = (layer: string, isVisible: boolean) => {
    if (isVisible) {
      setVisibleLayers([...visibleLayers, layer]);
    } else {
      setVisibleLayers(visibleLayers.filter(l => l !== layer));
    }
  };

  // Calculate positions when content or new claps change
  useEffect(() => {
    if (contentRef.current && (newClaps.length > 0 || claps.some(c => !c.domPosition))) {
      // Use requestAnimationFrame to ensure the DOM is ready
      requestAnimationFrame(calculatePositions);
    }
  }, [newClaps, calculatePositions, contentRef]);

  // State to track if we're using polling fallback
  const [usingPolling, setUsingPolling] = useState(false);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    // Function to set up polling for updates
    const setupPolling = () => {
      console.log('[LayerBlog] Using polling fallback for real-time updates');
      setUsingPolling(true);

      // Set up polling interval
      pollInterval = setInterval(async () => {
        try {
          // Poll for new claps
          const clapsResponse = await fetch(`/api/articles/${articleId}/claps`);
          if (clapsResponse.ok) {
            const latestClaps = await clapsResponse.json();

            // Check for new claps by comparing with current state
            const newClapsFound = latestClaps.filter((clap: any) =>
              !claps.some(c => c.id === clap.id) &&
              !newClaps.some(c => c.id === clap.id)
            );

            if (newClapsFound.length > 0) {
              // Add new claps with isNew flag
              setNewClaps(prev => [
                ...prev,
                ...newClapsFound.map((clap: any) => ({ ...clap, isNew: true }))
              ]);

              // Show notification for the first new clap
              if (newClapsFound[0] && typeof window !== 'undefined' && window.notificationManager) {
                // @ts-ignore
                window.notificationManager.addClapNotification(
                  newClapsFound[0].textFragment,
                  newClapsFound[0].count
                );
              }
            }
          }

          // Poll for new annotations
          const annotationsResponse = await fetch(`/api/articles/${articleId}/annotations`);
          if (annotationsResponse.ok) {
            const latestAnnotations = await annotationsResponse.json();

            // Check for new annotations by comparing with current state
            const newAnnotationsFound = latestAnnotations.filter((anno: any) =>
              !annotations.some(a => a.id === anno.id) &&
              !newAnnotations.some(a => a.id === anno.id)
            );

            if (newAnnotationsFound.length > 0) {
              // Add new annotations with isNew flag
              setNewAnnotations(prev => [
                ...prev,
                ...newAnnotationsFound.map((anno: any) => ({ ...anno, isNew: true }))
              ]);

              // Show notification for the first new annotation
              if (newAnnotationsFound[0] && typeof window !== 'undefined' && window.notificationManager) {
                // @ts-ignore
                window.notificationManager.addAnnotationNotification(
                  newAnnotationsFound[0].textFragment,
                  newAnnotationsFound[0].id
                );
              }
            }
          }
        } catch (error) {
          console.error('Error polling for updates:', error);
        }
      }, 10000); // Poll every 10 seconds

      return pollInterval;
    };

    // Connect to WebSocket for real-time updates
    websocketService.connect(articleId);

    // Set up handlers for WebSocket events
    const handleClap = (data: any) => {
      // Add the new clap to the state
      const newClap = {
        ...data,
        isNew: true
      };

      // Update local state using the callback form to get the latest state
      setClaps(currentClaps => {
        const existingClapIndex = currentClaps.findIndex(clap =>
          clap.textFragment === newClap.textFragment
        );

        if (existingClapIndex >= 0) {
          // Update existing clap
          const updatedClaps = [...currentClaps];
          updatedClaps[existingClapIndex] = {
            ...updatedClaps[existingClapIndex],
            count: newClap.count,
            isNew: true
          };
          return updatedClaps;
        } else {
          // Add new clap
          return [...currentClaps, newClap];
        }
      });

      // Show notification for the new clap
      if (typeof window !== 'undefined' && window.notificationManager) {
        // @ts-ignore
        window.notificationManager.addClapNotification(newClap.textFragment, newClap.count);
      }
    };

    const handleAnnotation = (data: any) => {
      // Add the new annotation to the state
      const newAnnotation = {
        ...data,
        isNew: true
      };

      // Use callback form to get the latest state
      setNewAnnotations(prev => [...prev, newAnnotation]);

      // Show notification for the new annotation
      if (typeof window !== 'undefined' && window.notificationManager) {
        // @ts-ignore
        window.notificationManager.addAnnotationNotification(newAnnotation.textFragment, newAnnotation.id);
      }

      // Add to the main annotations array after a delay
      setTimeout(() => {
        setAnnotations(prev => [...prev, newAnnotation]);
        setNewAnnotations(prevNew => prevNew.filter(a => a.id !== newAnnotation.id));
      }, 3000);
    };

    // Handle fallback to polling when WebSocket is not available
    const handleFallback = (data: any) => {
      console.log(`[LayerBlog] WebSocket fallback triggered: ${data.reason}`);
      if (!usingPolling) {
        pollInterval = setupPolling();
      }
    };

    // Subscribe to WebSocket events
    websocketService.subscribe('clap', handleClap);
    websocketService.subscribe('annotation', handleAnnotation);
    websocketService.subscribe('fallback', handleFallback);

    // We'll let the WebSocket connection attempt first
    // If it fails, the fallback handler will set up polling

    // Clean up on unmount
    return () => {
      websocketService.unsubscribe('clap', handleClap);
      websocketService.unsubscribe('annotation', handleAnnotation);
      websocketService.unsubscribe('fallback', handleFallback);
      websocketService.disconnect();

      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [articleId, claps, annotations, usingPolling]); // Dependencies

  // Jump to a specific annotation
  const handleJumpToAnnotation = (id: number) => {
    setActiveAnnotationId(id);

    // Find the annotation
    const annotation = annotations.find(a => a.id === id);
    if (annotation && contentRef.current) {
      // Find the position of the annotation text
      const position = findPositionByOffset(
        contentRef.current,
        annotation.textFragment,
        annotation.position
      );

      if (position) {
        // Scroll to the position
        window.scrollTo({
          top: position.top - 100, // Offset to show context
          behavior: 'smooth'
        });

        // Highlight the annotation text temporarily
        // This would be implemented in a real app
      }
    }
  };

  // Handle clap
  const handleClap = async (text: string, position: { startOffset: number; endOffset: number }) => {
    try {
      // Send the clap to the WebSocket server
      websocketService.send('clap', {
        textFragment: text,
        position,
      });

      // Also send to the API for persistence
      const response = await fetch(`/api/articles/${articleId}/claps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textFragment: text,
          position,
        }),
      });

      if (response.ok) {
        const newClap = await response.json();

        // Calculate position for the new clap
        if (contentRef.current) {
          const domPosition = findPositionByOffset(
            contentRef.current,
            text,
            position
          ) || { top: 100, left: 100 };

          // Update local state
          const existingClapIndex = claps.findIndex(clap =>
            clap.textFragment === text
          );

          if (existingClapIndex >= 0) {
            // Update existing clap
            const updatedClaps = [...claps];
            updatedClaps[existingClapIndex] = {
              ...newClap,
              domPosition,
              isNew: true
            };
            setClaps(updatedClaps);
          } else {
            // Add new clap
            setClaps([...claps, {
              ...newClap,
              domPosition,
              isNew: true
            }]);
          }
        }
      }
    } catch (error) {
      console.error('Error adding clap:', error);
    }
  };

  // Handle annotation
  const handleAnnotate = (text: string, position: { startOffset: number; endOffset: number }) => {
    setSelectedText(text);
    setSelectedPosition(position);
    setShowAnnotationForm(true);
  };

  // Handle annotation submit
  const handleAnnotationSubmit = async (note: string) => {
    try {
      // Send the annotation to the WebSocket server
      websocketService.send('annotation', {
        userId,
        textFragment: selectedText,
        position: selectedPosition,
        note,
      });

      // Also send to the API for persistence
      const response = await fetch(`/api/articles/${articleId}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          textFragment: selectedText,
          position: selectedPosition,
          note,
        }),
      });

      if (response.ok) {
        const newAnnotation = await response.json();
        setAnnotations([...annotations, newAnnotation]);
      }
    } catch (error) {
      console.error('Error adding annotation:', error);
    }

    setShowAnnotationForm(false);
  };

  // Handle annotation edit
  const handleAnnotationEdit = async (id: number, note: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/annotations?annotationId=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (response.ok) {
        const updatedAnnotation = await response.json();
        setAnnotations(annotations.map(anno =>
          anno.id === id ? updatedAnnotation : anno
        ));
      }
    } catch (error) {
      console.error('Error updating annotation:', error);
    }
  };

  // Handle annotation delete
  const handleAnnotationDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/annotations?annotationId=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnnotations(annotations.filter(anno => anno.id !== id));
      }
    } catch (error) {
      console.error('Error deleting annotation:', error);
    }
  };

  // Handle explain this
  const handleExplain = (text: string, position: { startOffset: number; endOffset: number }) => {
    // Get the position for the explanation popup
    if (window.getSelection() && window.getSelection()?.rangeCount !== 0) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top - 10;

        setExplanationPosition({ x, y });
      }
    }

    setExplanationText(text);
    setShowExplanation(true);

    // In a real app, you would fetch the explanation from an API
    // For now, we'll just use a simple function to generate an explanation
    // getExplanation(text, layers);
  };

  // Generate a simple explanation based on the content layers
  const getExplanation = (text: string) => {
    // Look for the text in the context layer first
    if (layers.context.content.includes(text)) {
      return `This is explained in the context layer: ${text}`;
    }

    // Then look in the detail layer
    if (layers.detail.content.includes(text)) {
      return `This is explained in the detail layer: ${text}`;
    }

    // Default explanation
    return `${text} is a concept related to the article topic.`;
  };

  return (
    <div className="relative">
      {/* Layer Toggle */}
      <LayerToggle
        layers={['headline', 'context', 'detail', 'discussion']}
        defaultVisibleLayers={visibleLayers}
        onToggle={handleLayerToggle}
      />

      <div className="flex justify-between items-center my-4">
        <div className="flex items-center">
          <img src="/avatar.jpg" alt="Nicolas C." className="w-10 h-10 rounded-full" />
          <div className="ml-3">
            <div className="text-sm font-medium text-luxury-accent">Nicolas C.</div>
            <div className="text-xs text-luxury-silver">CTO | Quantum Computing Researcher</div>
          </div>
        </div>
        <div className="text-xs text-luxury-silver">April 15, 2025</div>
      </div>

      {/* Content Layers */}
      <div className="relative glass-card p-6 rounded-lg mt-2">
        <div 
          ref={contentRef} 
          className="relative enhanced-selection"
          onMouseUp={(e) => {
            // Small delay to let the selection finalize
            setTimeout(() => {
              const selection = window.getSelection();
              if (selection && !selection.isCollapsed && selection.toString().trim() !== '') {
                console.log("Selection detected:", selection.toString());
                // The selection popup will handle the UI
              }
            }, 10);
          }}
        >
          {/* Headline Layer - Always visible */}
          <div className="mb-8">
            <PillHighlightedText
              content={layers.headline.content}
              claps={claps}
              onHighlightPositionsFound={setHighlightPositions}
            />
          </div>

        {/* Context Layer */}
        {visibleLayers.includes('context') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <h3 className="text-xl font-semibold mb-4 text-luxury-accent">Context</h3>
            <PillHighlightedText
              content={layers.context.content}
              claps={claps}
              onHighlightPositionsFound={positions => {
                // Merge with existing positions
                const newPositions = new Map(highlightPositions);
                positions.forEach((pos, id) => newPositions.set(id, pos));
                setHighlightPositions(newPositions);
              }}
            />
          </motion.div>
        )}

        {/* Detail Layer */}
        {visibleLayers.includes('detail') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <h3 className="text-xl font-semibold mb-4 text-luxury-accent">Details</h3>
            <PillHighlightedText
              content={layers.detail.content}
              claps={claps}
              onHighlightPositionsFound={positions => {
                // Merge with existing positions
                const newPositions = new Map(highlightPositions);
                positions.forEach((pos, id) => newPositions.set(id, pos));
                setHighlightPositions(newPositions);
              }}
            />
          </motion.div>
        )}

        {/* Discussion Layer */}
        {visibleLayers.includes('discussion') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-luxury-accent">Discussion</h3>
            <PillHighlightedText
              content={layers.discussion.content}
              claps={claps}
              onHighlightPositionsFound={positions => {
                // Merge with existing positions
                const newPositions = new Map(highlightPositions);
                positions.forEach((pos, id) => newPositions.set(id, pos));
                setHighlightPositions(newPositions);
              }}
            />
          </motion.div>
        )}

        </div>
      </div>

      {/* Selection Popup */}
      <SelectionPopup
        onClap={handleClap}
        onAnnotate={handleAnnotate}
        onExplain={handleExplain}
      />

      {/* Annotation Form */}
      <AnimatePresence>
        {showAnnotationForm && (
          <AnnotationForm
            selectedText={selectedText}
            position={selectedPosition}
            onSubmit={handleAnnotationSubmit}
            onCancel={() => setShowAnnotationForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Explanation Popup */}
      <AnimatePresence>
        {showExplanation && (
          <ExplanationPopup
            text={explanationText}
            explanation={getExplanation(explanationText)}
            position={explanationPosition}
            onClose={() => setShowExplanation(false)}
          />
        )}
      </AnimatePresence>

      {/* Annotation Panel */}
      <AnnotationPanel
        annotations={annotations}
        onEdit={handleAnnotationEdit}
        onDelete={handleAnnotationDelete}
        currentUserId={userId}
        activeAnnotationId={activeAnnotationId}
        onAnnotationSelected={setActiveAnnotationId}
      />

      {/* Real-time Notification Manager */}
      <NotificationManager
        onJumpToAnnotation={handleJumpToAnnotation}
      />
    </div>
  );
}
