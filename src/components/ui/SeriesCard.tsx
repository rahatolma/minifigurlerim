'use client';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import { useGamification } from '@/components/providers/GamificationProvider';
import type { SeriesCardViewModel } from '@/services/mappers';

export default function SeriesCard({ 
  id, seriesId, familyLabel, title, imageUrl, year, seriesNo, totalFigures, categoryLabel, rarityLabel, latestFigureName, labels, targetHref
}: SeriesCardViewModel) {
  const { user } = useAuth();
  const { userSeriesProgressMap, userLatestAddedFigureMap } = useGamification();
  const t = useTranslations('SeriesCard'); // We still need this for dynamic ProgressText because of `{collected}` injection
  
  const isLoggedIn = !!user;
  const lookupId = seriesId || id;
  const seriesProgress = userSeriesProgressMap[lookupId] || null;
  const actualLatestAddedText = userLatestAddedFigureMap[lookupId] || null;

  const [imgSrc, setImgSrc] = useState(imageUrl || labels.defaultImage);

  useEffect(() => {
    setImgSrc(imageUrl || labels.defaultImage);
  }, [imageUrl, labels.defaultImage]);

  const renderTitle = () => {
    if (familyLabel) {
      return (
        <>
          <span className="block text-[14px] leading-[18px] font-semibold text-gray-800 mb-2 truncate max-w-[95%] mx-auto text-center">{familyLabel}</span>
          <span className="block line-clamp-2 leading-snug group-hover/text:underline text-center mx-auto">{title}</span>
        </>
      );
    }
    return <span className="block group-hover/text:underline line-clamp-3 leading-snug text-center mx-auto">{title}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_20px_40px_rgba(210,43,43,0.08)] hover:border-[#D22B2B]/20 hover:-translate-y-2 transition-all duration-400 ease-out relative group">
       <Link href={(targetHref || "#") as any} onClick={(e) => !targetHref && e.preventDefault()} aria-disabled={!targetHref} className={`relative w-full aspect-[4/3] bg-gradient-to-b from-gray-50/50 to-white flex items-center justify-center border-b border-gray-50 flex-none transition-all duration-500 ${targetHref ? 'group-hover:from-red-50/20 group-hover:to-white' : 'opacity-50 cursor-not-allowed'}`}>
          <Image src={imgSrc} alt={title} fill className="object-contain px-6 py-4 mix-blend-multiply group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 will-change-transform" onError={() => setImgSrc(labels.defaultImage)} />
       </Link>

       <div className="px-6 pt-5 pb-6 flex flex-col flex-1 bg-white relative z-10">
          <Link href={(targetHref || "#") as any} onClick={(e) => !targetHref && e.preventDefault()} aria-disabled={!targetHref} className={`flex flex-col flex-1 items-center text-center group/text ${targetHref ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
              <div className="h-[76px] w-full mb-0 sm:mb-1 overflow-hidden flex flex-col items-center justify-center">
                  <h3 className="font-black text-[18px] sm:text-[20px] text-[#D22B2B] leading-tight tracking-tight w-full text-center">
                      {renderTitle()}
                  </h3>
              </div>
              <p className="block text-[14px] leading-[18px] font-semibold text-gray-500 mb-4 w-full truncate">
                 {categoryLabel || labels.categoryDefault}
              </p>
          </Link>
          
          <div className="w-full h-px bg-gray-100 mb-4"></div>
          
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 text-[11px] sm:text-[13px] font-bold text-gray-800 mb-5 flex-wrap w-full px-2">
             <span className="flex items-center gap-1.5 text-gray-600 whitespace-nowrap">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {year || '-'}
             </span>
             
             {seriesNo && (
               <>
                 <span className="text-gray-300 shrink-0">•</span>
                 <span className="text-gray-600 whitespace-nowrap">{seriesNo}</span>
               </>
             )}

             <span className="text-gray-300 shrink-0">•</span>
             <span className="font-black text-gray-900 whitespace-nowrap">{totalFigures ?? (seriesProgress?.total ?? 0)} {labels.figures}</span>
             
             <span className="text-gray-300 shrink-0">•</span>
             <span className="font-bold text-[#D22B2B] whitespace-nowrap">
                {rarityLabel}
             </span>
          </div>

          {isLoggedIn ? (
            <div className="w-full pt-4 mt-auto border-t border-gray-100 flex flex-col">
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold text-[#555] tracking-wide">
                        <span>{labels.completion}</span>
                        <span className="text-gray-900">
                          {labels.percentTemplate.replace('{val}', (seriesProgress?.percent ?? 0).toFixed(0))}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#10b981] h-2 transition-all duration-1000" style={{ width: `${seriesProgress?.percent || 0}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <div className="text-[10px] text-gray-500 font-medium">{t('ProgressText', { collected: seriesProgress?.collected || 0, total: totalFigures ?? (seriesProgress?.total ?? 0) })}</div>
                        <div className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-sm">{seriesProgress?.collected || 0} / {totalFigures ?? (seriesProgress?.total ?? 0)}</div>
                    </div>
                </div>

                <div className="w-full mt-4 bg-gray-50 border border-gray-100 rounded-lg p-2.5 flex items-center justify-between group-hover:bg-[#fcf8f8] group-hover:border-[#ffeaea] transition-colors">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#D22B2B]">{labels.latestAdded}</span>
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 truncate max-w-[140px] text-right">
                        {(seriesProgress && seriesProgress.collected > 0 && actualLatestAddedText) ? actualLatestAddedText : labels.noneYet}
                    </span>
                </div>

                <div className="w-full mt-3">
                    <Link href={(targetHref || "#") as any} onClick={(e) => !targetHref && e.preventDefault()} aria-disabled={!targetHref} className={`flex w-full items-center justify-center rounded-md py-3 text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${targetHref ? 'bg-gray-50 group-hover:bg-[#D22B2B] text-gray-500 group-hover:text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                        {labels.completeSeries}
                    </Link>
                </div>
            </div>
          ) : (
            <div className="w-full pt-4 mt-auto border-t border-gray-100 relative group/blur">
                <Link href="/login" className="absolute -inset-x-0 -bottom-0 top-0 bg-white/40 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-[2px] rounded-b-xl overflow-hidden cursor-pointer group/overlay">
                    <span className="text-[11px] font-black tracking-widest text-[#D22B2B] drop-shadow-[0_1px_1px_rgba(255,255,255,1)] text-center px-4 transition-all duration-300 opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover/overlay:opacity-100 md:group-hover/overlay:translate-y-0 absolute uppercase z-20">
                        {labels.loginRequired1}<br/>{labels.loginRequired2}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/20 to-transparent z-10"></div>
                </Link>

                <div className="flex flex-col opacity-30 select-none pointer-events-none">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[11px] font-bold text-[#555] tracking-wide">
                            <span>{labels.completion}</span>
                            <span className="text-gray-900">
                              {labels.percentTemplate.replace('{val}', '0')}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"></div>
                        <div className="flex justify-between items-center mt-1">
                            <div className="text-[10px] text-gray-500 font-medium">{t('ProgressText', { collected: 0, total: totalFigures ?? (seriesProgress?.total ?? 0) })}</div>
                            <div className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-sm">0 / {totalFigures ?? (seriesProgress?.total ?? 0)}</div>
                        </div>
                    </div>

                    <div className="w-full mt-4 bg-gray-50 border border-gray-100 rounded-lg p-2.5 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#D22B2B]">{labels.latestAdded}</span>
                        <span className="text-[11px] font-bold text-gray-800 line-clamp-1 truncate max-w-[140px] text-right">
                            {latestFigureName || labels.noneYet}
                        </span>
                    </div>

                    <div className="w-full mt-3">
                        <span className="flex w-full items-center justify-center bg-gray-50 text-gray-400 rounded-md py-3 text-[11px] font-black tracking-widest uppercase">
                            {labels.completeSeries}
                        </span>
                    </div>
                </div>
            </div>
          )}
       </div>
    </div>
  );
}
