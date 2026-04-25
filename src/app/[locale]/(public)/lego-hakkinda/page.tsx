import { Metadata } from 'next';
import { Link } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'LEGO® Hakkında | Minifigürlerim',
  description: 'LEGO markasının dünden bugüne unutulmaz tarihi ve kilometre taşları.',
};



import { getTranslations } from 'next-intl/server';

export default async function LegoHakkindaPage() {
  const t = await getTranslations('LegoAboutPage');
  const tTimeline = await getTranslations('LegoAboutPage.Timeline');
  const timelineCount = 15;

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16">
      


      {/* Hero Header */}
      <div className="w-full relative px-4 sm:px-8 max-w-7xl mx-auto mt-8">
        <div className="relative w-full h-[350px] md:h-[450px] bg-[#0a0a0a] overflow-hidden rounded-3xl shadow-2xl flex items-center justify-center text-center px-6 group">
            <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0"></div>
            
            <div className="relative z-10">
                <div className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-bold text-xs tracking-[0.2em] text-white uppercase shadow-sm">
                   {t('Badge')}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: t.raw('Title') }}>
                </h1>
                <p className="text-gray-300 font-medium text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4 md:px-0 opacity-90">
                   {t('Desc')}
                </p>
            </div>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 mt-24 relative">
        
        {/* Ortadan İnen Kırmızı-Glow Çizgi (Sadece Desktop) */}
        <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-1.5 bg-gradient-to-b from-[#D22B2B] via-red-600 to-[#D22B2B] transform -translate-x-1/2 rounded-full shadow-[0_0_15px_rgba(210,43,43,0.5)] z-0"></div>

        <div className="space-y-12 lg:space-y-20 relative z-10 w-full">
            {Array.from({ length: timelineCount }).map((_, index) => {
                const isEven = index % 2 === 0; // True = Sol taraf
                const colorClass = index % 2 !== 0 ? 'bg-[#D22B2B]' : 'bg-black'; // Assuming alternating colors matching old TIMELINE_EVENTS logic
                return (
                    <div key={index} className="flex flex-col lg:flex-row items-center justify-between w-full group">
                        
                        {/* Sol Taraf */}
                        <div className={`w-full lg:w-[46%] mb-8 lg:mb-0 transform transition-all duration-500 lg:hover:-translate-y-2 ${isEven ? 'lg:text-right lg:pr-14' : 'lg:order-3 lg:pl-14'}`}>
                            <div className="bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(210,43,43,0.08)] border border-gray-100 rounded-[2rem] relative overflow-hidden transition-all duration-300">
                                <div className={`absolute top-0 w-full h-[6px] left-0 ${colorClass} transition-all duration-300 origin-left`}></div>
                                
                                <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 tracking-tighter opacity-10">{tTimeline(`${index}.year`)}</h3>
                                <div className="absolute top-8 md:top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl w-32 h-32 bg-red-400/10 rounded-full mix-blend-multiply pointer-events-none"></div>

                                <div className="relative z-10 -mt-10">
                                  <h3 className="text-3xl font-black text-[#D22B2B] mb-2 tracking-tight">{tTimeline(`${index}.year`)}</h3>
                                  <h4 className="text-2xl font-bold mb-4 text-gray-900 tracking-tight">{tTimeline(`${index}.title`)}</h4>
                                  <p className="text-gray-600 font-medium leading-loose text-base md:text-[17px]">{tTimeline(`${index}.desc`)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Orta Nokta İkonu */}
                        <div className="hidden lg:flex order-2 w-7 h-7 rounded-full border-[5px] border-white bg-[#D22B2B] shadow-[0_0_0_4px_rgba(210,43,43,0.1)] flex-shrink-0 items-center justify-center relative z-20 group-hover:scale-150 group-hover:bg-black transition-all duration-500">
                            {/* Inner dot */}
                        </div>

                        {/* Sağ Taraf - Boşluk Dengeleyici */}
                        <div className={`w-full lg:w-[46%] hidden lg:block ${isEven ? 'lg:order-3' : 'lg:text-left'}`}>
                            {/* Dengeleyici div */}
                        </div>

                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}
