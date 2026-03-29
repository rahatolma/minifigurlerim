import { supabase } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import FigureGallery from '@/components/ui/FigureGallery';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import ClientViewTracker from '@/components/ui/ClientViewTracker';

import { slugify } from '@/utils/helpers';

export const revalidate = 0; // Her zaman canlı data

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

export default async function FigureDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // UUID kontrolü yapıyoruz. Eski (ID bazlı) linkle mi gelindi yoksa yeni jenerasyon SEO Slug ile mi?
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const queryCol = isUUID ? 'id' : 'slug';

  // Figür verisini çek
  const { data: figure, error } = await supabase.from('minifigures').select('*, series(slug)').eq(queryCol, slug).single();
  if (error || !figure) return notFound();

  // Sistem tanım gruplarını çek
  const { data: defGroups } = await supabase.from('definition_groups').select('*');

  // Ana Görseller (JSON array)
  const images = (figure.images && Array.isArray(figure.images) && figure.images.length > 0) ? figure.images : [];
  
  return (
    <div className="bg-[#fcfcfc] min-h-screen w-full pb-32">
      <ClientViewTracker table="minifigures" id={figure.id} />
      {/* 🧱 ÜST BLOĞU: Şablon Breadcrumb (İz Yolu) */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap items-center text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ minHeight: '70px' }}>
             <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link> 
             <span className="mx-3 text-gray-200">/</span> 
             <Link href="/figurler" className="hover:text-black transition-colors">Figürler</Link> 
             <span className="mx-3 text-gray-200">/</span> 
             <span className="text-gray-900">{figure.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* 🧱 SOL KOLON: Veri ve Bilgi Şablonu (Yüzde 50) */}
        <div className="lg:col-span-6 flex flex-col items-start bg-white p-10 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            
            <div className="flex gap-2 items-center mb-6">
                {figure.series_name && (
                    <Link href={figure.series?.slug ? `/seriler/${figure.series.slug}` : `/seriler`} className="bg-red-50 text-[#D22B2B] hover:bg-[#D22B2B] hover:text-white transition-colors font-black uppercase tracking-widest text-[9px] px-3 py-1.5 rounded-sm">
                        {figure.series_name}
                    </Link>
                )}
                {figure.category && (
                    <Link href={`/seriler?category=${slugify(figure.category)}`} className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-black uppercase tracking-widest text-[9px] px-3 py-1.5 rounded-sm">
                        {figure.category}
                    </Link>
                )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-[#111] leading-[1.1] tracking-tight mb-8">
                {figure.name}
            </h1>

            {/* Açıklama Alanı (Sürekli Gösterim) */}
            <div className="text-gray-600 text-[15px] font-medium leading-relaxed mb-10 w-full min-h-[40px]">
                {figure.description || <span className="text-gray-400 italic">Figür açıklaması girilmemiş...</span>}
            </div>
            
            {/* 🧱 DİKEY ÖZELLİK LİSTESİ ŞABLONU (TABLE) */}
            <div className="w-full mb-8">
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

        {/* 🧱 SAĞ KOLON: Kutu İçi Galeri Şablonu (Yüzde 50) */}
        <div className="lg:col-span-6 flex flex-col gap-6 sticky z-40 pb-24" style={{ top: '152px' }}>
            
            {/* KPI 4'LÜ ALANI */}
            <div className="bg-white px-2 py-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex flex-col items-center flex-1">
                    <span className="text-green-700 font-bold text-[15px]">{figure.total_views || 0}</span>
                    <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest mt-1 text-center">T. Görüntüleme</span>
                </div>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-green-700 font-bold text-[15px]">{figure.daily_views || 0}</span>
                    <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest mt-1 text-center">G. Görüntüleme</span>
                </div>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-red-500 font-bold text-[15px]">{Math.max(1, Math.floor((figure.description?.length || 0) / 250))} Dk</span>
                    <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest mt-1 text-center">Okuma</span>
                </div>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-green-700 font-bold text-[15px]">0</span>
                    <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest mt-1 text-center">Yorum</span>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center gap-6 min-h-[600px]">
                <FigureGallery images={images} name={figure.name} />
            </div>
        </div>

      </div>
    </div>
  );
}
