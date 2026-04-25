import { Link } from '@/i18n/routing';
import { getAboutSettings } from '@/services/dal';
import RichTextContent from '@/components/ui/RichTextContent';
import { getTranslations } from 'next-intl/server';

export const revalidate = 60; // 1 dakika ISR cache

export const metadata = {
  title: 'Hakkımızda | Minifigürlerim',
  description: 'Minifigür sevgisine sahip herkesin buluştuğu bir topluluk merkezi.',
};

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: 'AboutPage' });
  const settings = await getAboutSettings();
  
  const finalSelectedValues = {
    boss_image_url: settings?.boss_image_url || '/images/placeholder.svg',
    hero_image_url: settings?.hero_image_url || '/images/placeholder.svg',
    main_text: settings?.main_text ? settings.main_text.substring(0, 30) + '...' : null
  };

  console.log("🔥 TRACE 3 - PUBLIC PAGE QUERY & RENDER:", {
    locale: resolvedParams?.locale,
    hamDbSonucu: {
      boss_image_url: settings?.boss_image_url,
      hero_image_url: settings?.hero_image_url,
      main_text: settings?.main_text ? settings.main_text.substring(0, 30) + '...' : null
    },
    finalRenderGidecekDegerler: finalSelectedValues
  });

  // Varsayılan değerler
  const bgImage = settings?.hero_image_url || '/images/placeholder.svg';
  
  // Helper for bilingual fields
  const getField = (baseField: string, fallbackKey: string) => {
    if (locale === 'en' && settings?.[`${baseField}_en`]) {
      return settings[`${baseField}_en`];
    }
    return settings?.[baseField] || t(fallbackKey);
  };

  const quote = getField('quote_text', 'Quote');
  const author = getField('quote_author', 'Author');

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16">
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
                          src={settings?.boss_image_url || '/images/placeholder.svg'}
                          alt={settings?.boss_title || "Büyük Patron"} 
                          className="w-full h-full object-cover"
                      />
                  </div>
                  <div className="px-6 py-6 text-center border-t border-gray-100 bg-white flex flex-col flex-1">
                      <h3 className="font-bold text-[18px] text-[#D22B2B] mb-2">{getField('boss_title', 'BossTitle')}</h3>
                      <p className="font-bold text-[20px] text-gray-900 mb-5">{getField('boss_subtitle', 'BossSubtitle')}</p>
                      <div className="w-full h-px bg-gray-100 mb-5"></div>
                      <p className="flex flex-col items-center gap-1.5 text-[20px] font-bold text-gray-600">
                        {getField('boss_desc', 'BossDesc')}
                      </p>
                  </div>
                </div>
            </div>

            {/* Sağ Metin - Hikaye */}
            <div className="w-full lg:w-2/3 min-w-0 overflow-hidden">
                <h2 className="text-3xl font-black text-black mb-[30px] text-left">
                    {getField('main_title', 'MainTitle')}
                </h2>
                
                <div className="text-gray-700 font-medium text-[15px] leading-relaxed">
                    {locale === 'en' && settings?.main_text_en ? (
                        <RichTextContent html={settings.main_text_en} />
                    ) : settings?.main_text ? (
                        <RichTextContent html={settings.main_text} />
                    ) : (
                        <RichTextContent html={t.raw('MainDesc')} />
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
                        src={settings?.mid_image_url || '/images/placeholder.svg'}
                        alt={settings?.mid_title || "Ortanca Patron"} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="px-6 py-6 text-center border-t border-gray-100 bg-white flex flex-col flex-1">
                    <h3 className="font-bold text-[18px] text-[#D22B2B] mb-2">{getField('mid_title', 'MidTitle')}</h3>
                    <p className="font-bold text-[20px] text-gray-900 mb-5">{getField('mid_subtitle', 'MidSubtitle')}</p>
                    <div className="w-full h-px bg-gray-100 mb-5"></div>
                    <p className="flex flex-col items-center gap-1.5 text-[20px] font-bold text-gray-600 leading-relaxed">
                      {getField('mid_desc', 'MidDesc')}
                    </p>
                </div>
              </div>

            {/* Küçük Patron */}
             <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300 w-full">
                <div className="relative w-full h-[300px] lg:h-[400px] flex items-center justify-center border-b border-gray-50 flex-none overflow-hidden">
                    <img 
                        src={settings?.small_image_url || '/images/placeholder.svg'}
                        alt={settings?.small_title || "Küçük Patron"} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="px-6 py-6 text-center border-t border-gray-100 bg-white flex flex-col flex-1">
                    <h3 className="font-bold text-[18px] text-[#D22B2B] mb-2">{getField('small_title', 'SmallTitle')}</h3>
                    <p className="font-bold text-[20px] text-gray-900 mb-5">{getField('small_subtitle', 'SmallSubtitle')}</p>
                    <div className="w-full h-px bg-gray-100 mb-5"></div>
                    <p className="flex flex-col items-center gap-1.5 text-[20px] font-bold text-gray-600 leading-relaxed">
                      {getField('small_desc', 'SmallDesc')}
                    </p>
                </div>
              </div>

            {/* Ekibimize Katılın */}
             <div className="flex flex-col h-full bg-[#DA291C] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300 text-white w-full border border-[#b81d11]">
                <div className="relative w-full h-[300px] lg:h-[400px] flex items-center justify-center border-b border-[#b81d11]/30 flex-none overflow-hidden">
                    <img 
                        src={settings?.join_image_url || '/images/placeholder.svg'}
                        alt={settings?.join_title || "Ekibimize Katılın"} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="px-6 py-6 text-center flex flex-col flex-1">
                    <h3 className="font-bold text-[18px] text-white mb-2">{getField('join_title', 'JoinTitle')}</h3>
                    <div className="w-full h-px bg-white/20 mb-5 mt-2"></div>
                    <p className="flex flex-col items-center gap-1.5 text-[13px] font-bold text-white/90 leading-relaxed mb-6">
                      {getField('join_text', 'JoinDesc')}
                    </p>
                    <div className="mt-auto">
                        <Link href={getField('join_btn_link', '/iletisim') as any} className="w-full block bg-black hover:bg-gray-800 text-white font-black text-[11px] py-4 rounded-md transition-colors uppercase tracking-widest shadow-md">
                            {getField('join_btn_text', 'JoinBtn')}
                        </Link>
                    </div>
                </div>
              </div>

        </div>
      </div>

    </div>
  );
}
