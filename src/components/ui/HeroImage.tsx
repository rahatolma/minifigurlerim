'use client';

import { useState } from 'react';

interface HeroImageProps {
  src: string;
  alt: string;
}

export default function HeroImage({ src, alt }: HeroImageProps) {
  const [error, setError] = useState(false);

  if (!src || error || src.trim() === '') {
    return null;
  }

  return (
    <section className="relative w-full flex items-end justify-center overflow-hidden bg-[#fcfcfc]">
      <div className="relative w-full max-w-7xl mx-auto flex justify-center">
        <img 
          src={src} 
          alt={alt}
          className="w-full h-auto object-bottom"
          onError={() => setError(true)}
        />
        {/* Kenar Gradientleri */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#fcfcfc] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#fcfcfc] to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}
