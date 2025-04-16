import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Project } from 'markdownlayer/generated';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card rounded-lg overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden bg-luxury-gray/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-luxury-accent text-xl font-semibold">{project.title.charAt(0)}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black to-transparent opacity-60" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-display font-semibold mb-3">
          {project.title}
        </h3>

        <p className="text-luxury-silver mb-4 line-clamp-3">
          {project.description}
        </p>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="bg-luxury-accent/10 text-luxury-accent px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-auto">
          {project.repository && (
            <a
              href={project.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-luxury-silver hover:text-white transition-colors"
            >
              GitHub
            </a>
          )}

          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm flex items-center gap-1 text-luxury-accent hover:text-luxury-accent/80 transition-colors ml-auto"
            >
              Live Demo
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}