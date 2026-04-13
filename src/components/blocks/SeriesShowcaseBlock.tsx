'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SeriesShowcaseBlockData } from '@/types/content-blocks';
import RichTextContent from '@/components/ui/RichTextContent';
import { Flag, Presentation, Star, Lightbulb, Zap } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useGamification } from '@/components/providers/GamificationProvider';

interface Props {
  data: SeriesShowcaseBlockData;
  seriesId?: string;
}

export default function SeriesShowcaseBlock({ data, seriesId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { userSeriesProgressMap } = useGamification();
  const isLoggedIn = !!user;

  const collectionStats = seriesId ? userSeriesProgressMap[seriesId] : null;

  const handleCollect = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    const listElement = document.getElementById('figures-list');
    if (listElement) {
      listElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const percent = isLoggedIn ? (collectionStats?.percent ?? 0) : 0;
  const collected = isLoggedIn ? (collectionStats?.collected ?? 0) : 0;
  const total = isLoggedIn ? (collectionStats?.total ?? 0) : 0;

  return (
    <div className="w-full relative py-12 md:py-16 bg-white">
      
      {/* ÜST KISIM: Sol 3'lü Görsel İskeleti + Sağ Yazı & İstatistikler */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 flex flex-col lg:flex-row items-start gap-12 lg:gap-12">
        
        {/* SOL: 3-Image Grid Layout & İstatistik Hapı */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
           <div className="grid grid-cols-2 gap-4">
             {/* Sol Sütun (Üst ve Alt) */}
             <div className="flex flex-col gap-4">
                {data.imageTopLeft ? (
                   <div className="w-full aspect-square bg-[#fafafa] rounded-2xl overflow-hidden border border-gray-100/50 p-6 md:p-8 flex items-center justify-center">
                      <img src={data.imageTopLeft} alt="Top Left Detail" className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                ) : (
                   <div className="w-full aspect-square bg-[#fafafa] rounded-2xl hidden md:block border border-gray-100/50"></div>
                )}
                {data.imageBottomLeft ? (
                   <div className="w-full aspect-square bg-[#fafafa] rounded-2xl overflow-hidden border border-gray-100/50 p-6 md:p-8 flex items-center justify-center">
                      <img src={data.imageBottomLeft} alt="Bottom Left Detail" className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                ) : (
                   <div className="w-full aspect-square bg-[#fafafa] rounded-2xl hidden md:block border border-gray-100/50"></div>
                )}
             </div>
             
             {/* Sağ Sütun (Üst ve Alt) */}
             <div className="flex flex-col gap-4">
                {data.imageTopRight ? (
                   <div className="w-full aspect-square bg-[#fafafa] rounded-2xl overflow-hidden border border-gray-100/50 p-6 md:p-8 flex items-center justify-center">
                      <img src={data.imageTopRight} alt="Top Right Detail" className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                ) : (
                   <div className="w-full aspect-square bg-[#fafafa] rounded-2xl hidden md:block border border-gray-100/50"></div>
                )}
                {data.imageBottomRight ? (
                   <div className="w-full aspect-square bg-[#fafafa] rounded-2xl overflow-hidden border border-gray-100/50 p-6 md:p-8 flex items-center justify-center">
                      <img src={data.imageBottomRight} alt="Bottom Right Detail" className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                ) : (
                   <div className="w-full aspect-square bg-[#fafafa] rounded-2xl hidden md:block border border-gray-100/50"></div>
                )}
             </div>
           </div>

           {/* Görüntülenme Metrikleri (Yatay Hap Tasarımı) */}
           <div className="w-full bg-white border border-gray-100 rounded-[24px] shadow-sm shrink-0">
             <div className="flex flex-row items-stretch justify-between divide-x divide-gray-100 px-2 py-4">
                <div className="flex-1 flex flex-col items-center justify-center text-center px-1 overflow-hidden">
                   <span className="text-xl font-bold text-green-600 leading-none mb-1">3</span>
                   <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase truncate w-full">T. Gör.</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center px-1 overflow-hidden">
                   <span className="text-xl font-bold text-green-600 leading-none mb-1">3</span>
                   <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase truncate w-full">G. Gör.</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center px-1 overflow-hidden">
                   <span className="text-xl font-bold text-[#D22B2B] leading-none mb-1">1 Dk</span>
                   <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase truncate w-full">Okuma</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center px-1 overflow-hidden">
                   <span className="text-xl font-bold text-gray-800 leading-none mb-1">0</span>
                   <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase truncate w-full">Yorum</span>
                </div>
             </div>
           </div>
        </div>

        {/* SAĞ: Başlık, Hikaye ve İstatistik Kutuları */}
        <div className="w-full lg:w-1/2 flex flex-col">
           {/* Başlık (Kırmızı) */}
           <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#D22B2B] tracking-tight leading-tight mb-2">
             {data.title || "Seri Hakkında"}
           </h2>
           {data.subtitle && (
             <p className="text-sm font-semibold text-gray-500 tracking-wide mb-8">
               {data.subtitle}
             </p>
           )}
           
           {/* Dinamik Hikaye */}
           {data.longStory && (
             <div className="prose prose-sm md:prose-base max-w-none text-gray-800 font-medium leading-[1.8] marker:text-[#D22B2B] mb-12">
               <RichTextContent html={data.longStory} />
             </div>
           )}

           {/* Dinamik Koleksiyon İstatistik Kutuları */}
           <div className="grid grid-cols-2 gap-4 md:gap-6 mt-auto">
             
             {/* Box 1: Yüzde Tamamlanma */}
             <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-gray-100 min-h-[200px]">
                <div className="flex items-center justify-between">
                  <Flag className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </div>
                {!isLoggedIn ? (
                  <div className="mt-4">
                    <span className="text-4xl md:text-5xl font-bold text-gray-300 tracking-tighter leading-none inline-block mb-2">?</span>
                    <p className="text-[12px] md:text-[13px] font-bold text-gray-400">Giriş Yapılmadı</p>
                    <div className="h-6 mt-3"></div> {/* spacer to align */}
                  </div>
                ) : (
                  <div className="mt-4">
                    <span className="text-4xl md:text-5xl font-bold text-green-600 tracking-tighter leading-none inline-block mb-2">%{percent}</span>
                    <p className="text-[12px] md:text-[13px] font-bold text-gray-800">Tamamlandı</p>
                    <div className="h-6 mt-3 relative">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden absolute top-1">
                        <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
             </div>

             {/* Box 2: Kesir / Adet Bilgisi */}
             <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-gray-100 min-h-[200px]">
                <div className="flex items-center justify-between">
                  <Presentation className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </div>
                {!isLoggedIn ? (
                  <div className="mt-4">
                    <span className="text-4xl md:text-5xl font-bold text-gray-300 tracking-tighter leading-none inline-block mb-2">0</span>
                    <p className="text-[12px] md:text-[13px] font-bold text-gray-400">Hedef {total || '?'} Figür</p>
                    <div className="h-6 mt-3"></div> {/* spacer */}
                  </div>
                ) : (
                  <div className="mt-4">
                    <span className="text-4xl md:text-5xl font-bold text-[#D22B2B] tracking-tighter leading-none mb-2 block">{collected}</span>
                    <p className="text-[12px] md:text-[13px] font-bold text-gray-800 text-balance">
                      {total ? `${total} figürden ${collected} sende` : 'Durum bilinmiyor'}
                    </p>
                    <div className="h-6 mt-3">
                       {total - collected > 0 && (
                          <p className="text-[10px] md:text-[11px] font-semibold text-gray-400 pt-1">Seriyi tamamlamana sadece <strong className="text-gray-700">{total - collected} figür</strong> kaldı</p>
                       )}
                    </div>
                  </div>
                )}
             </div>

           </div>
        </div>

      </div>

      {/* ARA BÖLÜM: CTA Şeridi */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-16 mb-16 text-center md:text-left">
         <div className="bg-[#0a0a0a] border border-[#1f1f1f] shadow-2xl rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
            
            {/* Arkaplan Deseni / Işık */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
               <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[200%] bg-[#D22B2B] mix-blend-screen filter blur-[100px] rounded-full rotate-45 transform"></div>
               <div className="absolute bottom-[-50%] right-[-10%] w-[40%] h-[150%] bg-[#D22B2B] mix-blend-screen filter blur-[80px] rounded-full opacity-50"></div>
            </div>

            <div className="flex flex-col relative z-10 max-w-2xl">
               <div className="inline-block px-3 py-1 bg-white/10 text-gray-300 border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase mb-5 w-max mx-auto md:mx-0">
                  {data.title || "Koleksiyonuna Değer Kat"}
               </div>
               <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
                 Seriyi Tamamlamaya <span className="text-[#D22B2B]">Devam Et</span>
               </h3>
               <p className="text-base md:text-lg font-medium text-gray-400">Tüm figürleri teker teker incele, koleksiyonuna ekle ve tamamlama ilerlemeni anında takip et.</p>
            </div>
            
            <button 
               onClick={handleCollect}
               className="bg-[#D22B2B] hover:bg-[#b02222] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-transform hover:scale-105 shrink-0 shadow-xl shadow-red-900/20"
            >
               KOLEKSİYONUMA EKLE
            </button>
            
         </div>
      </div>

      {/* ALT BÖLÜM: 3 Sütunlu Vurgu Kutuları (Öne Çıkanlar vs) */}
      <div className="max-w-7xl mx-auto px-6 md:px-8">
         <div className="flex flex-col gap-6 md:gap-8">
            
            {/* Üst Tam Genişlik: Card Design (Sütun 1) */}
            {(data.box1Title || data.box1Content) && (
              <div className="flex flex-col items-center text-center bg-white border border-gray-100 border-t-4 border-t-[#111] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden group hover:shadow-xl hover:border-t-[#D22B2B] transition-all duration-300">
                 {/* Büyük arkaplan sayısı biraz daha yumuşatıldı ve büyütüldü */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] md:text-[300px] font-black text-gray-50 opacity-40 select-none pointer-events-none group-hover:scale-105 group-hover:text-gray-100 transition-all duration-700 ease-out z-0 leading-none">1</div>
                 
                 <div className="mb-6 text-[#111] relative z-10 bg-gray-50 p-5 rounded-full group-hover:bg-red-50 group-hover:text-[#D22B2B] transition-colors">
                   <Star size={32} strokeWidth={2.5} />
                 </div>
                 
                 <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-6 relative z-10 break-words w-full">{data.box1Title}</h3>
                 
                 <p className="text-gray-600 font-medium text-[16px] md:text-[18px] leading-[1.8] relative z-10 max-w-4xl">
                   {data.box1Content}
                 </p>
              </div>
            )}

            {/* Alt 2 Sütunlu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

            {/* Sütun 2: Card Design */}
            {(data.box2Title || data.box2Content) && (
              <div className="flex flex-col items-center text-center bg-white border border-gray-100 border-t-4 border-t-[#D22B2B] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] font-black text-gray-100 opacity-30 select-none pointer-events-none group-hover:scale-105 group-hover:text-red-50 transition-all duration-700 ease-out z-0 leading-none">2</div>
                 
                 <div className="mb-5 text-[#D22B2B] relative z-10 bg-red-50 p-4 rounded-full group-hover:bg-[#111] group-hover:text-white transition-colors">
                   <Lightbulb size={24} strokeWidth={2.5} />
                 </div>
                 
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4 relative z-10 break-words w-full">{data.box2Title}</h3>
                 
                 <p className="text-gray-600 font-medium text-[15px] leading-[1.8] relative z-10">
                   {data.box2Content}
                 </p>
              </div>
            )}

            {/* Sütun 3: Card Design */}
            {(data.box3Title || data.box3Content) && (
              <div className="flex flex-col items-center text-center bg-white border border-gray-100 border-t-4 border-t-[#111] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:shadow-xl hover:border-t-[#D22B2B] transition-all duration-300">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] font-black text-gray-100 opacity-30 select-none pointer-events-none group-hover:scale-105 group-hover:text-gray-200 transition-all duration-700 ease-out z-0 leading-none">3</div>
                 
                 <div className="mb-5 text-[#111] relative z-10 bg-gray-50 p-4 rounded-full group-hover:bg-red-50 group-hover:text-[#D22B2B] transition-colors">
                   <Zap size={24} fill="none" strokeWidth={2.5} />
                 </div>
                 
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4 relative z-10 break-words w-full">{data.box3Title}</h3>
                 
                 <p className="text-gray-600 font-medium text-[15px] leading-[1.8] relative z-10">
                   {data.box3Content}
                 </p>
              </div>
            )}

            </div>
         </div>
      </div>

      {/* EN ALT BÖLÜM: Koleksiyoner Yorumu (Eğer doldurulmuşsa) */}
      {(data.quoteTitle || data.quoteContent) && (
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 mt-12 mb-8">
           <div className="w-full text-center bg-[#F2CD37] rounded-[32px] p-8 md:p-12 lg:p-16 shadow-[0_15px_40px_-10px_rgba(242,205,55,0.4)] relative overflow-hidden">
               {/* Dekoratif Arka Plan Işıkları */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#111] opacity-[0.04] rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

               <div className="flex flex-col items-center gap-6 md:gap-8 relative z-10 w-full">
             {/* Büyük Yorum Başlığı */}
             {data.quoteTitle && (
               <div className="flex flex-col items-center gap-5">
                 <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1a1c29] tracking-tight leading-[1.2] text-balance">
                   {data.quoteTitle}
                 </h2>
                 <div className="w-16 h-1.5 rounded-full bg-[#D22B2B]"></div>
               </div>
             )}
             
             {/* Yorum / Alt Başlık Metni */}
             {data.quoteContent && (
               <div className="w-full">
                 <RichTextContent 
                   html={data.quoteContent}
                   className="text-[18px] md:text-[20px] lg:text-[22px] text-gray-900 font-bold leading-[1.8] [&_p]:!my-0 [&_span]:!bg-transparent text-balance selection:bg-[#1a1c29] selection:text-[#F2CD37]"
                 />
               </div>
             )}
           </div>
         </div>
       </div>
      )}

    </div>
  );
}
