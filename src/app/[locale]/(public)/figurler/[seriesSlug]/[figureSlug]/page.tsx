import { createClient } from '@/utils/supabase/server';
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

import { slugify } from '@/utils/helpers';
import { formatBrandText } from '@/utils/textFormatting';

export const revalidate = 0; // Her zaman canlı data

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
  const slug = resolvedParams.figureSlug;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const queryCol = isUUID ? 'id' : 'slug';
  
  const supabase = await createClient();
  const { data: figure } = await supabase.from('minifigures').select('name, description, images, series_name').eq(queryCol, slug).single();

  if (!figure) {
    return { title: 'Figür Bulunamadı | Minifigürlerim' };
  }

  const defaultImage = 'https://minifigurlerim.com/og-image.jpg';
  const figureImage = figure.images && figure.images.length > 0 ? (figure.images[0].url || defaultImage) : defaultImage;
  const desc = figure.description ? figure.description.substring(0, 150) + '...' : `${figure.name} detayları ve borsa geçmişi Minifigürlerim platformunda.`;

  // Dinamik OG Mimarisi
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://minifigurlerim.com';
  const ogUrl = new URL(`${baseUrl}/api/og/figure`);
  ogUrl.searchParams.set('title', figure.name || '');
  ogUrl.searchParams.set('series', figure.series_name || 'Gizemli Seri');
  ogUrl.searchParams.set('image', figureImage);

  return {
    title: `${figure.name} | LEGO Minifigür İncelemesi`,
    description: desc,
    openGraph: {
      title: `${figure.name} | Karakter Detayları`,
      description: desc,
      images: [
        {
           url: ogUrl.toString(),
           width: 1200,
           height: 630,
           alt: figure.name,
        }
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${figure.name} | LEGO Minifigürleri`,
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

  const supabase = await createClient();

  // Figür verisini çek
  const { data: figure, error } = await supabase.from('minifigures').select('*, series(slug)').eq(queryCol, slug).single();
  if (error || !figure) return notFound();

  // Sistem tanım gruplarını çek
  const { data: defGroups } = await supabase.from('definition_groups').select('*');

  // Kullanıcı ve Koleksiyon Durumları
  const { data: { user } } = await supabase.auth.getUser();
  let initialStatus = null;
  let initialRating = null;

  if (user) {
     const { data: cData } = await supabase.from('user_collections').select('status').eq('user_id', user.id).eq('minifigure_id', figure.id).single();
     if (cData) initialStatus = cData.status;

     const { data: rData } = await supabase.from('user_ratings').select('rating').eq('user_id', user.id).eq('minifigure_id', figure.id).single();
     if (rData) initialRating = rData.rating;
  }

  // Fiyat Geçmişi Datasını Çek
  const { data: historyData } = await supabase
     .from('minifigure_price_history')
     .select('*')
     .eq('minifigure_id', figure.id)
     .order('recorded_at', { ascending: true });

  // TR Pazar Arama Yönlendirme Kurgusu
  const EBAY_CAMP_ID = process.env.NEXT_PUBLIC_AMAZON_TR_TAG || 'minifigurlerim-21'; // Amazon Partner Kimliği
  const searchKeyword = encodeURIComponent(`Lego Minifigure ${figure.figure_no || figure.code || figure.name}`);
  const amazonUrl = `https://www.amazon.com.tr/s?k=${searchKeyword}&tag=${EBAY_CAMP_ID}`;
  const trendyolUrl = `https://www.trendyol.com/sr?q=${searchKeyword}`;
  const hepsiburadaUrl = `https://www.hepsiburada.com/ara?q=${searchKeyword}`;

  // Ana Görseller (JSON array)
  const images = (figure.images && Array.isArray(figure.images) && figure.images.length > 0) ? figure.images : [];
  
  // ÖNCEKİ VE SONRAKİ FİGÜR MANTIĞI (AYNI SERİ İÇİNDE)
  let prevFigure = null;
  let nextFigure = null;

  if (figure.series_id || figure.series_name) {
     const seriesFilterCol = figure.series_id ? 'series_id' : 'series_name';
     const seriesFilterVal = figure.series_id || figure.series_name;

     const { data: seriesFigures } = await supabase
       .from('minifigures')
       .select('id, name, slug, figure_no')
       .eq(seriesFilterCol, seriesFilterVal)
       .order('figure_no', { ascending: true }) // İlk tercih olarak figure numarasına göre
       .order('created_at', { ascending: true });

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
      {/* 🧱 ÜST BLOĞU: Şablon Breadcrumb (İz Yolu) */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap items-center text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ minHeight: '70px' }}>
             <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link> 
             <span className="mx-3 text-gray-200">/</span> 
             <Link href="/figurler" className="hover:text-black transition-colors">Figürler</Link> 
             <span className="mx-3 text-gray-200">/</span> 
             <span className="text-gray-900">{formatBrandText(figure.name)}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
        
        {/* 🧱 SOL KOLON: Detaylı Ansiklopedik Veriler */}
        <div className="lg:col-span-6 flex flex-col items-start bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            
            {/* Etiketler (Seri & Kategori) */}
            <div className="flex flex-wrap gap-2 items-center w-full mb-6">
                {figure.series_name && (
                    <Link href={figure.series?.slug ? `/seriler/${figure.series.slug}` : `/seriler`} className="bg-red-50 text-[#D22B2B] hover:bg-[#D22B2B] hover:text-white transition-colors font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-3.5 py-1.5 rounded-sm">
                        {figure.series_name}
                    </Link>
                )}
                {figure.category && (
                    <Link href={`/seriler?category=${slugify(figure.category)}`} className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-3.5 py-1.5 rounded-sm">
                        {figure.category}
                    </Link>
                )}
            </div>

            {/* Başlık */}
            <h1 className="text-3xl md:text-5xl lg:text-5xl font-black text-[#111] leading-[1.1] tracking-tight mb-8">
                {formatBrandText(figure.name)}
            </h1>

            {/* Açıklama Alanı */}
            <div className="text-gray-600 text-[15px] sm:text-[16px] font-medium leading-relaxed mb-10 w-full min-h-[40px]">
                {figure.description ? formatBrandText(figure.description) : <span className="text-gray-400 italic">Figür açıklaması girilmemiş...</span>}
            </div>
            
            {/* 🧱 DİKEY ÖZELLİK LİSTESİ ŞABLONU (TABLE) */}
            <div className="w-full">
                <div className="flex flex-col w-full border-t border-gray-900 mt-2">
                    <TableRow label="Marka" value={figure.brand} />
                    <TableRow label="Seri Adı" value={figure.series_name} />
                    <TableRow label="Seri No" value={figure.series_no} />
                    <TableRow label="Seri Kategori" value={figure.category} />
                    <TableRow label="Figür Adı" value={figure.name} />
                    <TableRow label="Figür Sıra No" value={figure.figure_no} />
                    <TableRow label="Figür Rolü" value={figure.role} />
                    <TableRow label="Figür Tipi" value={figure.type} />
                    <TableRow label="Figür Kodu" value={figure.code} />
                    <TableRow label="Parça Sayısı" value={figure.piece_count} />
                    <TableRow label="Değer (USD)" value={figure.value_usd} />
                    <TableRow label="Nadirlik Derecesi" value={figure.rarity} />
                    <TableRow label="Çıkış Tarihi Ay" value={figure.release_month} />
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

        </div>

        {/* 🧱 SAĞ KOLON: Görsel ve Hızlı Aksiyonlar */}
        <div className="lg:col-span-6 flex flex-col gap-6 sticky pb-6 z-40" style={{ top: '170px' }}>
            
            {/* 1- GÖRÜNTÜLENME KUTUSU */}
            <div className="w-full bg-white px-2 py-5 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
                <div className="flex flex-col items-center flex-1">
                    <span className="text-green-700 font-bold text-[16px]">{figure.total_views || 0}</span>
                    <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-black tracking-widest mt-1 text-center">T. Görüntüleme</span>
                </div>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-green-700 font-bold text-[16px]">{figure.daily_views || 0}</span>
                    <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-black tracking-widest mt-1 text-center">G. Görüntüleme</span>
                </div>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-red-500 font-bold text-[16px]">{Math.max(1, Math.floor((figure.description?.length || 0) / 250))} Dk</span>
                    <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-black tracking-widest mt-1 text-center">Okuma</span>
                </div>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-gray-800 font-bold text-[16px]">0</span>
                    <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-black tracking-widest mt-1 text-center">Yorum</span>
                </div>
            </div>

            {/* 2- ANA GÖRSEL KUTUSU */}
            <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center lg:min-h-[400px]">
                <FigureGallery images={images} name={figure.name} />
            </div>

            {/* 3- KOLEKSİYON VE PUANLAMA BUTONLARI */}
            <CollectionActions 
               minifigureId={figure.id} 
               isLoggedIn={!!user} 
               initialStatus={initialStatus} 
               initialRating={initialRating} 
            />

        </div>

      </div>

      {/* 🧱 ORTA BLOK: Finans ve Piyasa Yönetimi */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full mt-12">
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="relative group/blur">
                  <div className={`transition-all duration-300 ${!user ? 'pointer-events-none select-none' : ''}`}>
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
                            customLink={figure.affiliate_link} 
                            amazonUrl={amazonUrl} 
                            trendyolUrl={trendyolUrl} 
                            hepsiburadaUrl={hepsiburadaUrl} 
                         />
                         <p className="mt-4 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Komisyon linkleri geliştiriciye destek olmak içindir.</p>
                      </div>
                      </div>
                      </div>
                  </div>

                  {/* Blur Overlay - EXACTLY like cards */}
                  {!user && (
                      <Link href="/login" className="absolute inset-[-20px] bg-white/40 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-[2px] rounded-3xl overflow-hidden cursor-pointer group/overlay border border-gray-100/30">
                          <span className="text-[11px] font-black tracking-widest text-[#D22B2B] drop-shadow-[0_1px_1px_rgba(255,255,255,1)] text-center px-4 transition-all duration-300 opacity-0 translate-y-2 group-hover/overlay:opacity-100 group-hover/overlay:translate-y-0 absolute uppercase z-20">
                              Detayları görmek<br/>için erişim aç
                          </span>
                      </Link>
                  )}
              </div>
          </div>
      </div>
      
      {/* 🧱 ALT BLOK: Topluluk & Yorumlar Aranası */}
      <div className="max-w-7xl mx-auto px-8 w-full">
         <FigureComments minifigureId={figure.id} />
      </div>

    </div>
  );
}
