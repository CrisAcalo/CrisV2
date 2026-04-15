'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github, FolderGit2 } from 'lucide-react';
import { SectionHeading, GlassCard } from '../common';
import { Project } from '../../../domain/entities';

export interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection = ({ projects }: ProjectsSectionProps) => {
  return (
    <section id="proyectos" className="relative py-24 overflow-hidden">

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <SectionHeading
          title="Proyectos Destacados"
          subtitle="Una selección de aplicaciones construidas con arquitecturas limpias y patrones escalables."
        />

        {/* Bento Grid Layout */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {projects.map((project, index) => {
            // Make the first project take up 2 columns on large screens to break the monotony
            const isFeatured = index === 0;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${isFeatured ? 'md:col-span-2 lg:col-span-2' : ''}`}
              >
                {/* Notice the 'neon={isFeatured}' usage to highlight the main project */}
                <GlassCard neon={isFeatured} className="h-full flex flex-col justify-between group">

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 rounded-xl bg-[var(--accent-faint)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors glow-accent">
                        <FolderGit2 size={24} />
                      </div>

                      <div className="flex items-center gap-3">
                        {project.repoUrl && (
                          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                            <Github size={20} />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                            <ExternalLink size={20} />
                          </a>
                        )}
                      </div>
                    </div>

                    <h3 className={`font-bold mb-3 tracking-tight ${isFeatured ? 'text-2xl md:text-3xl lg:text-4xl text-[var(--accent)] glow-accent-text' : 'text-xl md:text-2xl text-[var(--text-primary)]'}`}>
                      {project.title}
                    </h3>

                    <p className={`leading-relaxed mb-6 ${isFeatured ? 'text-lg text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      {project.description}
                    </p>
                  </div>

                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-[var(--surface-border)]">
                      {project.skills.map(skill => (
                        <span key={skill.id} className="px-3 py-1 text-xs font-semibold rounded bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--surface-border)] group-hover:border-[var(--accent)] transition-colors">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}

                </GlassCard>
              </motion.div>
            );
          })}

        </div>
      </div >
    </section >
  );
};
