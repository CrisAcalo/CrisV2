'use client';

import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Calendar } from 'lucide-react';
import { SectionHeading, GlassCard } from '../common';
import { Experience, Education } from '../../../domain/entities';
import { formatFriendlyDate } from '../../../presentation/utils/dateUtils';

export interface TimelineSectionProps {
  experiences: Experience[];
  educations: Education[];
}

export const TimelineSection = ({ experiences, educations }: TimelineSectionProps) => {
  return (
    <section id="experiencia" className="relative py-24 overflow-hidden">

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <SectionHeading
          title="Trayectoria"
          subtitle="Mi recorrido profesional y académico en el mundo del desarrollo de software."
        />

        <div className="mt-16 space-y-24">

          {/* Experience Timeline */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 rounded-xl bg-[var(--accent)] text-white glow-accent">
                <Briefcase size={24} />
              </div>
              <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Experiencia</h3>
            </div>

            <div className="relative border-l-2 border-[var(--surface-border)] ml-6 space-y-12">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-8"
                >
                  <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-[var(--accent)] glow-accent border-2 border-[var(--bg)]" />

                  <GlassCard className="hover:border-[var(--accent)] transition-colors duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-[var(--accent)]">{exp.role}</h4>
                        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{exp.company}</p>
                      </div>
                      <div className="transition-all duration-250 ease-in-out flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-[var(--surface-raised)] border border-[var(--surface-border)] w-fit" style={{ color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        <span>{formatFriendlyDate(exp.startDate)} — {formatFriendlyDate(exp.endDate)}</span>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {exp.description}
                      </p>
                    )}

                    {exp.skills && exp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {exp.skills.map(skill => (
                          <span key={skill.id} className="px-2 py-1 text-xs rounded bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education Timeline */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 rounded-xl bg-[var(--accent)] text-white glow-accent">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Educación</h3>
            </div>

            <div className="relative border-l-2 border-[var(--surface-border)] ml-6 space-y-12">
              {educations.map((edu, index) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-8"
                >
                  <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-[var(--surface-border)] border-2 border-[var(--bg)]" />

                  <GlassCard>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{edu.degree}</h4>
                        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>{edu.institution}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-[var(--surface-raised)] border border-[var(--surface-border)] w-fit" style={{ color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        <span>{formatFriendlyDate(edu.startDate)} — {formatFriendlyDate(edu.endDate)}</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
