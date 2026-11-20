'use client';

import Image from 'next/image';
import { useState } from 'react';

type ProjectPreviewProps = {
  src: string;
  title: string;
  optimized: boolean;
  sizes: string;
  onUnavailable?: () => void;
};

export function ProjectPreview({ src, title, optimized, sizes, onUnavailable }: ProjectPreviewProps) {
  const [source, setSource] = useState<'primary' | 'direct' | 'failed'>('primary');

  if (source === 'failed') return null;

  return (
    <div className="portfolio-project-media">
      <Image
        key={source}
        src={src}
        alt={`Vista previa de ${title}`}
        fill
        unoptimized={!optimized || source === 'direct'}
        sizes={sizes}
        loading="lazy"
        onError={() => {
          if (optimized && source === 'primary') {
            setSource('direct');
          } else {
            setSource('failed');
            onUnavailable?.();
          }
        }}
      />
    </div>
  );
}
