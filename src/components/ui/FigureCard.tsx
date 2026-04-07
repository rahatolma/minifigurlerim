'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toggleCollectionStatus } from '@/app/actions/collection';
import { slugify } from '@/utils/helpers';

interface FigureCardProps {
  id: string; // Veritabanı UUID
  slug?: string; // URL Navigasyonu için
  name: string;
  seriesName: string;
  seriesSlug?: string;
  imageUrl: string;
  year?: string | number | null;
  rarity?: string | null;
  price?: number | null;
  initialStatus?: 'have' | 'want' | null;
  statusBadge?: 'have' | 'want' | null; 
  hideStats?: boolean;
  isLoggedIn?: boolean;
}

export default function FigureCard({ 
  id, slug, name, seriesName, seriesSlug, imageUrl, year, rarity, price, initialStatus, statusBadge, isLoggedIn = true
}: FigureCardProps) {
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'have' | 'want' | null>(initialStatus || statusBadge || null);

  const safeSeriesSlug = seriesSlug || (seriesName ? slugify(seriesName) : 'gizemli-seri');
  const targetHref = `/figurler/${safeSeriesSlug}/${slug || id}` as any;

  const handleToggle = async (e: React.MouseEvent, type: 'have' | 'want') => {
      e.preventDefault(); 
      e.stopPropagation();

      setLoading(true);
      const result = await toggleCollectionStatus(id, status, type);
      
      if (result?.success) {
          setStatus(status === type ? null : type);
      } else {
          if (result?.error?.toLowerCase().includes('giriş') || result?.error?.toLowerCase().includes('oturum') || result?.error?.includes('yetki')) {
              router.push('/login');
          } else {
              alert(result?.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
              if (!result?.error) {
                 router.push('/login'); // Fallback if no specific error string matches
              }
          }
      }
      setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-2xl hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 relative group">
       
       <Link href={targetHref} className="relative w-full aspect-square bg-[#fff] flex items-center justify-center p-8 border-b border-gray-50 flex-none group-hover:bg-[#fcfcfc] transition-colors">
          {(status === 'have') && (
             <div className="absolute top-4 left-4 z-10 bg-[#5CB85C] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                Koleksiyonda
             </div>
          )}
          {(status === 'want') && (
             <div className="absolute top-4 left-4 z-10 bg-[#D22B2B] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                Takipte
             </div>
          )}
          <Image src={imageUrl} alt={name} fill className="object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
          
          {/* PREMIUM HOVER BADGE */}
          <div className="absolute bottom-4 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-2 group-hover:translate-y-0 pointer-events-none">
             {status === 'have' ? (
                <span className="bg-[#5CB85C]/95 backdrop-blur-sm shadow-lg text-white text-[9px] uppercase font-black tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7"></path></svg>
                   Koleksiyonunda Mevcut
                </span>
             ) : (
                <span className="bg-gray-900/95 backdrop-blur-sm shadow-lg text-white text-[9px] uppercase font-black tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                   <svg className="w-3.5 h-3.5 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   Henüz Sende Yok
                </span>
             )}
          </div>
       </Link>

       <div className="px-6 pt-5 pb-6 flex flex-col flex-1 bg-white">
          <Link href={targetHref} className="flex flex-col flex-1 cursor-pointer items-center text-center">
              <h3 className="font-black text-[22px] text-[#D22B2B] leading-tight tracking-tight hover:underline mb-1 w-full">{name}</h3>
              <p className="font-semibold text-[13px] text-gray-500 mb-4 w-full">{seriesName || 'LEGO® Minifigürler'}</p>
          </Link>
          
          <div className="w-full h-px bg-gray-100 mb-4"></div>
          
          {/* META ROW */}
          <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-[13px] font-bold text-gray-800 mb-5">
             <span className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {year || '-'}
             </span>
             <span className="text-gray-300">•</span>
             
             <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${rarity === 'Nadir' ? 'bg-purple-500' : rarity === 'Çok Nadir' ? 'bg-orange-500' : rarity === 'Efsanevi' ? 'bg-yellow-400' : 'bg-[#10b981]'}`}></span>
                {rarity || 'Yaygın'}
             </span>
             {price ? (
                <>
                   <span className="text-gray-300">•</span>
                   <span className="font-black text-gray-900">${price} USD</span>
                </>
             ) : null}
          </div>

          {/* ACTION BUTTONS */}
          {isLoggedIn ? (
              <div className="flex w-full gap-2 mb-4">
                 <button 
                    onClick={(e) => handleToggle(e, 'have')} 
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl transition-all font-bold text-[11px] sm:text-[12px] truncate ${status === 'have' ? 'bg-[#5CB85C] text-white shadow-md' : 'bg-green-50/50 text-green-700 hover:bg-green-50 border border-green-100'}`}
                 >
                    {status === 'have' ? (
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                    )}
                    <span>{status === 'have' ? 'Koleksiyonda' : 'Koleksiyonuma Ekle'}</span>
                 </button>

                 <button 
                    onClick={(e) => handleToggle(e, 'want')} 
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl transition-all font-bold text-[11px] sm:text-[12px] truncate ${status === 'want' ? 'bg-[#D22B2B] text-white shadow-md' : 'bg-red-50/30 text-red-600 hover:bg-red-50 border border-red-50'}`}
                 >
                    {status === 'want' ? (
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                    ) : (
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    )}
                    <span>Takip Et</span>
                 </button>
              </div>
          ) : (
              <div className="flex w-full gap-2 mb-4 relative group/blur">
                  {/* Blur Overlay - Covers everything below */}
                  <div className="absolute -inset-x-0 -bottom-0 top-0 bg-white/40 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-[2px] rounded-b-xl overflow-hidden cursor-default group/overlay">
                      {/* Hover Text (Mobilde Sürekli Açık) */}
                      <span className="text-[11px] font-black tracking-widest text-[#D22B2B] drop-shadow-[0_1px_1px_rgba(255,255,255,1)] text-center px-4 transition-all duration-300 opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover/overlay:opacity-100 md:group-hover/overlay:translate-y-0 absolute uppercase z-20">
                          Detayları görmek<br/>için erişim aç
                      </span>
                      
                      {/* Slight gradient to make text readable */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/20 to-transparent z-10"></div>
                  </div>

                  {/* Sahte Butonlar Yarı Saydam (Arkaplan için) */}
                  <div className="flex w-full gap-2 opacity-30 select-none pointer-events-none">
                       <button className="flex-1 flex items-center justify-center gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl border border-green-100 bg-green-50/50 text-green-700 font-bold text-[11px] sm:text-[12px]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                          <span>Koleksiyonuma Ekle</span>
                       </button>

                       <button className="flex-1 flex items-center justify-center gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl border border-red-50 bg-red-50/30 text-red-600 font-bold text-[11px] sm:text-[12px]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                          <span>Takip Et</span>
                       </button>
                  </div>
              </div>
          )}
       </div>
    </div>
  );
}
