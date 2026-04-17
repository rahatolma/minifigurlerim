'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSliderClient({ sliders }: { sliders: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<number[]>([0]); // Sadece ilk slayt baştan yüklü

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % sliders.length;
        if (!loadedIndices.includes(next)) setLoadedIndices([...loadedIndices, next]);
        return next;
      });
    }, 5000); // 5 saniyede bir değiş
    return () => clearInterval(interval);
  }, [sliders, loadedIndices]);

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev === 0 ? sliders.length - 1 : prev - 1;
      if (!loadedIndices.includes(next)) setLoadedIndices([...loadedIndices, next]);
      return next;
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const next = (prev + 1) % sliders.length;
      if (!loadedIndices.includes(next)) setLoadedIndices([...loadedIndices, next]);
      return next;
    });
  };

  // Veri yoksa placeholder gösterme, direkt gizle
  if (!sliders || sliders.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full bg-black text-white flex flex-col items-center justify-center text-center px-4 overflow-hidden h-[400px] md:h-[700px]">
      {sliders.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Arkaplan Görseli Düzenlemesi: background-image iptal edildi, optimize next/Image kullanıldı */}
          <div className="absolute inset-0 bg-black">
            {loadedIndices.includes(index) && (
              <Image 
                src={slide.image_url || 'https://via.placeholder.com/1920x800.png?text=Gorsel+Yok'} 
                alt={slide.title || 'Hero Slider'}
                fill
                priority={index === 0} // İlk resim pre-load edilecek
                sizes="100vw"
                className="object-cover opacity-50 select-none"
              />
            )}
          </div>
          
          {/* İçerik */}
          <div className="relative z-20 w-full max-w-5xl mx-auto h-full flex flex-col items-center justify-center space-y-6 px-4">
            <h1 className="text-yellow-400 text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-black tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-center" style={{ whiteSpace: 'nowrap' }}>
              {slide.title ? slide.title.replace(/<[^>]*>?/gm, '').replace(/\n/g, ' ').replace(/\r/g, '').trim() : ''}
            </h1>
            {slide.subtitle && (
              <p 
                className="text-xl md:text-2xl font-medium tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center leading-relaxed mt-2 text-white/95"
                dangerouslySetInnerHTML={{
                  __html: slide.subtitle
                            .replace(/<[^>]*>?/gm, '')
                            .replace(/\n|\r/g, ' ')
                            .replace('kapılarını aralayın', 'kapılarını <br className="hidden sm:block" /> aralayın')
                            .replace('Koleksiyon dünyasının', '<br />Koleksiyon dünyasının')
                }}
              />
            )}
            <div className="flex gap-4 justify-center mt-10">
              {slide.button1_text && (
                <Link href={slide.button1_link || '#'} className="bg-[#D22B2B] border-2 border-[#D22B2B] text-white font-bold py-4 px-12 rounded-sm shadow-[0_4px_14px_rgba(210,43,43,0.4)] hover:bg-white hover:text-[#111] hover:border-white transition-colors uppercase tracking-widest text-sm inline-block">
                  {slide.button1_text}
                </Link>
              )}
              {slide.button2_text && (
                <Link href={slide.button2_link || '#'} className="bg-transparent border-2 border-white text-white font-bold py-4 px-12 rounded-sm hover:bg-[#D22B2B] hover:border-[#D22B2B] transition-colors uppercase tracking-widest text-sm inline-block">
                  {slide.button2_text}
                </Link>
              )}
            </div>

            {/* Alt Mini Güven Satırı (Trust Badge) */}
            <div className="flex items-center justify-center gap-3 md:gap-4 mt-8 text-[10px] md:text-sm font-bold tracking-widest uppercase text-white/70">
              <span className="drop-shadow-md">800+ MİNİFİGÜR</span>
              <span className="text-white/40">•</span>
              <span className="drop-shadow-md">25+ SERİ</span>
              <span className="text-white/40 hidden sm:inline-block">•</span>
              <span className="drop-shadow-md hidden sm:inline-block">SÜREKLİ GÜNCELLENEN İÇERİK</span>
            </div>
          </div>
        </div>
      ))}

      {/* Oklar (Sadece birden fazla slayt varsa) */}
      {sliders.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/50 hover:text-white hover:bg-black/20 rounded-full transition-all">
            <ChevronLeft size={48} strokeWidth={2} />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/50 hover:text-white hover:bg-black/20 rounded-full transition-all">
            <ChevronRight size={48} strokeWidth={2} />
          </button>
          
          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {sliders.map((_, i) => (
              <button 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
