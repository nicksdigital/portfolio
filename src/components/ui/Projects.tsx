import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { allProjects } from 'markdownlayer/generated';
import ProjectCard from './ProjectCard';

export default function Projects() {
  const locale = useLocale();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Filter projects by language
  const projects = allProjects
    .filter(project => project.locale === locale)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section id="projects" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-accent/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-luxury-accent/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="inline-block text-sm font-medium bg-luxury-accent/20 text-luxury-accent px-3 py-1 rounded-sm mb-4">
              Projects
            </h2>
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Recent Work
            </h3>
            <p className="text-lg text-luxury-silver max-w-3xl mx-auto">
              Showcasing innovative solutions and contributions to the blockchain ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}