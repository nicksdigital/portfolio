import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code, Database, Lock, Zap, Award, BarChart3, Gamepad2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations('About');
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-accent/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="inline-block text-sm font-medium bg-luxury-accent/20 text-luxury-accent px-3 py-1 rounded-sm mb-4">
              {t('title')}
            </h2>
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
              {t('title', { defaultValue: 'About Me' })}
            </h3>
            <p className="text-lg text-luxury-silver max-w-3xl mx-auto">
              {t('description')}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-8 mb-16"
          >
            <div className="glass-card p-8 rounded-md">
              <h4 className="text-xl font-display font-semibold mb-4">{t('keyRoles.title')}</h4>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <Database className="w-5 h-5 text-luxury-accent flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-medium text-white">{t('keyRoles.hydra.title')}</span>
                    <p className="text-luxury-silver text-sm">{t('keyRoles.hydra.description')}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <BarChart3 className="w-5 h-5 text-luxury-accent flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-medium text-white">{t('keyRoles.axiomverse.title')}</span>
                    <p className="text-luxury-silver text-sm">{t('keyRoles.axiomverse.description')}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Lock className="w-5 h-5 text-luxury-accent flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-medium text-white">{t('keyRoles.d4l.title')}</span>
                    <p className="text-luxury-silver text-sm">{t('keyRoles.d4l.description')}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="glass-card p-8 rounded-md">
              <h4 className="text-xl font-display font-semibold mb-4">{t('journey.title')}</h4>
              <p className="text-luxury-silver mb-4">
                {t('journey.paragraph1')}
              </p>
              <p className="text-luxury-silver">
                {t('journey.paragraph2')}
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="glass-card p-8 rounded-md mb-16"
          >
            <h4 className="text-xl font-display font-semibold mb-4 text-center">{t('vision.title')}</h4>
            <p className="text-luxury-silver mb-6 text-center max-w-4xl mx-auto">
              {t('vision.description')}
            </p>

            <div className="flex items-center justify-center">
              <div className="px-6 py-3 border border-luxury-accent/60 text-luxury-accent rounded-sm inline-block">
                {t('vision.motto')}
              </div>
            </div>
          </motion.div>

          <motion.h3
            variants={itemVariants}
            className="text-2xl font-display font-bold text-center mb-10"
          >
            {t('achievements.title')}
          </motion.h3>

          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: 'Quantum Zero-Knowledge Proofs', description: 'Published research on quantum-inspired ZKPs using IBM Qiskit' },
              { title: 'AxiomVerse Framework', description: 'Developed a decentralized network framework using axioms and vectors' },
              { title: 'Blockchain Security', description: 'Created post-quantum cryptographic solutions for blockchain systems' },
              { title: 'LayerBlog Platform', description: 'Designed innovative multi-layer content management system' },
              { title: 'Enterprise Blockchain', description: 'Led $25M intranet restructuring project with blockchain technology' },
              { title: 'Mental Health Innovation', description: 'Designed real-time contextual analysis system for mental health support' }
            ].map((item, index) => {
              const icons = [
                <Award key="award" className="w-10 h-10 text-luxury-accent mb-4" />,
                <BarChart3 key="barchart" className="w-10 h-10 text-luxury-accent mb-4" />,
                <Gamepad2 key="gamepad" className="w-10 h-10 text-luxury-accent mb-4" />,
                <Database key="database" className="w-10 h-10 text-luxury-accent mb-4" />,
                <Code key="code" className="w-10 h-10 text-luxury-accent mb-4" />,
                <Zap key="zap" className="w-10 h-10 text-luxury-accent mb-4" />
              ];

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex flex-col items-center text-center glass-card p-6 rounded-md"
                >
                  {icons[index]}
                  <h4 className="text-lg font-display font-medium mb-2">{t(`achievements.items.${index}.title`, { defaultValue: item.title })}</h4>
                  <p className="text-sm text-luxury-silver">{t(`achievements.items.${index}.description`, { defaultValue: item.description })}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}