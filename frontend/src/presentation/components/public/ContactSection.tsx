'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SectionHeading, GlassCard } from '../common';
import { axiosClient } from '../../../infrastructure/api/axiosClient';

// Validation Schema
const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Por favor ingresa un correo electrónico válido'),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  content: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(1000, 'Mensaje muy largo'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Map frontend field names to backend field names
      await axiosClient.post('/messages', {
        senderName: data.name,
        senderEmail: data.email,
        subject: data.subject,
        content: data.content,
      });
      setSubmitStatus('success');
      reset();
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="relative py-24 overflow-hidden bg-[var(--surface-raised)] border-t border-[var(--surface-border)]">

      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[var(--accent)] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <SectionHeading
          title="Conversemos"
          subtitle="¿Tienes un proyecto en mente o buscas un ingeniero para tu equipo? Déjame un mensaje."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mt-16"
        >
          <GlassCard className="p-8 md:p-12 relative overflow-hidden">

            {/* Success Overlay */}
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-[var(--surface)]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>¡Mensaje Enviado!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Gracias por contactarme. Responderé lo más pronto posible.
                </p>
                <button
                  onClick={() => setSubmitStatus('idle')}
                  className="mt-6 px-6 py-2 rounded-lg border border-[var(--surface-border)] hover:bg-[var(--surface-raised)] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Enviar otro mensaje
                </button>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Nombre <span className="text-[var(--accent)]">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    placeholder="Tu nombre completo"
                    className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-border)]/10 border focus:outline-none focus:ring-2 transition-all ${errors.name
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-[var(--surface-border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/30'
                      }`}
                    style={{ color: 'var(--text-primary)' }}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Correo Electrónico <span className="text-[var(--accent)]">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="tucorreo@ejemplo.com"
                    className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-border)]/10 border focus:outline-none focus:ring-2 transition-all ${errors.email
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-[var(--surface-border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/30'
                      }`}
                    style={{ color: 'var(--text-primary)' }}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Asunto <span className="text-[var(--accent)]">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  {...register('subject')}
                  placeholder="Ej: Oportunidad de Empleo / Proyecto Freelance"
                  className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-border)]/10 border focus:outline-none focus:ring-2 transition-all ${errors.subject
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-[var(--surface-border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/30'
                    }`}
                  style={{ color: 'var(--text-primary)' }}
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Mensaje <span className="text-[var(--accent)]">*</span>
                </label>
                <textarea
                  id="content"
                  {...register('content')}
                  rows={5}
                  placeholder="Detalla tu propuesta o consulta aquí..."
                  className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-border)]/10 border focus:outline-none focus:ring-2 transition-all resize-y ${errors.content
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-[var(--surface-border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/30'
                    }`}
                  style={{ color: 'var(--text-primary)' }}
                />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
              </div>

              {/* Error Alert */}
              {submitStatus === 'error' && (
                <div className="flex items-center gap-2 p-4 text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
                  <AlertCircle size={18} />
                  <p className="text-sm">Ocurrió un error al enviar el mensaje. Inténtalo de nuevo más tarde o contáctame por LinkedIn.</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold flex items-center justify-center gap-2 transition-all glow-accent mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send size={18} /> Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};
