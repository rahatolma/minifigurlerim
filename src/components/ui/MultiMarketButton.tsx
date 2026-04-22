'use client';

type Props = {
  customLink?: string;
  amazonUrl: string;
  trendyolUrl: string;
  hepsiburadaUrl: string;
};

export default function MultiMarketButton({ customLink, amazonUrl, trendyolUrl, hepsiburadaUrl }: Props) {
  // Admin özel borsa "Satın Al / Affilite" linki girmişse, TEK buton olarak burası çalışır.
  if (customLink) {
    return (
       <a href={customLink} target="_blank" rel="noopener noreferrer" className="w-full flex justify-center items-center gap-2 bg-[#FACC15] text-black hover:bg-yellow-500 font-extrabold text-[12px] tracking-widest uppercase px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          Sponsorlu Satın Al
       </a>
    );
  }

  // Admin boş bıraktığı için Otomatik TR Pazar Karşılaştırıcı çalışır
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full animate-in fade-in duration-300">
        <a href={amazonUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-xl hover:border-[#FF9900] hover:bg-orange-50/30 hover:shadow-sm transition-all group">
            <span className="text-[#FF9900] font-black text-[12px] uppercase tracking-widest group-hover:scale-105 transition-transform flex items-center gap-1.5">
                Amazon TR <span className="text-lg leading-none">➚</span>
            </span>
            <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Ara</span>
        </a>
        <a href={trendyolUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-xl hover:border-[#F27A1A] hover:bg-orange-50/30 hover:shadow-sm transition-all group">
            <span className="text-[#F27A1A] font-black text-[12px] uppercase tracking-widest group-hover:scale-105 transition-transform flex items-center gap-1.5">
                Trendyol <span className="text-lg leading-none">➚</span>
            </span>
            <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Ara</span>
        </a>
        <a href={hepsiburadaUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-1 px-4 py-3 bg-[#fcfcfc] border border-gray-200 rounded-xl hover:border-[#FF6000] hover:bg-orange-50/30 hover:shadow-sm transition-all group">
            <span className="text-[#FF6000] font-black text-[12px] uppercase tracking-widest group-hover:scale-105 transition-transform flex items-center gap-1.5">
                Hepsiburada <span className="text-lg leading-none">➚</span>
            </span>
            <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Ara</span>
        </a>
    </div>
  );
}
