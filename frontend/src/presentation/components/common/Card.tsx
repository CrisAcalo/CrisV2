'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, style, ...rest }) => {
  const defaultPadding = className.includes('p-0') ? undefined : '1.5rem';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-surface ${hover ? 'hover:shadow-lg cursor-pointer' : ''} ${className}`}
      style={{ padding: defaultPadding, ...style }}
      {...(rest as any)}
    >
      {children}
    </motion.div>
  );
};
