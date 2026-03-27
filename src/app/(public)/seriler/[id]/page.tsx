import FigureCard from '@/components/ui/FigureCard';

export default async function SeriesDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Mock Detay (Supabase entegrasyonuna kadar UI testi için)
  const detail = {
    title: 'LEGO® Minifigürler Serisi Spider Man Across The Spider Verse',
    heroImage: 'https://via.placeholder.com/1920x600.png?text=Spider-Man+Hero+Image',
    brand: 'LEGO®',
    seriesNo: '71050',
    figureCount: 12,
    releaseDate: 'Eylül 2025',
    totalViews: 131,
    dailyViews: 1,
    description: `Spider-Man: Across the Spider-Verse Serisi, LEGO'nun Marvel animasyon evrenine 
yaptığı en sanatsal uyarlamalardan biridir. Bu koleksiyon, 2023 yapımı "Spider-Man: Across the Spider-Verse" filminin çoklu evren temasını temel alır. Her karakter, filmdeki benzersiz tasarım stiline ve paralel evren kimliğine sadık kalınarak üretilmiştir. LEGO bu seriyle sadece bir süper kahramanı değil, "herkesin bir Spider-Man olabileceği" fikrini kutlar.`,
  };

  return (
    <div className="bg-white min-h-screen pb-20 w-full">
      
      {/* Devasa Kapak Görseli ve Başlık */}
      <section className="relative w-full h-[600px] flex items-end justify-center pb-12 overflow-hidden bg-orange-500">
         {/* Arkaplan gradyanı ve hero image (şu an placeholder) */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-80" 
          style={{ backgroundImage: `url(${detail.heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-red-700 via-transparent to-transparent opacity-90" />
        
        <h1 className="relative z-10 text-4xl md:text-[44px] text-black font-black pb-4 text-center max-w-5xl px-4 drop-shadow-md">
          {detail.title}
        </h1>
      </section>

      {/* Info Bar (Marka / Seri No / Adet / Tarih) */}
      <div className="max-w-6xl mx-auto -mt-6 relative z-20 bg-[#f8f8f8] rounded-md shadow-md grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 border border-gray-200">
        <div className="p-6 md:p-8 flex items-center justify-center gap-4">
          <div className="bg-[#D22B2B] text-white p-2 rounded text-xs font-black">LEGO</div>
          <div>
            <p className="text-sm font-bold opacity-80">Marka</p>
            <p className="font-extrabold text-lg">{detail.brand}</p>
          </div>
        </div>
        <div className="p-6 md:p-8 flex items-center justify-center gap-4">
          <div className="text-gray-400">📝</div>
          <div>
            <p className="text-sm font-bold opacity-80">Seri No</p>
            <p className="font-extrabold text-lg">{detail.seriesNo}</p>
          </div>
        </div>
        <div className="p-6 md:p-8 flex items-center justify-center gap-4">
           <div className="text-gray-400">🔢</div>
          <div>
            <p className="text-sm font-bold opacity-80">Figür Adet</p>
            <p className="font-extrabold text-lg">{detail.figureCount}</p>
          </div>
        </div>
        <div className="p-6 md:p-8 flex items-center justify-center gap-4">
           <div className="text-gray-400">📅</div>
          <div>
            <p className="text-sm font-bold opacity-80">Çıkış Tarihi</p>
            <p className="font-extrabold text-lg">{detail.releaseDate}</p>
          </div>
        </div>
      </div>

      {/* Ana Metin ve İçerik */}
      <div className="max-w-4xl mx-auto px-8 mt-20 text-[15px] font-medium leading-relaxed space-y-8 text-black">
        <h2 className="text-[#D22B2B] text-3xl font-black mb-8">Birden Fazla Evren, Sonsuz Kahraman!</h2>
        <p>{detail.description}</p>
        
        <p className="font-bold">Öne Çıkan Figürler:</p>
        <p>Miles Morales, Gwen Stacy (Spider-Gwen), Spider-Man 2099 (Miguel O'Hara), Spider-Punk (Hobart Brown), Spider-Man India (Pavitr Prabhakar), The Spot, Peter B. Parker, Mayday Parker, Jessica Drew (Spider-Woman), Scarlet Spider (Ben Reilly).</p>
        
        <ul className="space-y-4 pt-4">
          <li><strong>Miles Morales,</strong> kırmızı-siyah kostümü ve enerjik duruşuyla serinin merkezinde yer alır.</li>
          <li><strong>Spider-Gwen,</strong> zarif kostüm detayları ve pastel renk geçişleriyle serinin estetik figürüdür.</li>
          <li><strong>Spider-Man 2099,</strong> kaslı gövdesi ve mavi tonlarıyla geleceğin karanlık evrenini temsil eder.</li>
          <li><strong>Spider-Punk,</strong> gitar aksesuarı ve asi tavrıyla koleksiyonun rock yıldızıdır.</li>
          <li><strong>The Spot,</strong> beyaz kostümü ve portal efekt baskılarıyla çoklu evrenin kaotik enerjisini taşır.</li>
          <li><strong>Mayday Parker,</strong> minifigür ölçeğinde bile şirinliğiyle serinin en sevimli detayıdır.</li>
        </ul>
      </div>

      {/* Görüntülenme Metrikleri */}
      <div className="max-w-4xl mx-auto px-8 mt-16 border-t border-gray-200 pt-16 grid grid-cols-2">
        <div className="border-r border-gray-200">
          <div className="text-[#D22B2B] text-5xl md:text-6xl font-black mb-2">{detail.totalViews}</div>
          <p className="font-bold text-green-700">Toplam Görüntülenme<br/>Sayısı</p>
        </div>
        <div className="pl-12">
           <div className="text-[#D22B2B] text-5xl md:text-6xl font-black mb-2">{detail.dailyViews}</div>
          <p className="font-bold text-green-700">Günlük Görüntülenme<br/>Sayısı</p>
        </div>
      </div>

      {/* Koleksiyoner Yorumu Blok */}
      <div className="max-w-6xl mx-auto px-8 mt-24 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="w-full aspect-square bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
             <img src="https://via.placeholder.com/600x600.png?text=Decor+Image" alt="Decor" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="md:w-2/3 space-y-6 text-[15px] font-medium leading-relaxed">
          <p><strong>Bizim için bu seri,</strong> LEGO'nun sanatı, aksiyonu ve duyguyu aynı koleksiyonda buluşturduğu dönemi temsil eder. Her karakter, farklı bir dünyadan gelse de aynı ideali paylaşır: cesaret, sorumluluk ve umut. LEGO bu seriyle "çoklukta birlik" fikrini minifigür diliyle anlatmıştır.</p>
          <p><strong>Kısacası:</strong> Spider-Man: Across the Spider-Verse Serisi, LEGO'nun çoklu evren anlatımındaki ustalığını gösteren yenilikçi bir koleksiyondur. Her figür, hem karakter gelişimi hem de görsel detay açısından bir sanat çalışması gibidir.</p>
          
          <div className="bg-[#1C57A5] text-white p-12 mt-8 rounded-md hover:bg-[#154483] transition-colors cursor-pointer text-center font-bold text-xl">
            Koleksiyoner Yorumu
          </div>
        </div>
      </div>

      {/* Serideki Figürler Bölümü */}
      <div className="max-w-7xl mx-auto px-8 mt-32">
        <h3 className="text-2xl font-bold mb-1">LEGO® Minifigürler Serisi</h3>
        <h2 className="text-[#D22B2B] font-black text-3xl mb-8">{detail.title.replace('LEGO® Minifigürler Serisi ', '')} Figürleri</h2>
        
        {/* Eğer Figür yoksa Placeholder, varsa FigureCard bileşenleri */}
        <div className="py-12">
            <h2 className="text-[40px] font-black text-black">Aradığınız Şey Bulunamadı...</h2>
            {/* Supabase bağlanınca burada bu seriye ait mock/gerçek figürleri mapleyeceğiz */}
        </div>
      </div>

    </div>
  );
}
