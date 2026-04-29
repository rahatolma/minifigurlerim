'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toggleCollectionStatus } from '@/app/actions/collection';
import { slugify } from '@/utils/helpers';
import { useAuth } from '@/components/providers/AuthProvider';
import { useGamification } from '@/components/providers/GamificationProvider';
import { useLocale, useTranslations } from 'next-intl';
import { getFigureUrl } from '@/utils/routeBuilder';
import { getLocalizedDemandSignal } from '@/utils/taxonomy';
import { toRarityOption } from '@/services/displayMappers';
import toast from 'react-hot-toast';

import { FigureCardData } from '@/utils/figureMapper';

export default function FigureCard(props: FigureCardData) {
  const {
    id,
    figure_name,
    figure_slug_tr,
    image_url,
    min_price,
    max_price,
    avg_price, // Will use avg_price as fallback for single price if needed, or stick to max
    rarity_level,
    value_score,
    demand_score,
    series_name,
    series_slug_tr
  } = props;


  
  const router = useRouter();
  const { user } = useAuth();
  const { userStatusMap, updateStatus: setGlobalStatus } = useGamification();
  
  const initialStatus = userStatusMap[id] || null;
  const isLoggedIn = !!user;

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'have' | 'want' | null>(null);

  // Sync with global state changes efficiently
  useEffect(() => {
    setStatus(userStatusMap[id] || null);
  }, [userStatusMap, id]);
  const locale = useLocale();
  const t = useTranslations('FigureCard');
  const tAction = useTranslations('CollectionActions');
  const tTax = useTranslations('Taxonomy');
  const tCommon = useTranslations('CommonTypes');

  const hasValidSlugs = !!series_slug_tr && !!(figure_slug_tr || id);
  const targetHref = hasValidSlugs ? getFigureUrl({
    seriesSlug: series_slug_tr,
    figureSlug: figure_slug_tr || id,
    locale: locale as any
  }) : '';

  const defaultImage = locale === 'en' ? '/images/placeholder-en.svg' : '/images/placeholder.svg';
  const [imgSrc, setImgSrc] = useState(image_url || defaultImage);

  useEffect(() => {
    setImgSrc(image_url || defaultImage);
  }, [image_url, defaultImage]);

  const handleToggle = async (e: React.MouseEvent, type: 'have' | 'want') => {
      e.preventDefault(); 
      e.stopPropagation();

      setLoading(true);
      const result = await toggleCollectionStatus(id, status, type);
      
      if (result?.success) {
          const newStatus = status === type ? null : type;
          setStatus(newStatus);
          setGlobalStatus(id, newStatus);
      } else {
          if (result?.error?.toLowerCase().includes('giriş') || result?.error?.toLowerCase().includes('oturum') || result?.error?.includes('yetki')) {
              router.push('/login');
          } else {
              if (result?.code === 'UNAPPROVED_USER') {
                  toast.error(tAction('ApprovalRequired'));
              } else {
                  toast.error(result?.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
              }
              if (!result?.error) {
                 router.push('/login'); // Fallback if no specific error string matches
              }
          }
      }
      setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_20px_40px_rgba(210,43,43,0.08)] hover:border-[#D22B2B]/20 hover:-translate-y-2 transition-all duration-400 ease-out relative group">
       
       <Link href={(targetHref || "#") as any} onClick={(e) => !targetHref && e.preventDefault()} aria-disabled={!targetHref} className={`relative w-full aspect-square bg-[#fff] flex items-center justify-center p-8 border-b border-gray-50 flex-none transition-colors ${targetHref ? 'group-hover:bg-[#fcfcfc]' : 'opacity-50 cursor-not-allowed'}`}>
          {(status === 'have') && (
             <div className="absolute top-4 left-4 z-10 bg-[#5CB85C] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                {t('InCollection')}
             </div>
          )}
          {(status === 'want') && (
             <div className="absolute top-4 left-4 z-10 bg-[#D22B2B] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                {t('InWishlist')}
             </div>
          )}
          <Image src={imgSrc} alt={figure_name} fill className="object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-500" onError={() => setImgSrc(defaultImage)} />
          
          {/* PREMIUM HOVER BADGE */}
          <div className="absolute bottom-4 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-2 group-hover:translate-y-0 pointer-events-none">
             {status === 'have' ? (
                <span className="bg-yellow-400/95 backdrop-blur-sm shadow-md shadow-yellow-400/30 text-black text-[9px] uppercase font-black tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7"></path></svg>
                   {t('AvailableInCollection')}
                </span>
             ) : (
                <span className="bg-gray-900/95 backdrop-blur-sm shadow-lg text-white text-[9px] uppercase font-black tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                   <svg className="w-3.5 h-3.5 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   {t('NotYetOwned')}
                </span>
             )}
          </div>
       </Link>

       <div className="px-6 pt-5 pb-6 flex flex-col flex-1 bg-white relative z-10">
          <Link href={(targetHref || "#") as any} onClick={(e) => !targetHref && e.preventDefault()} aria-disabled={!targetHref} className={`flex flex-col flex-1 items-center text-center ${targetHref ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
              
              {/* 1. Figure Name (Top) */}
              <div className="h-[56px] w-full overflow-hidden mb-2 flex flex-col items-center justify-start">
                  <h3 className="font-black text-[20px] sm:text-[22px] text-[#D22B2B] leading-tight tracking-tight group-hover:text-[#D22B2B] transition-colors hover:underline w-full line-clamp-2">
                      {(() => {
                          if (!figure_name) return "";
                          const parts = figure_name.split('(');
                          if (parts.length > 1) {
                             return (
                                <>
                                   {parts[0].trim()}
                                   <span className="block mt-0.5 text-gray-500 font-bold text-[14px] sm:text-[16px]">({parts.slice(1).join('(').trim()}</span>
                                </>
                             )
                          }
                          return figure_name;
                      })()}
                  </h3>
              </div>

              {/* 2. Series Name Stack (Matching SeriesCard font sizes) */}
              {series_name && (
                  <div className="flex flex-col items-center justify-center w-full mb-4">
                      <span className="block text-[14px] leading-[18px] font-semibold text-gray-800 mb-2 truncate max-w-[90%]">
                          {t('SeriesPrefixFull')}
                      </span>
                      <span className="block text-[14px] leading-[18px] font-semibold text-gray-500 truncate max-w-[90%]">
                          {series_name.replace(/^(?:LEGO.?\s*(?:Minifigürler|Minifigures)\s*(?:Serisi|Series)?[:\s-]*)/i, '').trim() || t('SeriesPrefixShort')}
                      </span>
                  </div>
              )}
          </Link>
          
          <div className="w-full h-px bg-gray-100 mb-4"></div>
          
          {/* VALUE BEDGE & TAGS */}
          <div className="flex flex-col gap-2 mt-4 px-2 mb-4">
             {/* Tahmini Değer Alanı */}
             <div className="flex flex-col items-center justify-center bg-gray-50 py-2.5 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">{t('EstimatedValue')}</span>
                <span className="text-[15px] font-black text-gray-900 tracking-tight">
                  {min_price && max_price ? `$${min_price} - $${max_price}` : (avg_price ? `$${avg_price}` : '-')}
                </span>
             </div>

             <div className="flex items-stretch gap-2 mt-1">
                {/* Değer Skoru Label */}
                <div className="flex flex-col flex-1 items-center justify-center bg-yellow-50/50 py-2 px-1 rounded-lg border border-yellow-100/50 text-center">
                    <span className="text-[9px] text-yellow-600/80 font-bold uppercase tracking-widest mb-0.5">{t('ValueScore')}</span>
                    <span className="text-[11px] font-black text-yellow-700 leading-tight">
                        {rarity_level ? toRarityOption(rarity_level, locale as 'tr'|'en').label : tCommon('Yaygın')}
                    </span>
                </div>

                {/* Talep Label */}
                <div className="flex flex-col flex-1 items-center justify-center bg-blue-50/50 py-2 px-1 rounded-lg border border-blue-100/50 text-center">
                    <span className="text-[9px] text-blue-600/80 font-bold uppercase tracking-widest mb-0.5">{t('DemandSignal')}</span>
                    <span className="text-[11px] font-black text-blue-700 leading-tight">
                        {(() => {
                           const dScore = typeof demand_score === 'number' ? demand_score : 0;
                           if (dScore > 80) return tCommon('Yüksek');
                           if (dScore > 50) return tCommon('Orta');
                           return tCommon('Düşük');
                        })()}
                    </span>
                </div>
             </div>
          </div>

          {/* ACTION BUTTONS */}
          {isLoggedIn ? (
              <div className="flex w-full gap-2">
                 <button 
                    onClick={(e) => handleToggle(e, 'have')} 
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-1.5 sm:px-2 rounded-xl transition-all font-bold text-[10px] sm:text-[11px] md:text-[12px] min-w-0 ${status === 'have' ? 'bg-[#5CB85C] text-white shadow-md' : 'bg-green-50/50 text-green-700 hover:bg-green-50 border border-green-100'}`}
                 >
                    {status === 'have' ? (
                       <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                       <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                    )}
                    <span className="truncate">{status === 'have' ? t('RemoveFromCollection') : t('AddToCollection')}</span>
                 </button>

                 <button 
                    onClick={(e) => handleToggle(e, 'want')}
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-1.5 sm:px-2 rounded-xl transition-all font-bold text-[10px] sm:text-[11px] md:text-[12px] min-w-0 ${status === 'want' ? 'bg-[#D22B2B] text-white shadow-[0_2px_10px_rgba(210,43,43,0.3)]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
                 >
                    {status === 'want' ? (
                       <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                    ) : (
                       <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    )}
                    <span className="truncate">{status === 'want' ? t('Unfollow') : t('Follow')}</span>
                 </button>
              </div>
          ) : (
              <div className="flex w-full gap-2 relative group/blur">
                  {/* Blur Overlay - Covers everything below */}
                  <Link href="/login" className="absolute -inset-x-0 -bottom-0 top-0 bg-white/40 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-[2px] rounded-b-xl overflow-hidden cursor-pointer group/overlay">
                      {/* Hover Text (Mobilde Sürekli Açık) */}
                      <span className="text-[11px] font-black tracking-widest text-[#D22B2B] drop-shadow-[0_1px_1px_rgba(255,255,255,1)] text-center px-4 transition-all duration-300 opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover/overlay:opacity-100 md:group-hover/overlay:translate-y-0 absolute uppercase z-20">
                          {t('LoginToSeeDetails1')}<br/>{t('LoginToSeeDetails2')}
                      </span>
                      
                      {/* Slight gradient to make text readable */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/20 to-transparent z-10"></div>
                  </Link>

                  {/* Sahte Butonlar Yarı Saydam (Arkaplan için) */}
                  <div className="flex w-full gap-2 opacity-30 select-none pointer-events-none">
                       <button className="flex-1 flex items-center justify-center gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl border border-green-100 bg-green-50/50 text-green-700 font-bold text-[11px] sm:text-[12px]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                          <span>{t('AddToCollection')}</span>
                       </button>

                       <button className="flex-1 flex items-center justify-center gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl border border-red-50 bg-red-50/30 text-red-600 font-bold text-[11px] sm:text-[12px]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                          <span>{t('Follow')}</span>
                       </button>
                  </div>
              </div>
          )}
       </div>
    </div>
  );
}
