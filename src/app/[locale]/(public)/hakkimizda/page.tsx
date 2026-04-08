import Link from 'next/link';
import { getAboutSettings } from '@/services/dal';
import RichTextContent from '@/components/ui/RichTextContent';

export const revalidate = 86400; // Her zaman güncel veri

export const metadata = {
  title: 'Hakkımızda | Minifigürlerim',
  description: 'Minifigür sevgisine sahip herkesin buluştuğu bir topluluk merkezi.',
};

export default async function AboutPage() {
  const settings = await getAboutSettings();

  // Varsayılan değerler
  const bgImage = settings?.hero_image_url || '/uploads/hakkimizda-hero.jpg';
  const quote = settings?.quote_text || 'Peşinden gidecek cesaretiniz varsa bütün hayalleriniz gerçek olabilir.';
  const author = settings?.quote_author || 'Walt Disney';

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-32">
      
      {/* 🧱 ÜST BLOĞU: Şablon Breadcrumb (İz Yolu) */}
      <div className="hidden md:block border-b border-gray-200 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-8 flex items-center text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ minHeight: '70px' }}>
             <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link> 
             <span className="mx-3 text-gray-200">/</span> 
             <span className="text-gray-900">HAKKIMIZDA</span>
        </div>
      </div>

      {/* Hero Alanı */}
      <div className="w-full relative px-4 sm:px-8 max-w-7xl mx-auto mt-8">
        {/* Arka plan mozaik resmi */}
        <div className="relative w-full h-[400px] md:h-[600px] bg-gray-200 overflow-hidden rounded-xl">
            <img 
               src={bgImage}
               alt="Minifigür Mozaik" 
               className="w-full h-full object-cover"
            />
            {/* Fallback pattern eğer resim yoksa */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        </div>

        {/* Kırmızı Söz Kutusu */}
        <div className="relative mx-auto w-[90%] md:w-[80%] max-w-4xl bg-[#DA291C] text-white text-center py-10 md:py-16 px-6 md:px-12 -mt-16 md:-mt-24 shadow-lg rounded-2xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-2xl md:text-4xl font-black mb-4 leading-tight whitespace-pre-wrap">
                "{quote}"
            </h2>
            <p className="font-bold text-sm md:text-base tracking-widest text-white/90">
                {author}
            </p>
        </div>
      </div>

      {/* İçerik ve Büyük Patron Alanı */}
      <div className="max-w-7xl mx-auto px-8 mt-24">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
            
            {/* Sol Kart - Büyük Patron */}
            <div className="w-full lg:w-1/3 flex-shrink-0">
               <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300 w-full">
                  <div className="relative w-full h-[300px] lg:h-[400px] flex items-center justify-center border-b border-gray-50 flex-none overflow-hidden">
                      <img 
                          src={settings?.boss_image_url || '/uploads/buyuk-patron.jpg'}
                          alt={settings?.boss_title || "Büyük Patron"} 
                          className="w-full h-full object-cover"
                      />
                  </div>
                  <div className="px-6 py-6 text-center border-t border-gray-100 bg-white flex flex-col flex-1">
                      <h3 className="font-bold text-[18px] text-[#D22B2B] mb-2">{settings?.boss_title || 'Büyük Patron'}</h3>
                      <p className="font-bold text-[20px] text-gray-900 mb-5">{settings?.boss_subtitle || 'Ruh Hastası, Obsesif'}</p>
                      <div className="w-full h-px bg-gray-100 mb-5"></div>
                      <p className="flex flex-col items-center gap-1.5 text-[20px] font-bold text-gray-600">
                        {settings?.boss_desc || 'Baştan aşağı güzellik abidesi. Ne iş olsa yapar.'}
                      </p>
                  </div>
                </div>
            </div>

            {/* Sağ Metin - Hikaye */}
            <div className="w-full lg:w-2/3 min-w-0 overflow-hidden">
                <h2 className="text-3xl font-black text-black mb-[30px] text-left">
                    {settings?.main_title || '"Minik parçalarla büyük hayaller inşa edin!"'}
                </h2>
                
                <div className="text-gray-700 font-medium text-[15px] leading-relaxed">
                    {settings?.main_text ? (
                        <RichTextContent html={settings.main_text} />
                    ) : (
                        <>
                            <p>LEGO®, çocukluğumdan beri hayatımda önemli bir yer tutuyor...</p>
                        </>
                    )}
                </div>
            </div>

        </div>
      </div>

      {/* Alt 3'lü Grid */}
      <div className="max-w-7xl mx-auto px-8 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Ortanca Patron */}
             <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300 w-full">
                <div className="relative w-full h-[300px] lg:h-[400px] flex items-center justify-center border-b border-gray-50 flex-none overflow-hidden">
                    <img 
                        src={settings?.mid_image_url || '/uploads/ortanca-patron.jpg'}
                        alt={settings?.mid_title || "Ortanca Patron"} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="px-6 py-6 text-center border-t border-gray-100 bg-white flex flex-col flex-1">
                    <h3 className="font-bold text-[18px] text-[#D22B2B] mb-2">{settings?.mid_title || 'Ortanca Patron'}</h3>
                    <p className="font-bold text-[20px] text-gray-900 mb-5">{settings?.mid_subtitle || 'Rahat, Huzurlu, Mutlu'}</p>
                    <div className="w-full h-px bg-gray-100 mb-5"></div>
                    <p className="flex flex-col items-center gap-1.5 text-[20px] font-bold text-gray-600 leading-relaxed">
                      {settings?.mid_desc || 'İçerik üretir. Pratik zekası ve vizyonu ile yol gösterir.'}
                    </p>
                </div>
              </div>

            {/* Küçük Patron */}
             <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300 w-full">
                <div className="relative w-full h-[300px] lg:h-[400px] flex items-center justify-center border-b border-gray-50 flex-none overflow-hidden">
                    <img 
                        src={settings?.small_image_url || '/uploads/kucuk-patron.jpg'}
                        alt={settings?.small_title || "Küçük Patron"} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="px-6 py-6 text-center border-t border-gray-100 bg-white flex flex-col flex-1">
                    <h3 className="font-bold text-[18px] text-[#D22B2B] mb-2">{settings?.small_title || 'Küçük Patron'}</h3>
                    <p className="font-bold text-[20px] text-gray-900 mb-5">{settings?.small_subtitle || 'Cinyıs, Eğlenceli, Olgun'}</p>
                    <div className="w-full h-px bg-gray-100 mb-5"></div>
                    <p className="flex flex-col items-center gap-1.5 text-[20px] font-bold text-gray-600 leading-relaxed">
                      {settings?.small_desc || 'Oynar. Arada neden böyle yapmıyoruz diye sorgular.'}
                    </p>
                </div>
              </div>

            {/* Ekibimize Katılın */}
             <div className="flex flex-col h-full bg-[#DA291C] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300 text-white w-full border border-[#b81d11]">
                <div className="relative w-full h-[300px] lg:h-[400px] flex items-center justify-center border-b border-[#b81d11]/30 flex-none overflow-hidden">
                    <img 
                        src={settings?.join_image_url || '/uploads/ekibimize-katilin.jpg'}
                        alt={settings?.join_title || "Ekibimize Katılın"} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="px-6 py-6 text-center flex flex-col flex-1">
                    <h3 className="font-bold text-[18px] text-white mb-2">{settings?.join_title || 'Ekibimize Katılın'}</h3>
                    <div className="w-full h-px bg-white/20 mb-5 mt-2"></div>
                    <p className="flex flex-col items-center gap-1.5 text-[13px] font-bold text-white/90 leading-relaxed mb-6">
                      {settings?.join_text || 'Minifigür tutkusunu paylaşan dostlarla birlikte daha zengin ve keyifli içerikler üretmek istiyoruz. Hep birlikte büyüyelim!'}
                    </p>
                    <div className="mt-auto">
                        <Link href={settings?.join_btn_link || "/iletisim"} className="w-full block bg-black hover:bg-gray-800 text-white font-black text-[11px] py-4 rounded-md transition-colors uppercase tracking-widest shadow-md">
                            {settings?.join_btn_text || 'Formu Doldurunuz'}
                        </Link>
                    </div>
                </div>
              </div>

        </div>
      </div>

    </div>
  );
}
