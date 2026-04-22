'use client';

import React, { useState } from 'react';
import DragScrollContainer from '@/components/ui/DragScrollContainer';

const MINIFIGURE_EVOLUTION = [
  { year: '1978', title: 'Klasik Yüz', desc: 'Legoland Town ile klasik sarı gülümseme doğdu.', icon: 'happy', color: 'text-[#F2CD37]' },
  { year: '1989', title: 'Korsan Çağı', desc: 'Sakal, bıyık ve göz bantları eklendi.', icon: 'neutral', color: 'text-[#F2CD37]' },
  { year: '1990', title: 'Uzaylılar', desc: 'Bambaşka ve asimetrik yüzler üretildi.', icon: 'eye', color: 'text-[#F2CD37]' },
  { year: '1992', title: 'Çil ve Detay', desc: 'Paradisa temasıyla çiller ve dudak izleri geldi.', icon: 'happy', color: 'text-[#F2CD37]' },
  { year: '1996', title: 'Alevin Ruhu', desc: 'Kafanın içinden dışarı saçılan efektler tasarlandı.', icon: 'fire', color: 'text-[#F2CD37]' },
  { year: '2001', title: 'Büyüteçli', desc: 'Tasarım teknolojisinin zirvesindeki yüzler.', icon: 'search', color: 'text-[#F2CD37]' },
  { year: '2010', title: 'CMF Dönemi', desc: 'Kör paket devrimi ile eşsiz koleksiyon yüzleri.', icon: 'happy', color: 'text-[#F2CD37]' },
  { year: '2014', title: 'Lisanslı Yüzler', desc: 'Simpsons gibi IP kalıplarına özel yüzler yapıldı.', icon: 'neutral', color: 'text-[#F2CD37]' },
  { year: '2018', title: 'Altın Çağ', desc: '20. yılına özel çok nadide baskılar kullanıldı.', icon: 'fire', color: 'text-[#F2CD37]' },
  { year: '2024', title: 'Modern Dönem', desc: 'Detay seviyesi film stüdyolarındaki kaliteye ulaştı.', icon: 'search', color: 'text-[#F2CD37]' },
];

export default function EvolutionTimelineClient() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="hidden md:block w-full bg-[#fcfcfc] pt-12 pb-16 overflow-hidden relative border-b border-gray-100 z-10">
       <div className="max-w-7xl mx-auto px-8 mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
            Minifigürlerin <span className="text-[#D22B2B]">Evrimi</span>
          </h2>
          <p className="text-gray-500 font-bold max-w-2xl mx-auto text-sm md:text-base">
            Koleksiyonluk figürlerin 1978'den günümüze yüz değişimlerine tanık ol.<br />
            Tarihsel evrimi incelemek için noktalara tıkla.
          </p>
       </div>

       {/* Animasyonlu Kaydırma Alanı */}
       <DragScrollContainer className="w-full pb-10 pt-4 px-4 md:px-12">
          <div className="flex items-start gap-0 w-max md:min-w-full md:justify-center relative px-8 pointer-events-auto group/timeline">
             {/* Arka plan bağlayıcı çizgisi (Dot'ların tam ortasından geçer: h-24+mb-2+h-12 = 44px) */}
             <div className="absolute top-[44px] left-0 right-0 h-px bg-gray-200 -z-10"></div>
          
             {MINIFIGURE_EVOLUTION.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                <div 
                  key={index} 
                  onClick={() => setActiveIndex(index)}
                  className={`flex flex-col items-center justify-start shrink-0 w-[140px] px-2 transition-all duration-500 cursor-pointer ${isActive ? 'opacity-100 scale-100' : 'opacity-30 scale-95 hover:opacity-60'}`}
                >
                    {/* Yıl Rozeti (Mekanik yükseklik ile sabitlendi ki font büyüyünce dot zıplamasın) */}
                    <div className="h-[24px] mb-2 flex items-end justify-center w-full">
                        <div className={`font-black tracking-widest uppercase transition-all duration-500 transform ${isActive ? 'text-[14px] text-[#D22B2B]' : 'text-[11px] text-gray-500'}`}>
                            {item.year}
                        </div>
                    </div>

                    {/* Timeline Node (DOT) */}
                    <div className="relative w-full flex items-center justify-center mb-5 z-10 h-6">
                        <div className={`transition-all duration-500 rounded-full flex items-center justify-center border-2 border-white ${isActive ? 'w-5 h-5 bg-[#D22B2B] shadow-[0_0_0_6px_rgba(210,43,43,0.15)]' : 'w-3 h-3 bg-gray-300'}`}>
                        </div>
                    </div>

                    {/* Content (Title & Desc) */}
                    <div className="text-center w-full flex flex-col items-center h-[90px]">
                       <h4 className={`font-black tracking-widest uppercase mb-2 transition-all duration-500 transform ${isActive ? 'text-[14px] text-gray-900' : 'text-[12px] text-gray-600'}`}>
                         {item.title}
                       </h4>
                       
                       {/* Fixed height ensures we don't cause layout shift. We only transition opacity. */}
                       <div className={`transition-all duration-500 ${isActive ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'}`}>
                          <p className="text-[11px] text-gray-500 font-bold leading-relaxed px-1 line-clamp-3">
                             {item.desc}
                          </p>
                       </div>
                    </div>
                </div>
             )})}
          </div>
       </DragScrollContainer>
    </div>
  );
}
