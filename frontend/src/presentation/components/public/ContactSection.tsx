'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { ArrowUpRight, Check, CircleAlert, Linkedin, LoaderCircle, Mail, Send } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { publicAxiosClient } from '../../../infrastructure/api/axiosClient';
import { SectionReveal } from './SectionReveal';
import styles from './ContactSection.module.css';

const limits = { name: 100, email: 254, subject: 200, content: 1000 };
const contactEmail = 'cristianchoacalo@gmail.com';
const defaultValues = { name: '', email: '', subject: '', content: '' };

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Escribe tu nombre').max(limits.name, `Usa hasta ${limits.name} caracteres`),
  email: z.string().trim().email('Escribe un correo válido').max(limits.email, `Usa hasta ${limits.email} caracteres`),
  subject: z.string().trim().min(5, 'Escribe un asunto de al menos 5 caracteres').max(limits.subject, `Usa hasta ${limits.subject} caracteres`),
  content: z.string().trim().min(10, 'Escribe un mensaje de al menos 10 caracteres').max(limits.content, `Usa hasta ${limits.content} caracteres`),
});

type ContactFormData = z.infer<typeof contactSchema>;
type Notification = 'accepted' | 'failed' | 'disabled';

export const ContactSection = () => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
    defaultValues,
    resolver: zodResolver(contactSchema),
  });
  const messageLength = useWatch({ control, name: 'content' }).length;

  const onSubmit = async ({ name, email, subject, content }: ContactFormData) => {
    setFeedback(null);

    try {
      const { data } = await publicAxiosClient.post<{ notification?: Notification }>('/messages', {
        senderName: name,
        senderEmail: email,
        subject,
        content,
      });
      reset();
      setFeedback({
        type: 'success',
        text: data.notification === 'failed' || data.notification === 'disabled'
          ? 'Tu mensaje quedó guardado. Gracias por escribirme.'
          : 'Recibí tu mensaje. Gracias por escribirme.',
      });
    } catch (error) {
      const limited = isAxiosError(error) && error.response?.status === 429;
      setFeedback({
        type: 'error',
        text: limited
          ? 'Espera unos minutos antes de enviar otro mensaje.'
          : 'No se pudo confirmar la recepción. Intenta de nuevo o usa el correo directo.',
      });
    }
  };

  return (
    <section id="contacto" className="portfolio-section portfolio-contact" aria-labelledby="contact-title" tabIndex={-1}>
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[var(--accent)] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />

      <div className={`portfolio-shell portfolio-section-inner ${styles.layout}`}>
        <div className={styles.intro}>
          <h2 id="contact-title" className="portfolio-heading">Contacto</h2>
          <SectionReveal className={styles.introDetails}>
            <p className="portfolio-contact-intro">Si tienes un proyecto en mente o buscas a alguien para tu equipo, cuéntame qué necesitas.</p>
            <ul className={styles.channels} role="list">
              <li>
                <a className={styles.channel} href={`mailto:${contactEmail}`}>
                  <Mail aria-hidden="true" size={19} />
                  <span>
                    <span className={styles.channelName}>Correo directo</span>
                    <span className={styles.channelDetail}>{contactEmail}</span>
                  </span>
                  <ArrowUpRight aria-hidden="true" size={16} />
                </a>
              </li>
              <li>
                <a className={styles.channel} href="https://www.linkedin.com/in/cristianacalo/" target="_blank" rel="noopener noreferrer">
                  <Linkedin aria-hidden="true" size={19} />
                  <span className={styles.channelName}>LinkedIn</span>
                  <ArrowUpRight aria-hidden="true" size={16} />
                </a>
              </li>
            </ul>
          </SectionReveal>
        </div>

        <SectionReveal className={styles.composer} trackHeight>
          <form className={styles.form} aria-label="Enviar un mensaje" onSubmit={handleSubmit(onSubmit, () => setFeedback(null))} noValidate>
            <div className={styles.fieldPair}>
              <div>
                <label htmlFor="contact-name">Nombre</label>
                <input id="contact-name" autoComplete="name" required maxLength={limits.name} readOnly={isSubmitting} {...register('name')}
                  aria-invalid={!!errors.name} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
                {errors.name && <p id="contact-name-error" className={styles.fieldError}>{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="contact-email">Correo</label>
                <input id="contact-email" type="email" autoComplete="email" required maxLength={limits.email} readOnly={isSubmitting} {...register('email')}
                  aria-invalid={!!errors.email} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
                {errors.email && <p id="contact-email-error" className={styles.fieldError}>{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject">Asunto</label>
              <input id="contact-subject" required maxLength={limits.subject} readOnly={isSubmitting} {...register('subject')}
                aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} />
              {errors.subject && <p id="contact-subject-error" className={styles.fieldError}>{errors.subject.message}</p>}
            </div>
            <div>
              <label htmlFor="contact-content">Mensaje</label>
              <textarea id="contact-content" rows={5} required maxLength={limits.content} readOnly={isSubmitting} {...register('content')}
                aria-invalid={!!errors.content} aria-describedby={errors.content ? 'contact-content-error' : 'contact-content-hint'} />
              <div className={styles.messageMeta}>
                {errors.content
                  ? <p id="contact-content-error" className={styles.fieldError}>{errors.content.message}</p>
                  : <p aria-hidden="true">Mínimo 10 caracteres</p>}
                <span id="contact-content-hint" className="sr-only">Entre 10 y {limits.content} caracteres.</span>
                <span className={styles.counter} aria-hidden="true">{messageLength} / {limits.content}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <button type="submit" className={`portfolio-button ${styles.submit}`} disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle aria-hidden="true" size={17} className={styles.spinner} /> : <Send aria-hidden="true" size={17} />}
                {isSubmitting ? 'Enviando…' : 'Enviar mensaje'}
              </button>
              <div role="status" aria-atomic="true" className={styles.status} data-state={feedback?.type}>
                {isSubmitting && <span className="sr-only">Enviando mensaje.</span>}
                {feedback && (
                  <p>
                    {feedback.type === 'success' ? <Check aria-hidden="true" size={18} /> : <CircleAlert aria-hidden="true" size={18} />}
                    {feedback.text}
                  </p>
                )}
              </div>
            </div>
          </form>
        </SectionReveal>
      </div>
    </section>
  );
};
