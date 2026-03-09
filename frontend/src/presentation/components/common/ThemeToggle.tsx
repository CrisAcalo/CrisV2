'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from './Button';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />; // Placeholder para evitar brincos de UI
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      className="p-2 w-10 h-10 rounded-full"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.div>
    </Button>
  );
};
