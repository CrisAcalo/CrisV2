'use client';

import { motion } from 'framer-motion';
import { SectionHeading, GlassCard } from '../common';
import { Skill } from '../../../domain/entities';

export interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection = ({ skills }: SkillsSectionProps) => {
  const publicSkills = skills.filter(skill => skill.isPublic);
  return (
    <section id="skills" className="relative py-24 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[var(--accent)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <SectionHeading
          title="Habilidades Técnicas"
          subtitle="Herramientas y tecnologías con las que trabajo para construir soluciones de software de alto nivel."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mt-16"
        >
          <GlassCard className="flex flex-wrap justify-center gap-3 md:gap-4 p-8 md:p-12 hover:border-[var(--accent)] transition-all duration-500">
            {publicSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="px-4 py-2 md:px-6 md:py-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--surface-border)] hover:border-[var(--accent)] text-[var(--text-primary)] font-semibold shadow-sm hover:shadow-[var(--neon-glow)] transition-all cursor-default flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" title="Validado en LinkedIn" />
                {skill.name}
              </motion.div>
            ))}
          </GlassCard>
        </motion.div>

      </div>
    </section>
  );
};
