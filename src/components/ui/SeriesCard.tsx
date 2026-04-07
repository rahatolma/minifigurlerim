import Image from 'next/image';
import Link from 'next/link';

interface SeriesCardProps {
  id: string;
  title: string;
  imageUrl: string;
  year?: string | number | null;
  totalFigures?: number | null;
  latestFigureName?: string | null;
  category?: string | null;
  rarity?: string | null;
  seriesProgress?: {
      percent: number;
      collected: number;
      total: number;
  } | null;
  
  // Eski metrics opsiyonel bırakılıyor
  views?: number;
  dailyViews?: number;
  minRead?: number;
  comments?: number;
  isLoggedIn?: boolean;
}

export default function SeriesCard({ 
  id, title, imageUrl, year, category, rarity, totalFigures, latestFigureName, seriesProgress, isLoggedIn = true
}: SeriesCardProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-2xl hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 relative group">
       <Link href={`/seriler/${id}`} className="relative w-full aspect-[4/3] bg-[#fff] flex items-center justify-center border-b border-gray-50 flex-none group-hover:bg-[#fcfcfc] transition-colors">
          <Image src={imageUrl} alt={title} fill className="object-contain px-6 py-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
       </Link>

       <div className="px-6 pt-5 pb-6 flex flex-col flex-1 bg-white">
          <Link href={`/seriler/${id}`} className="flex flex-col flex-1 cursor-pointer items-center text-center">
              <h3 className="font-black text-[22px] text-[#D22B2B] leading-tight tracking-tight hover:underline mb-1 w-full">{title}</h3>
              <p className="font-semibold text-[13px] text-gray-500 mb-4 w-full">{category || 'LEGO® Minifigür Serisi'}</p>
          </Link>
          
          <div className="w-full h-px bg-gray-100 mb-4"></div>
          
          {/* META ROW: 2016 • 16 Figür • Yaygın */}
          <div className="flex items-center justify-center gap-3 text-[13px] font-bold text-gray-800 mb-5">
             <span className="flex items-center gap-1.5 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {year || '-'}
             </span>
             <span className="text-gray-300">•</span>
             <span className="font-black text-gray-900">{totalFigures !== undefined ? totalFigures : (seriesProgress?.total ?? 0)} Figür</span>
             <span className="text-gray-300">•</span>
             <span className="font-bold text-[#D22B2B]">{rarity || 'Yaygın'}</span>
          </div>

          {/* SERIES PROGRESS VE ALT ALANLAR */}
          {isLoggedIn ? (
            <div className="w-full pt-4 mt-auto border-t border-gray-100 flex flex-col">
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold text-[#555] tracking-wide">
                        <span>Seriyi Tamamlama</span>
                        <span className="text-gray-900">%{(seriesProgress?.percent ?? 0).toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#10b981] h-2 transition-all duration-1000" style={{ width: `${seriesProgress?.percent || 0}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <div className="text-[10px] text-gray-500 font-medium">Bu seride {totalFigures !== undefined ? totalFigures : (seriesProgress?.total ?? 0)} figürden {seriesProgress?.collected || 0}'i sende</div>
                        <div className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-sm">{seriesProgress?.collected || 0} / {totalFigures !== undefined ? totalFigures : (seriesProgress?.total ?? 0)}</div>
                    </div>
                </div>

                {/* LATEST ADDED (YENİ EKLEME) */}
                <div className="w-full mt-4 bg-gray-50 border border-gray-100 rounded-lg p-2.5 flex items-center justify-between group-hover:bg-[#fcf8f8] group-hover:border-[#ffeaea] transition-colors">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#D22B2B]">Son Eklenen</span>
                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1 truncate max-w-[140px] text-right">
                        {latestFigureName || 'Henüz Yok'}
                    </span>
                </div>

                <div className="w-full mt-3">
                    <Link href={`/seriler/${id}`} className="flex w-full items-center justify-center bg-gray-50 group-hover:bg-[#D22B2B] text-gray-500 group-hover:text-white rounded-md py-3 text-[11px] font-black tracking-widest uppercase transition-all duration-300">
                        Seriyi Tamamla
                    </Link>
                </div>
            </div>
          ) : (
            <div className="w-full pt-4 mt-auto border-t border-gray-100 relative group/blur">
                {/* Blur Overlay - Covers everything below */}
                <div className="absolute -inset-x-0 -bottom-0 top-0 bg-white/40 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-[2px] rounded-b-xl overflow-hidden cursor-default group/overlay">
                    {/* Hover Text (Mobilde Sürekli Açık) */}
                    <span className="text-[11px] font-black tracking-widest text-[#D22B2B] drop-shadow-[0_1px_1px_rgba(255,255,255,1)] text-center px-4 transition-all duration-300 opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover/overlay:opacity-100 md:group-hover/overlay:translate-y-0 absolute uppercase z-20">
                        Detayları görmek<br/>için erişim aç
                    </span>
                    
                    {/* Slight gradient to make text readable */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/20 to-transparent z-10"></div>
                </div>

                {/* Sahte/Flu İçerik */}
                <div className="flex flex-col opacity-30 select-none pointer-events-none">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[11px] font-bold text-[#555] tracking-wide">
                            <span>Seriyi Tamamlama</span>
                            <span className="text-gray-900">%0</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"></div>
                        <div className="flex justify-between items-center mt-1">
                            <div className="text-[10px] text-gray-500 font-medium">Bu seride {totalFigures !== undefined ? totalFigures : (seriesProgress?.total ?? 0)} figürden 0'i sende</div>
                            <div className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-sm">0 / {totalFigures !== undefined ? totalFigures : (seriesProgress?.total ?? 0)}</div>
                        </div>
                    </div>

                    <div className="w-full mt-4 bg-gray-50 border border-gray-100 rounded-lg p-2.5 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#D22B2B]">Son Eklenen</span>
                        <span className="text-[11px] font-bold text-gray-800 line-clamp-1 truncate max-w-[140px] text-right">
                            {latestFigureName || 'Bu Serideki Figürler'}
                        </span>
                    </div>

                    <div className="w-full mt-3">
                        <span className="flex w-full items-center justify-center bg-gray-50 text-gray-400 rounded-md py-3 text-[11px] font-black tracking-widest uppercase">
                            Seriyi Tamamla
                        </span>
                    </div>
                </div>
            </div>
          )}
       </div>
    </div>
  );
}
