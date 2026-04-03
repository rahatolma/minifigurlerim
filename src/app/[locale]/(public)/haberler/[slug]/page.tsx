import { supabase } from '@/utils/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RichTextContent from '@/components/ui/RichTextContent';
import { ChevronRight, Calendar, Eye, Clock, Share2 } from 'lucide-react';
import CommentsBlock from '@/components/ui/CommentsBlock';
import ClientViewTracker from '@/components/ui/ClientViewTracker'; // View tracker (we assume it exists from figures, or I will write a simple one inline)

// Bu sayfa dinamik slug'lara cevap vereceği için ISR/SSR karışımı
export const revalidate = 60; 

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !news) {
    notFound();
  }

  // Tarihi Türkçe formatla
  const formattedDate = new Date(news.created_at).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-24">
      {/* Sunucu bazlı view takip işlemi için Client bileşeni (Figürlerdeki gibi) */}
      <ClientViewTracker table="news" id={news.id} />

      {/* ŞABLON BREADCRUMB */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ height: '70px' }}>
             <div className="flex items-center">
                 <a href="/" className="hover:text-black transition-colors">Ana Sayfa</a> 
                 <span className="mx-3 text-gray-200">/</span> 
                 <Link href="/haberler" className="hover:text-black transition-colors">Haberler</Link>
                 <span className="mx-3 text-gray-200">/</span> 
                 <span className="text-gray-900 truncate max-w-[150px] sm:max-w-[300px]">{news.title}</span>
             </div>
        </div>
      </div>

      {/* HEADER / HERO ALANI */}
      <div className="w-full max-w-7xl mx-auto px-8 mt-16 mb-12">
        <div className="flex items-center gap-6 mb-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
           <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#D22B2B]" />
              {formattedDate}
           </div>
           <div className="w-1 h-1 rounded-full bg-gray-300"></div>
           <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#D22B2B]" />
              {news.min_read || 1} DK OKUMA
           </div>
           <div className="w-1 h-1 rounded-full bg-gray-300"></div>
           <div className="flex items-center gap-2">
              <Eye size={14} className="text-[#D22B2B]" />
              {news.total_views || 0} OKUNMA
           </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8">
          {news.title}
        </h1>

        {news.summary && (
          <p className="text-xl text-gray-600 font-medium leading-relaxed mb-10 border-l-4 border-[#D22B2B] pl-6">
            {news.summary}
          </p>
        )}
      </div>

      {/* KAPAK FOTOĞRAFI */}
      <div className="w-full max-w-7xl mx-auto px-8 mb-16">
         {news.cover_image_vertical_url && news.cover_image_url ? (
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
                <div className="w-full md:w-1/3 shrink-0">
                    <img src={news.cover_image_vertical_url} className="w-full h-full object-cover rounded-2xl shadow-lg border border-gray-100 aspect-square md:aspect-auto" alt={news.title + " Dikey"} />
                </div>
                <div className="w-full md:w-2/3">
                    <img src={news.cover_image_url} className="w-full h-full object-cover rounded-2xl shadow-lg border border-gray-100 aspect-[21/9] md:aspect-auto" alt={news.title + " Yatay"} />
                </div>
            </div>
         ) : news.cover_image_vertical_url ? (
            <img src={news.cover_image_vertical_url} className="w-full aspect-[4/5] object-cover rounded-2xl shadow-lg border border-gray-100 lg:w-1/3 md:w-1/2 mx-auto" alt={news.title + " Dikey"} />
         ) : news.cover_image_url ? (
           <img 
             src={news.cover_image_url} 
             alt={news.title} 
             className="w-full aspect-[21/9] object-cover rounded-2xl shadow-lg border border-gray-100" 
           />
         ) : (
           <div className="w-full aspect-[21/9] bg-gray-100 flex items-center justify-center rounded-2xl border border-gray-200">
             <span className="text-gray-400 font-bold tracking-widest uppercase">Görsel Yok</span>
           </div>
         )}
      </div>

      {/* HABER İÇERİĞİ (RICH TEXT) */}
      <div className="w-full max-w-7xl mx-auto px-8 mb-16">
        <RichTextContent html={news.content || ''} className="prose-lg prose-red text-gray-800 font-medium leading-loose" />
      </div>

      {/* YORUMLAR (Yeni Eklenen Özellik) */}
      <div className="bg-white border-t border-gray-100 mt-16 pt-8">
        <div className="max-w-7xl mx-auto px-8">
          <CommentsBlock entityType="news" entityId={news.id} />
        </div>
      </div>
    </div>
  );
}
