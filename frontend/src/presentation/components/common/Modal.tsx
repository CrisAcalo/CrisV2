'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/80"
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-5 pt-6 px-6">
              <h3 className="text-xl font-bold leading-6 text-slate-900 dark:text-white">
                {title}
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-10 w-10 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6 custom-scrollbar">
              {children}
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
