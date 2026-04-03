import { createClient } from '@/utils/supabase/server';
import FigureCard from '@/components/ui/FigureCard';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import Link from 'next/link';
import FiguresFilterClient from '@/components/ui/FiguresFilterClient';
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

export const revalidate = 0; // Her zaman güncel

export default async function FiguresPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const sortParam = (resolvedParams?.sort as string) || 'newest';
  const selectedSeries = (resolvedParams?.series as string) || 'all';
  const selectedRole = (resolvedParams?.role as string) || 'all';
  const selectedType = (resolvedParams?.type as string) || 'all';
  const selectedRarity = (resolvedParams?.rarity as string) || 'all';

  // 1. Verileri SSR Üzerinden Çek
  const serverClient = await createClient();
  const { data: { user } } = await serverClient.auth.getUser();

  const [fRes, sRes] = await Promise.all([
    serverClient.from('minifigures').select('*'),
    serverClient.from('series').select('id, title').order('created_at', { ascending: false })
  ]);

  let allFigures = fRes.data || [];
  const seriesList = sRes.data || [];

  const userStatusMap: Record<string, 'have' | 'want'> = {};
  const userSeriesProgressMap: Record<string, { percent: number, collected: number, total: number }> = {};
  
  if (user) {
      const [{ data: userCollects }, { data: cachedStats }] = await Promise.all([
         serverClient.from('user_collections').select('status, minifigure_id').eq('user_id', user.id),
         serverClient.from('user_series_stats').select('*').eq('user_id', user.id)
      ]);

      if (userCollects) {
          userCollects.forEach(c => {
             if (c.minifigure_id && c.status) userStatusMap[c.minifigure_id] = c.status as 'have'|'want';
          });
      }
      if (cachedStats) {
          cachedStats.forEach(stat => {
              userSeriesProgressMap[stat.series_id] = {
                  percent: Number(stat.completion_percent),
                  collected: stat.owned_count,
                  total: stat.total_count
              };
          });
      }
  }

  // Dinamik Filtre Seçeneklerini Oluştur (null veya boş string eyle)
  const roles = Array.from(new Set(allFigures.map(f => f.role).filter(Boolean))) as string[];
  const types = Array.from(new Set(allFigures.map(f => f.type).filter(Boolean))) as string[];
  const rarities = Array.from(new Set(allFigures.map(f => f.rarity).filter(Boolean))) as string[];

  // Filtreleme (Client taraflı URL parametreleri ile)
  allFigures = allFigures.filter(f => {
    let match = true;
    if (selectedSeries !== 'all' && f.series_id !== selectedSeries) match = false;
    if (selectedRole !== 'all' && f.role !== selectedRole) match = false;
    if (selectedType !== 'all' && f.type !== selectedType) match = false;
    if (selectedRarity !== 'all' && f.rarity !== selectedRarity) match = false;
    return match;
  });

  // Sıralama (Sort)
  if (sortParam === 'newest') {
      allFigures = allFigures.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortParam === 'oldest') {
      allFigures = allFigures.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sortParam === 'popular') {
      allFigures = allFigures.sort((a, b) => (b.total_views || 0) - (a.total_views || 0));
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-32">
      
      {/* ŞABLON BREADCRUMB */}
      <div className="border-b border-gray-200 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ height: '70px' }}>
             <div className="flex items-center">
                 <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link> 
                 <span className="mx-3 text-gray-200">/</span> 
                 <span className="text-gray-900">Figürler</span>
             </div>
        </div>
      </div>

      {/* MİNİFİGÜR EVRİMİ (HERO TIMELINE) */}
      <div className="w-full bg-[#fcfcfc] pt-8 pb-12 overflow-hidden relative border-b border-gray-100 z-10">
         <div className="max-w-7xl mx-auto px-8 mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
              Minifigürlerin <span className="text-[#D22B2B]">Evrimi</span>
            </h2>
            <p className="text-gray-500 font-bold max-w-2xl mx-auto text-sm md:text-base">
              Koleksiyonluk figürlerin 1978'den günümüze yüz değişimlerine tanık ol! Sağa kaydır, tarihi devrime şahitlik et.
            </p>
         </div>

         {/* Animasyonlu Kaydırma Alanı */}
         <DragScrollContainer className="w-full pb-10 pt-4 snap-x snap-mandatory px-4 md:px-12">
            <div className="flex items-center gap-12 sm:gap-16 w-max md:min-w-full md:justify-center relative px-8 pointer-events-auto">
               {/* Arka plan bağlayıcı çizgisi */}
               <div className="absolute top-[48px] sm:top-[56px] left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
            
               {MINIFIGURE_EVOLUTION.map((item, index) => (
                  <div key={index} className="flex flex-col items-center justify-start snap-center shrink-0 w-[140px] group transition-all duration-300 pointer-events-none">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-full shadow-md border-2 border-transparent group-hover:border-[#D22B2B]/20 flex items-center justify-center mb-6 transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(210,43,43,0.15)] group-hover:scale-105 z-10 pointer-events-auto cursor-pointer">
                          <LegoHeadIcon mode={item.icon as any} color={item.color} className="w-14 h-14 sm:w-16 sm:h-16 transition-transform duration-300" />
                          
                          {/* Yıl Rozeti */}
                          <div className="absolute -bottom-3 bg-[#fcfcfc] border border-gray-200 text-gray-800 text-[11px] font-black px-3 py-1 rounded-full shadow-sm tracking-widest group-hover:bg-[#D22B2B] group-hover:text-white group-hover:border-[#D22B2B] transition-colors">
                              {item.year}
                          </div>
                      </div>
                      <div className="text-center opacity-70 group-hover:opacity-100 transition-opacity">
                         <h4 className="text-[12px] font-black tracking-widest text-gray-800 uppercase mb-2">{item.title}</h4>
                         <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-1">{item.desc}</p>
                      </div>
                  </div>
               ))}
            </div>
         </DragScrollContainer>
         
      </div>

      {/* Filtreleme ve Sonuçların Başına Dönmek İçin Sabit Çıpa */}
      <div id="filter-section" className="scroll-mt-[150px]"></div>

      <div className="sticky bg-[#fcfcfc] py-4 border-b border-gray-100 shadow-sm mb-6" style={{ top: '150px', zIndex: 40 }}>
        {/* YATAY FİLTRE BARI (Client-Side Auto Submit) */}
        <div className="max-w-7xl mx-auto px-8">
            <FiguresFilterClient 
              seriesList={seriesList} 
              roles={roles} 
              types={types} 
              rarities={rarities} 
              totalCount={allFigures.length}
            />
        </div>
      </div>

      {/* LİSTELEME KISMI */}
      <div className="max-w-7xl mx-auto px-8 pb-32">
            {allFigures.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center w-full shadow-sm mt-4">
                    <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">Bulunamadı</h2>
                    <p className="text-sm font-medium text-gray-500 max-w-sm">Mevcut filtrelere uyan bir LEGO figürü bulunmuyor. Diğer seçenekleri deneyebilirsin.</p>
                </div>
            ) : (
                <>
                    {/* Görsel 1'deki gibi 3'lü kolon (lg:grid-cols-3), 20px gap (gap-5) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
                        {allFigures.map(fig => (
                            <FigureCard 
                                key={fig.id} 
                                id={fig.id}
                                slug={fig.slug}
                                name={fig.name}
                                seriesName={fig.series_name || 'Bilinmeyen Seri'}
                                imageUrl={fig.images && fig.images.length > 0 ? fig.images[0] : 'https://via.placeholder.com/300x400.png?text=Görsel+Yok'}
                                year={fig.release_year}
                                rarity={fig.rarity}
                                price={fig.value_usd}
                                initialStatus={userStatusMap[fig.id] || null}
                                isLoggedIn={!!user}
                            />
                        ))}
                    </div>
                </>
            )}


      </div>
    </div>
  );
}
