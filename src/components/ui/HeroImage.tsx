'use client';

import { useState } from 'react';
import Image from 'next/image';

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
        <Image 
          src={src} 
          alt={alt}
          width={1920}
          height={600}
          priority={true}
          sizes="(max-width: 1280px) 100vw, 1280px"
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
