'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSliderClient({ sliders }: { sliders: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliders.length);
    }, 5000); // 5 saniyede bir değiş
    return () => clearInterval(interval);
  }, [sliders]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % sliders.length);
  };

  // Veri yoksa placeholder göster
  if (!sliders || sliders.length === 0) {
    return (
      <section className="relative w-full bg-black text-white py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden h-[400px] md:h-[600px]">
        <div className="absolute inset-0 opacity-40 bg-[url('https://via.placeholder.com/1920x800.png?text=Lego+Arkaplan')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <h1 className="text-yellow-400 text-5xl md:text-6xl font-black tracking-tight drop-shadow-md">Renkli dünyamıza hoş geldiniz!</h1>
          <p className="text-xl md:text-2xl font-medium tracking-wide drop-shadow-sm">Minifigür dünyasının kapılarını aralayın ve maceralarımıza katılın.</p>
          <div className="flex gap-4 justify-center mt-10">
            <Link href="/seriler" className="bg-[#D22B2B] text-white font-bold py-4 px-12 rounded-sm shadow-lg hover:bg-[#B22222] transition-colors uppercase tracking-widest text-sm inline-block">Seriler</Link>
            <Link href="/figurler" className="bg-transparent border-2 border-white text-white font-bold py-4 px-12 rounded-sm shadow-lg hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-sm inline-block">Figürler</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-black text-white flex flex-col items-center justify-center text-center px-4 overflow-hidden h-[400px] md:h-[600px]">
      {sliders.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Arkaplan Görseli Düzenlemesi: background-image iptal edildi, daha stabil olan <img> kullanıldı */}
          <div className="absolute inset-0 bg-black">
            <img 
              src={slide.image_url || 'https://via.placeholder.com/1920x800.png?text=Gorsel+Yok'} 
              alt={slide.title}
              className="w-full h-full object-cover opacity-50 block"
            />
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
                }}
              />
            )}
            <div className="flex gap-4 justify-center mt-10">
              {slide.button1_text && (
                <Link href={slide.button1_link || '#'} className="bg-[#D22B2B] text-white font-bold py-4 px-12 rounded-sm shadow-[0_4px_14px_rgba(210,43,43,0.4)] hover:bg-[#B22222] transition-colors uppercase tracking-widest text-sm inline-block">
                  {slide.button1_text}
                </Link>
              )}
              {slide.button2_text && (
                <Link href={slide.button2_link || '#'} className="bg-transparent border-2 border-white text-white font-bold py-4 px-12 rounded-sm hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-sm inline-block">
                  {slide.button2_text}
                </Link>
              )}
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
