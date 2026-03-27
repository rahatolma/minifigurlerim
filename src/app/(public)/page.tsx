import SeriesCard from '@/components/ui/SeriesCard';
import FigureCard from '@/components/ui/FigureCard';
import { supabase } from '@/utils/supabase/client';

export const revalidate = 0; // Dinamik sayfa

export default async function Home() {
  
  // En son eklenen 3 Seri
  const { data: latestSeriesData } = await supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  // En son eklenen 3 Figür (3'lü yapıya uygun olması için)
  const { data: latestFiguresData } = await supabase
    .from('minifigures')
    .select('*, series(title)')
    .order('created_at', { ascending: false })
    .limit(3);

  const latestSeries = latestSeriesData || [];
  const latestFigures = latestFiguresData || [];

  return (
    <div className="w-full flex-col">
      {/* Hero Bağlantı / Kapak Alanı */}
      <section className="relative w-full bg-black text-white py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Placeholder arkaplan - daha sonra asıl görsel ile değişecek */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://via.placeholder.com/1920x800.png?text=Lego+Arkaplan')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <h1 className="text-yellow-400 text-5xl md:text-6xl font-black tracking-tight drop-shadow-md">Renkli dünyamıza hoş geldiniz!</h1>
          <p className="text-xl md:text-2xl font-medium tracking-wide drop-shadow-sm">Minifigür dünyasının kapılarını aralayın ve maceralarımıza katılın.</p>
          <div className="flex gap-4 justify-center mt-10">
            <button className="bg-[#D22B2B] text-white font-bold py-4 px-12 rounded-sm shadow-lg hover:bg-[#B22222] transition-colors uppercase tracking-widest text-sm">Seriler</button>
            <button className="bg-transparent border-2 border-white text-white font-bold py-4 px-12 rounded-sm shadow-lg hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-sm">Figürler</button>
          </div>
        </div>
      </section>

      {/* Mini İkonlu Banner Alanı */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 rounded-full bg-red-100 text-[#D22B2B] flex items-center justify-center text-3xl font-black">🌍</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Her Figür,</h4>
              <p className="text-gray-600 text-[14px] font-semibold">Kendi Dünyasını Anlatır!</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-16 bg-gray-200"></div>
          <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 rounded-full bg-red-100 text-[#D22B2B] flex items-center justify-center text-3xl font-black">🧩</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Küçük Figürler,</h4>
              <p className="text-gray-600 text-[14px] font-semibold">Sonsuz Hikayeler!</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-16 bg-gray-200"></div>
          <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 rounded-full bg-red-100 text-[#D22B2B] flex items-center justify-center text-3xl font-black">🦸</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Mini Kahramanlar,</h4>
              <p className="text-gray-600 text-[14px] font-semibold">Büyük Maceralar!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hakkımızda / Merhaba Alanı */}
      <section className="max-w-7xl mx-auto py-24 px-8 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-6">
          <h2 className="text-[40px] font-black leading-tight mb-8">Merhaba, Minifigürlerim<br/>Websitesine Hoş Geldiniz!</h2>
          <p className="text-gray-800 font-semibold leading-relaxed text-[15px]">2010'dan beri tutkuyla biriktirdiğim LEGO® minifigürleri artık bu platformda sizlerle buluşturuyorum. Kendi koleksiyonumdan özenle çekilmiş fotoğraflar, her figüre dair bilgiler ve minifigür dünyasına dair ilham veren içerikler burada yer alacak.</p>
          <p className="text-gray-800 font-semibold leading-relaxed text-[15px]">Minifigürlerim, sadece benim koleksiyonumun sergilendiği bir alan değil; aynı zamanda bu hobiye gönül verenlerin buluşma noktası. <strong className="text-black font-black">Koleksiyonerler, meraklılar ve yeni başlayanlar</strong> için keyifle vakit geçirilecek, bilgi alınacak ve paylaşım yapılacak bir merkez olmasını hedefliyorum.</p>
          <p className="text-gray-800 font-semibold leading-relaxed text-[15px]">Burada minifigür sevgisini paylaşacak, yepyeni hikâyeler keşfedecek ve bu hobiye dair ilham alacaksınız.</p>
          <div className="pt-8">
            <img src="/uploads/media__1774632782593.png" alt="Minifigür Hastası İmza" className="h-14 md:h-16 w-auto mix-blend-multiply opacity-90 -ml-2" />
          </div>
        </div>
        <div className="flex-1 w-full">
          {/* Mozaik Görseli */}
          <div className="w-full bg-white rounded-lg flex items-center justify-center">
             <img src="/uploads/media__1774631624379.png" alt="Lego Mosaic" className="w-full h-auto object-contain rounded-lg drop-shadow-sm" />
          </div>
        </div>
      </section>

      {/* Yeni Seriler Section */}
      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#D22B2B] rounded-full flex items-center justify-center text-white text-2xl shadow-md border-4 border-red-100">📦</div>
              <h2 className="text-4xl font-black">Yeni Seriler</h2>
            </div>
            <button className="bg-[#D22B2B] text-white font-bold py-3 px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-sm">Tüm Seriler</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestSeries.map(series => (
              <SeriesCard 
                key={series.id} 
                id={series.id}
                title={series.title}
                imageUrl={series.cover_image_url || 'https://via.placeholder.com/400x300.png?text=Görsel+Yok'}
                views={0}
                dailyViews={0}
                minRead={Math.max(1, Math.floor((series.description?.length || 0) / 250))}
                comments={0}
              />
            ))}
          </div>

          {latestSeries.length === 0 && (
            <p className="text-gray-400 font-bold text-center mt-8">Henüz sistemde hiç seri yok.</p>
          )}
        </div>
      </section>

      {/* Yeni Figürler Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white border-2 border-[#D22B2B] text-[#D22B2B] rounded-full flex items-center justify-center text-2xl shadow-sm">👤</div>
              <h2 className="text-4xl font-black">Yeni Figürler</h2>
            </div>
            <button className="bg-[#D22B2B] text-white font-bold py-3 px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-sm">Tüm Figürler</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestFigures.map(fig => (
              <FigureCard 
                key={fig.id} 
                id={fig.id}
                name={fig.name}
                seriesName={(fig as any).series?.title || 'Bilinmeyen Seri'}
                imageUrl={(fig.images && fig.images.length > 0) ? fig.images[0] : 'https://via.placeholder.com/300x400.png?text=Görsel+Yok'}
                views={0}
                dailyViews={0}
                minRead={0}
                comments={0}
              />
            ))}
          </div>

          {latestFigures.length === 0 && (
            <p className="text-gray-400 font-bold text-center mt-8">Henüz sistemde hiç figür yok.</p>
          )}
        </div>
      </section>
      
    </div>
  );
}
