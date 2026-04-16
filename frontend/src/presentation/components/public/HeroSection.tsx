'use client';

import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight, Github, Linkedin, Mail, Code2, Layers } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '../common';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center">

      {/* Aurora Fluida Elements - Scattered and Numerous */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ["0vw", "30vw", "0vw"], y: ["0vh", "-20vh", "0vh"], scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="w-[12vw] h-[12vw] min-w-[150px] min-h-[150px] bg-[var(--accent)] rounded-full filter blur-3xl opacity-20 dark:opacity-20 absolute top-[10%] left-[10%]"
        />
        <motion.div
          animate={{ x: ["0vw", "-40vw", "0vw"], y: ["0vh", "30vh", "0vh"], scale: [1, 1.4, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="w-[15vw] h-[15vw] min-w-[180px] min-h-[180px] bg-fuchsia-500 rounded-full filter blur-3xl opacity-20 dark:opacity-20 absolute top-[20%] right-[10%]"
        />
        <motion.div
          animate={{ x: ["20vw", "-10vw", "20vw"], y: ["-20vh", "30vh", "-20vh"], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="w-[10vw] h-[10vw] min-w-[120px] min-h-[120px] bg-fuchsia-800 rounded-full filter blur-3xl opacity-20 dark:opacity-20 absolute bottom-[20%] left-[30%]"
        />
        <motion.div
          animate={{ x: ["-20vw", "30vw", "-20vw"], y: ["10vh", "-40vh", "10vh"], scale: [1, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="w-[14vw] h-[14vw] min-w-[160px] min-h-[160px] bg-violet-600 rounded-full filter blur-3xl opacity-20 dark:opacity-20 absolute top-[40%] right-[30%]"
        />
        <motion.div
          animate={{ x: ["0vw", "30vw", "0vw"], y: ["0vh", "30vh", "0vh"], scale: [1.1, 1.4, 1.1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="w-[11vw] h-[11vw] min-w-[130px] min-h-[130px] bg-purple-500 rounded-full filter blur-3xl opacity-20 dark:opacity-20 absolute bottom-[10%] right-[20%]"
        />
        <motion.div
          animate={{ x: ["-30vw", "10vw", "-30vw"], y: ["-30vh", "10vh", "-30vh"], scale: [1, 1.5, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="w-[13vw] h-[13vw] min-w-[150px] min-h-[150px] bg-indigo-500 rounded-full filter blur-3xl opacity-20 dark:opacity-20 absolute top-[60%] left-[10%]"
        />
        <motion.div
          animate={{ x: ["30vw", "-20vw", "30vw"], y: ["0vh", "20vh", "0vh"], scale: [1.3, 1, 1.3] }}
          transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="w-[10vw] h-[10vw] min-w-[120px] min-h-[120px] bg-[var(--accent)] rounded-full filter blur-3xl opacity-20 dark:opacity-20 absolute top-[5%] left-[50%]"
        />
        <motion.div
          animate={{ x: ["-15vw", "25vw", "-15vw"], y: ["-20vh", "20vh", "-20vh"], scale: [1, 1.2, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
          className="w-[12vw] h-[12vw] min-w-[140px] min-h-[140px] bg-purple-400 rounded-full filter blur-3xl opacity-20 dark:opacity-20 absolute bottom-[30%] right-[40%]"
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">

        {/* Left Content (Text) */}
        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm font-medium mb-6 text-[var(--accent)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)] glow-accent"></span>
            </span>
            Disponible para nuevas oportunidades
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Cristian Acalo <br className="hidden md:block" />
          </motion.h1>

          <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-6 leading-tight gradient-text glow-accent-text">Full Stack & Automatizaciones</h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mb-6 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Soy Cristian Acalo, Ingeniero de Software especializado en arquitecturas limpias, rendimiento y experiencias de usuario de alto impacto. Transforma tus ideas en productos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="#proyectos" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold flex items-center justify-center gap-2 transition-all glow-accent">
              Ver Proyectos <ArrowRight size={18} />
            </Link>
            
            <Link href="#contacto" className="w-full sm:w-auto px-8 py-4 rounded-xl glass font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[var(--text-primary)]">
              Contactar <Mail size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Right Content (Visuals / Floating Cards) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex-1 relative w-full hidden lg:flex justify-center items-center top-[-200px]"
        >
          {/* Terminal Code Card */}
          <GlassCard neon className="w-80 absolute -right-4 top-0 z-20 transform rotate-3 hover:translate-x-[-10px] hover:rotate-0 transition-all duration-500">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 mb-4">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>dev.ts</span>
            </div>
            {/* Code lines */}
            <div className="font-mono text-[12px] leading-relaxed space-y-0.5">
              <div>
                <span style={{ color: '#7c3aed' }}>const </span>
                <span style={{ color: '#06b6d4' }}>dev</span>
                <span style={{ color: 'var(--text-secondary)' }}> = {'{'}</span>
              </div>
              <div className="pl-4">
                <span style={{ color: '#f59e0b' }}>name</span>
                <span style={{ color: 'var(--text-secondary)' }}>: </span>
                <span style={{ color: '#22c55e' }}>"Cristian Acalo"</span>
                <span style={{ color: 'var(--text-muted)' }}>,</span>
              </div>
              <div className="pl-4">
                <span style={{ color: '#f59e0b' }}>role</span>
                <span style={{ color: 'var(--text-secondary)' }}>: </span>
                <span style={{ color: '#22c55e' }}>"Full Stack Dev"</span>
                <span style={{ color: 'var(--text-muted)' }}>,</span>
              </div>
              <div className="pl-4">
                <span style={{ color: '#f59e0b' }}>available</span>
                <span style={{ color: 'var(--text-secondary)' }}>: </span>
                <span style={{ color: '#fb923c' }}>true</span>
                <span style={{ color: 'var(--text-muted)' }}>,</span>
              </div>
              <div className="pl-4">
                <span style={{ color: '#f59e0b' }}>passion</span>
                <span style={{ color: 'var(--text-secondary)' }}>: </span>
                <span style={{ color: '#22c55e' }}>"Clean Arch"</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>{'}'}</span>
              </div>
              {/* Blinking cursor line */}
              <div className="flex items-center gap-1 pt-1">
                <span style={{ color: '#7c3aed' }}>{'>'}</span>
                <span
                  className="inline-block w-2 h-4 ml-1 align-middle"
                  style={{
                    background: 'var(--accent)',
                    animation: 'cursorBlink 1.1s step-end infinite',
                  }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Decorative Experience Card */}
          <GlassCard glow className="w-72 absolute -left-12 top-24 z-10 transform -rotate-6 hover:translate-x-[10px] hover:rotate-0 transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="transition-all duration-250 ease-in-out w-10 h-10 rounded-full bg-[var(--accent-faint)] flex items-center justify-center text-[var(--accent)] glow-accent">
                <Linkedin size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">Top Skills</h3>
                <p className="text-xs text-[var(--text-muted)]">Validado por la industria</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {['TypeScript', 'Next.js', 'Node.js', 'Prisma'].map((skill, index) => (
                <span key={index} className="px-2 py-1 text-xs rounded bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--surface-border)]">
                  {skill}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="z-40 absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => document.getElementById('experiencia')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-sm font-medium text-[var(--text-muted)] tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <ChevronDown className="text-[var(--text-muted)]" size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
};
