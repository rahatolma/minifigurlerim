import { getMinifigureBySlug, getDefinitions, getFigurePriceHistory, getFiguresBySeries } from '@/services/dal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import FigureGallery from '@/components/ui/FigureGallery';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import ClientViewTracker from '@/components/ui/ClientViewTracker';
import CollectionActions from '@/components/ui/CollectionActions';
import FigureComments from './components/FigureComments';
import PriceChart from '@/components/ui/PriceChart';
import MultiMarketButton from '@/components/ui/MultiMarketButton';
import FloatingFigureNav from '@/components/ui/FloatingFigureNav';
import AuthProtectedBlur from '@/components/ui/AuthProtectedBlur';

import { slugify } from '@/utils/helpers';
import { formatBrandText } from '@/utils/textFormatting';
import { mapFigureForDetail } from '@/utils/figureMapper';

export const revalidate = 300; // 5 dakikalık ISR window

import { Metadata, ResolvingMetadata } from 'next';

// 🧱 LİSTE BLOĞU: Ansiklopedik temiz veri satırı
const TableRow = ({ label, value }: { label: string, value: any }) => {
    const displayValue = (!value || value === '' || value === 'Seçim Yapılmadı') ? '-' : value;
    return (
        <div className="flex justify-between items-center border-b border-gray-100 py-4 sm:py-5 text-[14px]">
            <div className="w-[40%] font-black text-gray-500 uppercase tracking-widest text-[10px] shrink-0 pr-4">{label}</div>
            <div className="w-[60%] font-bold text-gray-900 text-right break-words">{displayValue}</div>
        </div>
    );
}

// SEO Metadata Olusturucu
export async function generateMetadata(
  { params }: { params: Promise<{ seriesSlug: string, figureSlug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const rawFigure = await getMinifigureBySlug(resolvedParams.figureSlug);

  if (!rawFigure) {
    return { title: 'Figür Bulunamadı | Minifigürlerim' };
  }
  const figure = mapFigureForDetail(rawFigure);
  if (!figure) {
    return { title: 'Figür Bozuk | Minifigürlerim' };
  }

  const defaultImage = 'https://minifigurlerim.com/og-image.jpg';
  const figureImage = figure.image_url || defaultImage;
  const desc = figure.short_description_tr ? figure.short_description_tr.substring(0, 150) + '...' : `${figure.figure_name} detayları ve borsa geçmişi Minifigürlerim platformunda.`;

  // Dinamik OG Mimarisi
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://minifigurlerim.com';
  const ogUrl = new URL(`${baseUrl}/api/og/figure`);
  ogUrl.searchParams.set('title', figure.figure_name || '');
  ogUrl.searchParams.set('series', figure.series_name || 'Gizemli Seri');
  ogUrl.searchParams.set('image', figureImage);

  return {
    title: `${figure.figure_name} | LEGO Minifigür İncelemesi`,
    description: desc,
    openGraph: {
      title: `${figure.figure_name} | Karakter Detayları`,
      description: desc,
      images: [
        {
           url: ogUrl.toString(),
           width: 1200,
           height: 630,
           alt: figure.figure_name,
        }
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${figure.figure_name} | LEGO Minifigürleri`,
      description: desc,
      images: [ogUrl.toString()],
    }
  };
}

export default async function FigureDetail({
  params,
}: {
  params: Promise<{ seriesSlug: string, figureSlug: string }>
}) {
  const resolvedParams = await params;
  const { figureSlug: slug, seriesSlug } = resolvedParams;

  // UUID kontrolü yapıyoruz. Eski (ID bazlı) linkle mi gelindi yoksa yeni jenerasyon SEO Slug ile mi?
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const queryCol = isUUID ? 'id' : 'slug';

  // Figür verisini çek
  const rawFigure = await getMinifigureBySlug(resolvedParams.figureSlug);
  if (!rawFigure) return notFound();
  
  const figure = mapFigureForDetail(rawFigure);
  if (!figure) return notFound();

  // Sistem tanım gruplarını çek
  const defGroups = await getDefinitions();

  // YENİ: Auth & Gamification işlemleri artık bütünüyle Dynamic Island yaklaşımı ile
  // Client-Side Context'lerden çekiliyor (AuthProvider, GamificationProvider).
  // SSG/ISR caching'i engellememesi için SSR'dan silindi.

  // Fiyat Geçmişi Datasını Çek
  const historyData = await getFigurePriceHistory(figure.id);

  // TR Pazar Arama Yönlendirme Kurgusu
  const EBAY_CAMP_ID = process.env.NEXT_PUBLIC_AMAZON_TR_TAG || 'minifigurlerim-21'; // Amazon Partner Kimliği
  const searchKeyword = encodeURIComponent(`Lego Minifigure ${figure.figure_number || figure.figure_code || figure.figure_name}`);
  const amazonUrl = `https://www.amazon.com.tr/s?k=${searchKeyword}&tag=${EBAY_CAMP_ID}`;
  const trendyolUrl = `https://www.trendyol.com/sr?q=${searchKeyword}`;
  const hepsiburadaUrl = `https://www.hepsiburada.com/ara?q=${searchKeyword}`;

  // Ana Görseller
  const images = figure.image_url ? [figure.image_url] : [];
  
  // ÖNCEKİ VE SONRAKİ FİGÜR MANTIĞI (AYNI SERİ İÇİNDE)
  let prevFigure = null;
  let nextFigure = null;

  if (figure.series_id || figure.series_name) {
     const seriesFigures = await getFiguresBySeries(figure.series_id || figure.series_name, !!figure.series_id);

      if (seriesFigures && seriesFigures.length > 0) {
        // Find current figure index
        const currentIndex = seriesFigures.findIndex((f) => f.id === figure.id);
        
        if (currentIndex > 0) {
           const p = seriesFigures[currentIndex - 1];
           prevFigure = { slug: p.slug || p.id.toString(), name: p.name, seriesSlug };
        }
        if (currentIndex < seriesFigures.length - 1) {
           const n = seriesFigures[currentIndex + 1];
           nextFigure = { slug: n.slug || n.id.toString(), name: n.name, seriesSlug };
        }
     }
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen w-full pb-32">
      <FloatingFigureNav prev={prevFigure} next={nextFigure} />
      <ClientViewTracker table="minifigures" id={figure.id} />


      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
        
                {/* 🧱 SOL KOLON: Görsel ve Hızlı Aksiyonlar */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6 sticky pb-6 z-40" style={{ top: '100px' }}>
            
            {/* 1- ANA GÖRSEL KUTUSU */}
            <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center lg:min-h-[350px]">
                <FigureGallery images={images} name={figure.figure_name} />
            </div>

            {/* 2- KOLEKSİYON VE PUANLAMA BUTONLARI */}
            <CollectionActions minifigureId={figure.id} />

        </div>

        {/* 🧱 SAĞ KOLON: Detaylı Ansiklopedik Veriler */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
            
            {/* Üst Kutu: Bilgiler ve Tablo */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-start w-full">
            
            {/* Etiketler (Seri & Kategori) */}
            <div className="flex flex-wrap gap-2 items-center w-full mb-6">
                {figure.series_name && (
                    <Link href={figure.series_slug_tr ? `/seriler/${figure.series_slug_tr}` : `/seriler`} className="bg-red-50 text-[#D22B2B] hover:bg-[#D22B2B] hover:text-white transition-colors font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-3.5 py-1.5 rounded-sm">
                        {figure.series_name}
                    </Link>
                )}
                {figure.category_main && (
                    <Link href={`/seriler?category=${slugify(figure.category_main)}`} className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-3.5 py-1.5 rounded-sm">
                        {figure.category_main}
                    </Link>
                )}
            </div>

            {/* Başlık */}
            <h1 className="text-3xl md:text-5xl lg:text-5xl font-black text-[#111] leading-[1.1] tracking-tight mb-8">
                {formatBrandText(figure.figure_name)}
            </h1>

            {/* Açıklama Alanı */}
            <div className="text-gray-600 text-[15px] sm:text-[16px] font-medium leading-relaxed mb-10 w-full min-h-[40px]">
                {figure.short_description_tr ? formatBrandText(figure.short_description_tr) : <span className="text-gray-400 opacity-60">Figür açıklaması girilmemiş...</span>}
            </div>

            {/* 🧱 DİKEY ÖZELLİK LİSTESİ ŞABLONU (TABLE) */}
            <div className="w-full">
                <div className="flex flex-col w-full border-t border-gray-900 mt-2">
                    <TableRow label="Marka" value="LEGO®" />
                    <TableRow label="Seri Adı" value={figure.series_name} />
                    <TableRow label="Seri No" value={figure.series_number} />
                    <TableRow label="Seri Kategori" value={figure.category_main} />
                    <TableRow label="Figür Adı" value={figure.figure_name} />
                    <TableRow label="Figür Sıra No" value={figure.figure_number} />
                    <TableRow label="Figür Rolü" value={figure.figure_role} />
                    <TableRow label="Figür Tipi" value={figure.figure_type} />
                    <TableRow label="Figür Kodu" value={figure.figure_code} />
                    <TableRow label="Karakter" value={figure.character_name} />
                    <TableRow label="Ana Renk" value={figure.main_color} />
                    <TableRow label="Parça Sayısı" value={figure.piece_count} />
                    <TableRow label="Aksesuar Sayısı" value={figure.accessory_count} />
                    <TableRow label="Nadirlik Derecesi" value={figure.final_rarity || figure.rarity_level} />
                    <TableRow label="Çıkış Tarihi Ay" value={figure.release_month_tr} />
                    <TableRow label="Çıkış Tarihi Yıl" value={figure.release_year} />
                    
                    {/* DİNAMİK JSON Özel Detaylar */}
                    {figure.custom_attributes && Object.keys(figure.custom_attributes).length > 0 && (
                        Object.entries(figure.custom_attributes).map(([key, val]) => {
                            const groupDef = defGroups?.find(g => g.slug === key);
                            const label = groupDef ? groupDef.name : key;
                            return (
                                <TableRow key={key} label={label} value={val} />
                            )
                        })
                    )}
                </div>
            </div>

            </div> {/* Üst Kutu Sonu */}

            {/* 3- DEĞER VE TALEP MOTORU BLOĞU (MİNİMAL) */}
            <div className="w-full bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                <div className="flex gap-2 w-full">
                    {/* 1. Koleksiyon Değeri Kutusu */}
                    <div className="flex flex-col items-center justify-center bg-gray-50/50 px-2 py-2 rounded-lg border border-gray-100 flex-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] text-[#D22B2B] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1 w-full truncate">
                           <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> 
                           <span className="truncate">Kol. Değeri</span>
                        </span>
                        <span className="text-[12px] sm:text-[14px] font-black text-gray-900 tracking-tight truncate w-full text-center">
                            {figure.min_price && figure.max_price ? `$${figure.min_price} - $${figure.max_price}` : (figure.avg_price ? `$${figure.avg_price}` : 'Belirsiz')}
                        </span>
                    </div>

                    {/* 2. Değer Skoru Kutusu */}
                    <div className="flex flex-col items-center justify-center bg-yellow-50/50 px-2 py-2 rounded-lg border border-yellow-100 flex-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] text-yellow-600/80 font-bold uppercase tracking-widest mb-1 truncate w-full text-center">Değer Skoru</span>
                        <span className="text-[12px] sm:text-[14px] font-black text-yellow-700 truncate w-full text-center">
                            {figure.value_score === undefined || figure.value_score === null ? 'Yaygın' : 
                             figure.value_score >= 4.5 ? 'Efsane' : 
                             figure.value_score >= 3.5 ? 'Çok Değerli' : 
                             figure.value_score >= 2.5 ? 'Değerli' : 
                             figure.value_score >= 1.5 ? 'Orta' : 'Yaygın'}
                        </span>
                    </div>

                    {/* 3. Talep Sinyali Kutusu */}
                    <div className="flex flex-col items-center justify-center bg-blue-50/50 px-2 py-2 rounded-lg border border-blue-100 flex-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] text-blue-600/80 font-bold uppercase tracking-widest mb-1 truncate w-full text-center">Talep Sinyali</span>
                        <span className="text-[12px] sm:text-[14px] font-black text-blue-700 truncate w-full text-center">
                            {figure.demand_score === undefined || figure.demand_score === null ? 'Düşük Talep' :
                             figure.demand_score >= 4.0 ? 'Çok Yüksek' : 
                             figure.demand_score >= 3.0 ? 'Yüksek' : 
                             figure.demand_score >= 2.0 ? 'Orta' : 'Düşük'}
                        </span>
                    </div>
                </div>
                
                {/* İtalik olmayan minimal uyarı */}
                <div className="pt-3 border-t border-gray-50 flex items-start justify-center text-center xl:text-left xl:justify-start gap-1.5 text-[9px] sm:text-[10px] text-gray-500 font-medium tracking-wide">
                   <svg className="w-3.5 h-3.5 shrink-0 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   <span>Fiyatlar ve değerler zamanla değişebilir, yalnızca referans amaçlıdır. Ticaret tavsiyesi değildir.</span>
                </div>
            </div>


            <div className="w-full bg-white px-4 py-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-4">
                <div className="flex flex-col items-center flex-1 min-w-0 w-1/4 sm:w-auto">
                    <span className="text-green-700 font-bold text-[14px]">{rawFigure.total_views || 0}</span>
                    <span className="text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mt-1 text-center">T. Görüntüleme</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                <div className="flex flex-col items-center flex-1 min-w-0 w-1/4 sm:w-auto">
                    <span className="text-green-700 font-bold text-[14px]">{rawFigure.daily_views || 0}</span>
                    <span className="text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mt-1 text-center">G. Görüntüleme</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                <div className="flex flex-col items-center flex-1 min-w-0 w-1/4 sm:w-auto">
                    <span className="text-red-500 font-bold text-[14px]">
                       {(!figure.short_description_tr || figure.short_description_tr.trim() === '') ? 'Yok' : `${Math.max(1, Math.floor((figure.short_description_tr?.length || 0) / 250))} Dk`}
                    </span>
                    <span className="text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mt-1 text-center">Okuma</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                <div className="flex flex-col items-center flex-1 min-w-0 w-1/4 sm:w-auto">
                    <span className="text-gray-800 font-bold text-[14px]">0</span>
                    <span className="text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mt-1 text-center">Yorum</span>
                </div>
            </div>

        </div>

      </div>

      {/* 🧱 ORTA BLOK: Finans ve Piyasa Yönetimi */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full mt-12">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <AuthProtectedBlur>
                  <div className="flex flex-col gap-2 mb-10 text-center items-center justify-center">
                      <h3 className="text-2xl sm:text-3xl font-black text-[#111] tracking-tight">Finans ve Piyasa Radarı</h3>
                      <p className="text-gray-500 text-sm max-w-xl">Figürün küresel BrickLink borsasındaki geçmiş fiyat hareketlerini inceleyin ve yerel pazaryerlerinde anlık stok aratarak portföyünüze ucuza katın.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-4">
                      {/* Borsa Kutusu */}
                      <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
                              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                              <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Global Fiyat Grafiği (USD)</span>
                          </div>
                          <PriceChart history={historyData || []} />
                      </div>

                      {/* Affiliate Kutusu */}
                      <div className="flex flex-col gap-4 h-full min-h-[220px]">
                          <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
                             <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                             <span className="text-sm font-black text-gray-900 uppercase tracking-widest">TR Pazaryeri Sorgulama</span>
                          </div>
                          <div className="flex flex-col justify-center flex-1 w-full bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50">
                             <MultiMarketButton 
                                customLink={undefined} // rawFigure.affiliate_link left out of interface to keep clean, or can ignore
                                amazonUrl={amazonUrl} 
                                trendyolUrl={trendyolUrl} 
                                hepsiburadaUrl={hepsiburadaUrl} 
                             />
                             <p className="mt-4 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Komisyon linkleri geliştiriciye destek olmak içindir.</p>
                          </div>
                      </div>
                  </div>
              </AuthProtectedBlur>
          </div>
      </div>
      
      {/* 🧱 ALT BLOK: Topluluk & Yorumlar Aranası */}
      <div className="max-w-7xl mx-auto px-8 w-full">
         <FigureComments minifigureId={figure.id} />
      </div>

    </div>
  );
}
