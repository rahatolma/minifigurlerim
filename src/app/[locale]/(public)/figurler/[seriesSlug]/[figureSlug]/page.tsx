import { getMinifigureBySlug, getDefinitions, getFiguresBySeries } from '@/services/dal';
import { getSimilarFiguresDal, getFigureRatings } from '@/services/action_dal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import FigureGallery from '@/components/ui/FigureGallery';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import ClientViewTracker from '@/components/ui/ClientViewTracker';
import CollectionActions from '@/components/ui/CollectionActions';
import CollectorPodium from '@/components/ui/CollectorPodium';
import SimilarFigures from '@/components/ui/SimilarFigures';
import MultiMarketButton from '@/components/ui/MultiMarketButton';
import FloatingFigureNav from '@/components/ui/FloatingFigureNav';

import { slugify } from '@/utils/helpers';
import { formatBrandText } from '@/utils/textFormatting';
import { mapFigureForDetail } from '@/utils/figureMapper';

export const revalidate = 300; // 5 dakikalık ISR window

import { Metadata, ResolvingMetadata } from 'next';

// 🧱 LİSTE BLOĞU: Ansiklopedik temiz veri satırı
const TableRow = ({ label, value }: { label: string, value: any }) => {
    if (!value || value === '' || value === '-' || value === 'Seçim Yapılmadı' || value === 'Belirsiz') {
        return null;
    }
    return (
        <div className="flex justify-between items-center border-b border-gray-100 py-4 sm:py-5 text-[14px]">
            <div className="w-[40%] font-black text-gray-500 uppercase tracking-widest text-[10px] shrink-0 pr-4">{label}</div>
            <div className="w-[60%] font-bold text-gray-900 text-right break-words">{value}</div>
        </div>
    );
}

// SEO Metadata Olusturucu
export async function generateMetadata(
  { params }: { params: Promise<{ seriesSlug: string, figureSlug: string, locale: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const rawFigure = await getMinifigureBySlug(resolvedParams.figureSlug, locale, resolvedParams.seriesSlug);

  if (!rawFigure) {
    return { title: 'Minifigür Bulunamadı | Minifigürlerim' };
  }
  const figure = mapFigureForDetail(rawFigure);
  if (!figure) {
    return { title: 'Minifigür Bozuk | Minifigürlerim' };
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
  params: Promise<{ seriesSlug: string, figureSlug: string, locale: string }>
}) {
  const resolvedParams = await params;
  const { figureSlug: slug, seriesSlug, locale } = resolvedParams;

  // UUID kontrolü yapıyoruz. Eski (ID bazlı) linkle mi gelindi yoksa yeni jenerasyon SEO Slug ile mi?
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const queryCol = isUUID ? 'id' : 'slug';

  // Figür verisini çek
  const rawFigure = await getMinifigureBySlug(resolvedParams.figureSlug, locale, resolvedParams.seriesSlug);
  if (!rawFigure) return notFound();
  
  const figure = mapFigureForDetail(rawFigure);
  if (!figure) return notFound();

  // Sistem tanım gruplarını çek
  const defGroups = await getDefinitions();

  // YENİ: Auth & Gamification işlemleri artık bütünüyle Dynamic Island yaklaşımı ile
  // Client-Side Context'lerden çekiliyor (AuthProvider, GamificationProvider).
  // SSG/ISR caching'i engellememesi için SSR'dan silindi.

  // Data Fetching for New Bottom Sections
  const [similarFigures, ratings] = await Promise.all([
     getSimilarFiguresDal(rawFigure.series_id, figure.id, 4),
     getFigureRatings(figure.id)
  ]);

  // TR Pazar Arama Yönlendirme Kurgusu
  const EBAY_CAMP_ID = process.env.NEXT_PUBLIC_AMAZON_TR_TAG || 'minifigurlerim-21'; // Amazon Partner Kimliği
  const searchKeyword = encodeURIComponent(`Lego Minifigure ${figure.figure_number || figure.figure_code || figure.figure_name}`);
  const amazonUrl = `https://www.amazon.com.tr/s?k=${searchKeyword}&tag=${EBAY_CAMP_ID}`;
  const trendyolUrl = `https://www.trendyol.com/sr?q=${searchKeyword}`;
  const hepsiburadaUrl = `https://www.hepsiburada.com/ara?q=${searchKeyword}`;

  // 30 Günlük Momentum Hesaplaması (Market Sinyali İçin)
  const views30d = rawFigure.view_count_30d || 0;
  const col30d = rawFigure.collection_count_30d || 0;
  const fav30d = rawFigure.favorite_count_30d || 0;
  
  // Etkileşim Ağırlığı: Koleksiyon(3x) + İstek(2x) + Görüntüleme(1x)
  const momentumScore = (col30d * 3) + (fav30d * 2) + views30d;
  
  let demandSignal = 'Düşük';
  let demandSubtext = 'Koleksiyoner ilgisi şu an düşük seviyede.';
  
  if (momentumScore > 100 || (rawFigure.demand_score || 0) > 80) {
      demandSignal = 'Güçlü (Sıcak)';
      demandSubtext = 'Koleksiyonerlerin yoğun ilgi gösterdiği, sıcak bir parça.';
  } else if (momentumScore > 30 || (rawFigure.demand_score || 0) > 50) {
      demandSignal = 'Yükseliyor';
      demandSubtext = 'Bu minifigüre olan piyasa talebinde net bir hareketlenme var.';
  } else if (momentumScore > 5) {
      demandSignal = 'Stabil';
      demandSubtext = 'Piyasa ilgisi dengeli ve olağan seviyelerde seyrediyor.';
  } else if (momentumScore === 0) {
      demandSignal = 'Veri Bekleniyor';
      demandSubtext = 'Bu minifigürde henüz güçlü bir piyasa hareketi oluşmadı.';
  }
  
  // Ana Görseller
  const images = figure.image_url ? [figure.image_url] : [];
  
  // ÖNCEKİ VE SONRAKİ FİGÜR MANTIĞI (AYNI SERİ İÇİNDE)
  let prevFigure = null;
  let nextFigure = null;

  if (figure.series_id || figure.series_name) {
     const seriesFigures = await getFiguresBySeries(figure.series_id || figure.series_name, !!figure.series_id);

      if (seriesFigures && seriesFigures.length > 0) {
        // Find current figure index
        const currentIndex = seriesFigures.findIndex((f: any) => f.id === figure.id);
        
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
    <div className="bg-[#fcfcfc] min-h-screen w-full pb-16">
      <FloatingFigureNav prev={prevFigure} next={nextFigure} />
      <ClientViewTracker table="minifigures" id={figure.id} />


      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
        
                {/* 🧱 SOL KOLON: Görsel ve Hızlı Aksiyonlar */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6 sticky pb-6 z-40" style={{ top: '100px' }}>
            
            {/* 1- ANA GÖRSEL KUTUSU */}
            <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center lg:min-h-[360px]">
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
            <div className="flex flex-wrap gap-2 items-start w-full mb-6">
                {figure.series_name && (
                    <Link href={figure.series_slug_tr ? `/seriler/${figure.series_slug_tr}` : `/seriler`} className="bg-red-50 text-[#D22B2B] hover:bg-[#D22B2B] hover:text-white transition-colors font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-3.5 py-1.5 rounded-sm flex flex-col items-start text-left">
                        <span>LEGO® Minifigürler Serisi</span>
                        <span className="mt-0.5">
                            {figure.series_name.replace(/LEGO®?/i, '').replace(/Minifigürler/i, '').replace(/Serisi/i, '').trim()}
                        </span>
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
                {figure.short_description_tr ? formatBrandText(figure.short_description_tr) : <span className="text-gray-400 opacity-60">Minifigür açıklaması girilmemiş...</span>}
            </div>

            {/* 🧱 DİKEY ÖZELLİK LİSTESİ ŞABLONU (TABLE) */}
            <div className="w-full">
                <div className="flex flex-col w-full border-t border-gray-900 mt-2">
                    <TableRow label="Marka" value="LEGO®" />
                    <TableRow label="Seri Adı" value={
                        figure.series_name ? (
                            <div className="flex flex-col text-right items-end">
                                <span className="text-gray-900">LEGO® Minifigürler Serisi</span>
                                <span className="text-gray-600 block mt-1">
                                    {figure.series_name.replace(/LEGO®?/i, '').replace(/Minifigürler/i, '').replace(/Serisi/i, '').trim() || '-'}
                                </span>
                            </div>
                        ) : '-'
                    } />
                    <TableRow label="Seri No" value={figure.series_number} />
                    <TableRow label="Seri Kategori" value={figure.category_main} />
                    <TableRow label="Minifigür Adı" value={figure.figure_name} />
                    <TableRow label="Minifigür Sıra No" value={figure.figure_number} />
                    <TableRow label="Minifigür Rolü" value={figure.figure_role} />
                    <TableRow label="Minifigür Tipi" value={figure.figure_type} />
                    <TableRow label="Minifigür Kodu" value={figure.figure_code} />
                    <TableRow label="Parça Sayısı" value={figure.piece_count} />

                    <TableRow label="Çıkış Tarihi Ay" value={figure.release_month_tr} />
                    <TableRow label="Çıkış Tarihi Yıl" value={figure.release_year} />
                    
                    {/* DİNAMİK JSON Özel Detaylar */}
                    {figure.custom_attributes && Object.keys(figure.custom_attributes).length > 0 && (
                        Object.entries(figure.custom_attributes)
                        .filter(([key]) => !['nadirlik-derecesi', 'figur-rolu', 'figur-tipi'].includes(key))
                        .map(([key, val]) => {
                            const groupDef = defGroups?.find((g: any) => g.slug === key);
                            const label = groupDef ? groupDef.name : key;
                            return (
                                <TableRow key={key} label={label} value={val as string} />
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
                        <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 tracking-tight leading-tight w-full text-center">
                            Yeterli veri<br/>oluşuyor
                        </span>
                    </div>

                    {/* 2. Değer Skoru Kutusu */}
                    <div className="flex flex-col items-center justify-center bg-yellow-50/50 px-2 py-2 rounded-lg border border-yellow-100 flex-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] text-yellow-600/80 font-bold uppercase tracking-widest mb-1 truncate w-full text-center">Değer Skoru</span>
                        <span className="text-[12px] sm:text-[14px] font-black text-yellow-700 truncate w-full text-center">
                            {figure.rarity_level || 'Yaygın'}
                        </span>
                    </div>

                    {/* 3. Talep Sinyali Kutusu */}
                    <div className="flex flex-col items-center justify-center bg-blue-50/50 px-2 py-2 rounded-lg border border-blue-100 flex-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] text-blue-600/80 font-bold uppercase tracking-widest mb-1 truncate w-full text-center">Talep Sinyali</span>
                        <span className="text-[12px] sm:text-[14px] font-black text-blue-700 truncate w-full text-center">
                            Düşük
                        </span>
                    </div>
                </div>
                

            </div>


            {/* 4- İLGİ VE AKTİVİTE BLOĞU */}
            <div className="w-full bg-white px-4 py-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col mt-2">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-4 mb-4 px-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 7 10c0-2 .5-4 2.5-5 1.5 2 2.5 3 2.5 5 0 1 .5 2 1.5 2s1.5-1 1.5-2c0-1.5 1-2.5 1.5-3 1.5 1.5 2 4 2 6z"></path></svg>
                    <h3 className="font-black text-gray-900 tracking-tight text-[13px] uppercase">İlgi & Aktivite</h3>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-4 px-2 pb-2">
                    {/* Görüntülenme */}
                    <div className="flex flex-col items-center flex-1 min-w-0 w-1/4 sm:w-auto">
                        <span className="text-gray-900 font-black text-[18px]">{rawFigure.total_views || 0}</span>
                        <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mt-1 text-center flex items-center justify-center gap-1.5 w-full">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> 
                            Görüntülenme
                        </span>
                    </div>
                    
                    <div className="hidden sm:block w-px h-8 bg-gray-100"></div>
                    
                    {/* Koleksiyona Ekleyen */}
                    <div className="flex flex-col items-center flex-1 min-w-0 w-1/4 sm:w-auto">
                        <span className="text-gray-900 font-black text-[18px]">{rawFigure.collection_count_30d || 0}</span>
                        <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mt-1 text-center flex items-center justify-center gap-1.5 w-full">
                            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg> 
                            Koleksiyonda
                        </span>
                    </div>

                    <div className="hidden sm:block w-px h-8 bg-gray-100"></div>

                    {/* Takip Eden */}
                    <div className="flex flex-col items-center flex-1 min-w-0 w-1/4 sm:w-auto">
                        <span className="text-gray-900 font-black text-[18px]">{rawFigure.favorite_count_30d || 0}</span>
                        <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mt-1 text-center flex items-center justify-center gap-1.5 w-full">
                            <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg> 
                            Takipte
                        </span>
                    </div>

                    <div className="hidden sm:block w-px h-8 bg-gray-100"></div>

                    {/* Etkileşim Oranı */}
                    <div className="flex flex-col items-center justify-center flex-1 min-w-0 w-1/4 sm:w-auto h-full min-h-[44px]">
                        {(rawFigure.total_views || 0) < 25 ? (
                            <>
                                <span className="text-gray-400 font-bold text-[10px] sm:text-[11px] text-center leading-tight">Yeterli Veri<br/>Oluşuyor</span>
                                <span className="text-gray-300 text-[8px] uppercase font-black tracking-widest mt-1 text-center flex items-center justify-center gap-1.5 w-full">
                                    <svg className="w-2.5 h-2.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> 
                                    Etkileşim
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-blue-600 font-black text-[18px]">
                                    %{Math.round((((rawFigure.collection_count_30d || 0) + (rawFigure.favorite_count_30d || 0)) / rawFigure.total_views) * 100)}
                                </span>
                                <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mt-1 text-center flex items-center justify-center gap-1.5 w-full">
                                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> 
                                    Etkileşim
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>

      </div>

      {/* 🧱 1. PİYASA & FIRSAT BLOĞU */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full mt-12">
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col gap-1 mb-8">
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">Piyasa & Fırsat</h3>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">Bu minifigürün piyasa sinyallerini inceleyin ve Türkiye’deki fırsatları keşfedin.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                  {/* Sol Kolon: Global Piyasa Görünümü */}
                  <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                          <span className="text-[11px] sm:text-[13px] font-black text-gray-900 uppercase tracking-widest">Global Piyasa Görünümü</span>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-gray-50/50 rounded-xl p-6 sm:p-8 border border-gray-100/50 flex-1 min-h-[220px]">
                          <span className="text-gray-400 font-black text-[10px] sm:text-xs uppercase tracking-widest mb-3">Piyasa Sinyali</span>
                          <span className={`font-black text-[13px] sm:text-sm uppercase tracking-widest px-4 py-2 rounded-xl border shadow-sm ${
                              demandSignal === 'Güçlü (Sıcak)' ? 'bg-red-50 text-[#D22B2B] border-red-100' : 
                              demandSignal === 'Yükseliyor' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                              demandSignal === 'Stabil' ? 'bg-green-50 text-green-700 border-green-100' : 
                              'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                              {demandSignal}
                          </span>
                          <p className="mt-5 text-center text-[11px] sm:text-xs text-gray-500 font-medium leading-relaxed max-w-[250px]">
                              {demandSubtext}
                          </p>
                      </div>
                  </div>

                  {/* Sağ Kolon: Türkiye'de Ara */}
                  <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-100">
                         <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                         <span className="text-[11px] sm:text-[13px] font-black text-gray-900 uppercase tracking-widest">Türkiye'de Ara</span>
                      </div>
                      <div className="flex flex-col justify-center flex-1 w-full bg-gray-50/50 rounded-xl p-6 sm:p-8 border border-gray-100/50 min-h-[220px]">
                         <MultiMarketButton 
                            customLink={undefined}
                            amazonUrl={amazonUrl} 
                            trendyolUrl={trendyolUrl} 
                            hepsiburadaUrl={hepsiburadaUrl} 
                         />
                         <p className="mt-6 text-center text-[9px] sm:text-[10px] text-gray-400 font-bold tracking-wide">
                            Bu bağlantılar üzerinden yapılan alışverişler platforma destek sağlar.
                         </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      {/* 🧱 2. KOLEKSİYONER PODIUMU BLOĞU */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full mt-12">
         <CollectorPodium ratings={ratings || []} />
      </div>

      {/* 🧱 3. BENZER FİGÜRLER BLOĞU (CAROUSEL LAYOUT) */}
      <SimilarFigures figures={similarFigures || []} locale={locale} />

    </div>
  );
}
