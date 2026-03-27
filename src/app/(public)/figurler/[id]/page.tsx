import Link from 'next/link';
import FigureCard from '@/components/ui/FigureCard';

export default async function FigureDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const detail = {
    name: 'Deep Sea Diver',
    seriesName: 'LEGO® Minifigürler Serisi 1',
    imageUrl: 'https://via.placeholder.com/500x700.png?text=Deep+Sea+Diver',
    totalViews: 19,
    dailyViews: 1,
    description: 'Deep Sea Diver, okyanusun derinliklerine dalan cesur bir kaşiftir. Sualtının gizemli yaratıklarını inceler, kayıp hazinelerin peşine düşer. Karanlık sularda bile merakıyla yolunu bulur.',
    properties: [
      { label: 'Marka', value: 'LEGO®' },
      { label: 'Seri Adı', value: 'LEGO® Minifigürler Serisi 16' },
      { label: 'Seri No', value: '8683' },
      { label: 'Seri Kategori', value: 'Klasik' },
      { label: 'Figür Adı', value: 'Deep Sea Diver' },
      { label: 'Figür Sıra No', value: '16' },
      { label: 'Figür Rolü', value: 'Kaşif' },
      { label: 'Figür Tipi', value: 'Cesur / Meraklı' },
      { label: 'Figür Kodu', value: 'col01-16' },
      { label: 'Parça Sayısı', value: '6' },
      { label: 'Değer', value: '25 Usd' },
      { label: 'Nadirlik Derecesi', value: 'Yaygın' },
      { label: 'Çıkış Tarihi Ay', value: 'Aralık' },
      { label: 'Çıkış Tarihi Yıl', value: '2010' },
    ]
  };

  return (
    <div className="bg-white min-h-screen pb-20 w-full">
      {/* Breadcrumb Alanı */}
      <div className="w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4 text-[13px] font-bold flex flex-wrap gap-2 text-gray-800">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <span className="text-gray-400 font-normal">|</span>
          <Link href="/figurler" className="hover:text-red-600">LEGO® Minifigürleri</Link>
          <span className="text-gray-400 font-normal">|</span>
          <Link href="/seriler/1" className="hover:text-red-600">{detail.seriesName}</Link>
          <span className="text-gray-400 font-normal">|</span>
          <span className="text-[#D22B2B]">{detail.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-12 mb-20 flex flex-col md:flex-row gap-16 items-start">
        
        {/* Sol Kolon: Detaylar */}
        <div className="flex-1 w-full flex flex-col">
          <h1 className="text-[36px] font-black text-black leading-tight mb-4">{detail.name}</h1>
          <div className="text-[14px] font-bold text-green-700 flex flex-col gap-1 mb-4">
            <span>Total Views: {detail.totalViews}</span>
            <span>Daily Views: {detail.dailyViews}</span>
          </div>
          <p className="text-[#d8b52f] font-bold text-[14px] mb-8">Be the first to leave a review.</p>
          <div className="w-full h-px bg-gray-200 mb-8" />
          
          <p className="text-[15px] font-semibold text-gray-800 leading-relaxed mb-8">
            {detail.description}
          </p>

          {/* Özellikler Tablosu */}
          <div className="w-full max-w-lg mb-10">
            {detail.properties.map((prop, i) => (
              <div key={i} className="flex border-b border-gray-100 py-3 text-[14px]">
                <div className="w-1/2 font-bold text-gray-900">{prop.label}</div>
                <div className="w-1/2 font-bold text-[#D22B2B]">{prop.value}</div>
              </div>
            ))}
          </div>

          {/* Dinamik Renklere Sahip Sosyal Paylaşım Butonları */}
          <div className="flex gap-2">
            {[
              { id: 'fb', icon: 'f', bg: 'bg-[#3b5998]' },
              { id: 'tw', icon: '𝕏', bg: 'bg-black' },
              { id: 'in', icon: 'in', bg: 'bg-[#0077b5]' },
              { id: 'wa', icon: 'W', bg: 'bg-[#25D366]' },
              { id: 'pt', icon: 'P', bg: 'bg-[#bd081c]' },
              { id: 'em', icon: '✉', bg: 'bg-gray-800' },
              { id: 'sh', icon: '↑', bg: 'bg-gray-700' }
            ].map(btn => (
               <button key={btn.id} className={`w-9 h-9 rounded-sm ${btn.bg} text-white font-bold flex items-center justify-center text-[15px] shadow-sm hover:opacity-80 transition-opacity`}>
                 {btn.icon}
               </button>
            ))}
          </div>
        </div>

        {/* Sağ Kolon: Görsel */}
        <div className="flex-1 w-full max-w-lg mx-auto sticky top-8">
          <div className="w-full flex items-center justify-center p-8 bg-white border border-gray-50 rounded-2xl shadow-xl">
            <img src={detail.imageUrl} alt={detail.name} className="w-full h-auto object-contain mix-blend-multiply hover:scale-110 transition-transform duration-700 ease-in-out cursor-zoom-in" />
          </div>
        </div>
      </div>

      {/* Yorumlar Alanı Mavi Şerit */}
      <div className="w-full bg-[#1C57A5] text-white py-24 mt-20">
        <div className="max-w-7xl mx-auto px-8">
           <h2 className="text-[36px] font-black mb-8">Minifigür Yorumları</h2>
           <p className="font-semibold text-sm mb-4">There are no reviews yet.</p>
           <p className="font-semibold text-sm">Only logged in customers who have purchased this product may leave a review.</p>
        </div>
      </div>

      {/* İlgili Figürler */}
      <div className="max-w-7xl mx-auto px-8 py-24">
        <h2 className="text-3xl font-black text-center mb-16">İlgili Figürler</h2>
        
        {/* FigureCard ile Render Edilmiş Mock Bağlantılar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           <FigureCard id="2" name="Forestman" seriesName="LEGO® Minifigürler Serisi 1" imageUrl="https://via.placeholder.com/300x400.png?text=Forest+Man" views={12} dailyViews={1} minRead={0} comments={0} />
           <FigureCard id="3" name="Spaceman" seriesName="LEGO® Minifigürler Serisi 1" imageUrl="https://via.placeholder.com/300x400.png?text=Spaceman" views={5} dailyViews={0} minRead={0} comments={0} />
           <FigureCard id="4" name="Super Wrestler" seriesName="LEGO® Minifigürler Serisi 1" imageUrl="https://via.placeholder.com/300x400.png?text=Wrestler" views={43} dailyViews={2} minRead={0} comments={0} />
        </div>
      </div>

    </div>
  );
}
