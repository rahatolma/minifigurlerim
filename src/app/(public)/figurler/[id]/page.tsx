import { supabase } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import FigureGallery from '@/components/ui/FigureGallery';

export const revalidate = 0; // Her zaman canlı data

// Satır Bileşeni (Görsel 2 dikey liste tasarımı)
const TableRow = ({ label, value }: { label: string, value: any }) => {
    if (!value || value === '') return null;
    return (
        <div className="flex border-b border-gray-100 py-3 text-[14px]">
            <div className="w-1/3 font-black text-black">{label}</div>
            <div className="w-2/3 text-[#D22B2B] font-medium">{value}</div>
        </div>
    );
}

export default async function FigureDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Figür verisini çek
  const { data: figure, error } = await supabase.from('minifigures').select('*').eq('id', id).single();
  if (error || !figure) return notFound();

  // Sistem tanım gruplarını çek (Custom attribute'ların labellarını eşleştirmek için)
  const { data: defGroups } = await supabase.from('definition_groups').select('*');

  // Ana Görseller (JSON array)
  const images = (figure.images && Array.isArray(figure.images) && figure.images.length > 0) ? figure.images : [];
  const primaryImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/600x800.png?text=Görsel+Yok';

  return (
    <div className="bg-white min-h-screen w-full pb-32">
      
      {/* Üst Navigasyon Bar (Breadcrumb - Görsel 2) */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center text-[13px] font-medium text-black tracking-wide">
             <Link href="/" className="hover:underline">Home</Link> <span className="mx-2">|</span> <Link href="/figurler" className="hover:underline">LEGO® Minifigürleri</Link> <span className="mx-2">|</span> {figure.series_id ? <Link href={`/seriler/${figure.series_id}`} className="hover:underline hover:text-[#002f6c]">{figure.series_name}</Link> : figure.series_name} <span className="mx-2">|</span> <span className="text-gray-500">{figure.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* SOL: Yazı Bloğu ve Veri Formu (Yüzde 50) */}
        <div className="lg:col-span-6 flex flex-col items-start pt-2">
            
            <h1 className="text-4xl md:text-[42px] font-black text-black leading-none tracking-tight mb-6">
                {figure.name}
            </h1>
            
            <div className="flex flex-col gap-1 mb-6">
                <p className="font-bold text-[#20803c] text-[14px]">Total Views: {figure.total_views}</p>
                <p className="font-bold text-[#20803c] text-[14px]">Daily Views: {figure.daily_views}</p>
            </div>
            
            <p className="text-[#e2b512] font-semibold text-[14px] mb-8">Be the first to leave a review.</p>

            {/* Açıklama Alanı */}
            {figure.description && (
                <div className="text-black text-[15px] font-medium leading-relaxed mb-8 pb-4 w-full">
                    {figure.description}
                </div>
            )}

            {/* DİKEY ÖZELLİK LİSTESİ */}
            <div className="flex flex-col border-t border-gray-100 w-full mt-2">
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
                <TableRow label="Değer" value={figure.value_usd ? `${figure.value_usd} Usd` : null} />
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

        {/* SAĞ: Görsel (Yüzde 50) */}
        <FigureGallery images={images} name={figure.name} />

      </div>
    </div>
  );
}
