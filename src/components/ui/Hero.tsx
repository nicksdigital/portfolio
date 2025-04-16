import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const t = useTranslations('Hero');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 194, 255, 0.15) 0%, transparent 50%)`,
          transition: 'background 0.3s ease'
        }}
      />

      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full border border-luxury-silver/10 z-0"
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full border border-luxury-accent/10 z-0"
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-luxury-accent/5 z-0 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6"
          >
            <span className="text-white">{t('greeting')}</span>
            <br />
            <span className="bg-gradient-to-r from-luxury-silver to-luxury-accent bg-clip-text text-transparent">
              {t('title')}
            </span>
            <br />
            <span className="text-white text-3xl md:text-4xl lg:text-5xl">
              {t('subtitle')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-luxury-silver max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            {/* Use hardcoded text based on LinkedIn profile */}
            Innovative technology leader with 25+ years experience in blockchain, AI, and quantum computing. 
            Creator of AxiomVerse, leveraging quantum-inspired approaches to revolutionize decentralized networks.
            Passionate about building secure, efficient, and user-centric solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="#projects"
              className="px-8 py-3 bg-luxury-accent text-luxury-black font-medium rounded hover:bg-luxury-accent/90 transition-colors flex items-center gap-2 group"
            >
              {t('cta')}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#contact"
              className="px-8 py-3 border border-luxury-silver/50 hover:border-luxury-silver text-white font-medium rounded transition-colors"
            >
              {t('contact', { defaultValue: 'Contact Me' })}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a
          href="#about"
          className="text-luxury-silver hover:text-white text-sm flex flex-col items-center gap-2 transition-colors"
        >
          <span>{t('scrollDown', { defaultValue: 'Scroll Down' })}</span>
          <div className="w-6 h-10 rounded-full border border-luxury-silver/40 flex justify-center pt-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-luxury-silver rounded-full"
            />
          </div>
        </a>
      </motion.div>
    </section>
  );
}