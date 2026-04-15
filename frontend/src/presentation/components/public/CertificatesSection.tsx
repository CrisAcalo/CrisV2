'use client';

import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { SectionHeading, GlassCard } from '../common';
import { Certificate } from '../../../domain/entities';
import { formatFriendlyDate } from '../../utils/dateUtils';

export interface CertificatesSectionProps {
  certificates: Certificate[];
}

export const CertificatesSection = ({ certificates }: CertificatesSectionProps) => {
  if (!certificates || certificates.length === 0) return null;

  return (
    <section id="certificados" className="relative py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <SectionHeading
          title="Certificados y Logros"
          subtitle="Formación continua y credenciales que respaldan mi conocimiento técnico."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col justify-between group p-6 hover:-translate-y-1 transition-transform duration-300">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[var(--accent-faint)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors glow-accent flex items-center justify-center">
                      <Award size={24} />
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-2"
                        title="Ver credencial"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-1 leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {cert.name}
                  </h3>

                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {cert.issuingOrganization}
                  </p>

                </div>

                <div className="mt-auto pt-4 border-t border-[var(--surface-border)]">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--surface-raised)]" style={{ color: 'var(--text-secondary)' }}>
                    Expedido: {formatFriendlyDate(cert.issueDate?.toString())}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
