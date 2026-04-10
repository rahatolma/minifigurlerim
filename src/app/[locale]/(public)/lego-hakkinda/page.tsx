import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'LEGO® Hakkında | Minifigürlerim',
  description: 'LEGO markasının dünden bugüne unutulmaz tarihi ve kilometre taşları.',
};

const TIMELINE_EVENTS = [
  {
    year: '1932',
    title: 'Ahşap Oyuncaklardan Efsaneye',
    desc: 'Ole Kirk Kristiansen, Danimarka\'nın Billund kasabasında mütevazı bir atölyede tahta yo-yolar ve oyuncaklar üreterek gelecekte dünyanın en büyük oyuncak markası olacak serüveni başlattı.',
    color: 'bg-black',
  },
  {
    year: '1934',
    title: '"Leg Godt" (İyi Oyna)',
    desc: 'Şirket, Danca "iyi oyna" anlamına gelen "leg godt" kelimelerinin birleşiminden doğan "LEGO" adını aldı. Gelecekte bir imparatorluğa dönüşeceğinden henüz kimsenin haberi yoktu.',
    color: 'bg-[#D22B2B]',
  },
  {
    year: '1947',
    title: 'Plastikle İlk Tanışma',
    desc: 'LEGO, Danimarka\'nın ilk plastik enjeksiyon makinesini satın aldı. Bu riskli ve cesur hamle, şirketin kaderini ahşaptan modern teknolojiye taşıyan ilk kıvılcım oldu.',
    color: 'bg-black',
  },
  {
    year: '1949',
    title: 'Otomatik Bağlanan Tuğlalar',
    desc: 'Bugün efsaneleşen LEGO tuğlasının ilk prototipi olan "Automatic Binding Bricks" (Otomatik Bağlanan Tuğlalar) piyasaya sürüldü.',
    color: 'bg-[#D22B2B]',
  },
  {
    year: '1954',
    title: '"Oyun Sistemi" Felsefesi',
    desc: 'Godtfred Kirk Christiansen, oyuncakların tek kullanımlık olmaması gerektiğine inandı. Tüm setlerin birbiriyle uyumlu çalıştığı ve yaratıcılığı sonsuz kılan "Sistematik Oyun" fikrini hayata geçirdi.',
    color: 'bg-black',
  },
  {
    year: '1958',
    title: 'Kusursuz Bağlantı Şifresi: Patent',
    desc: 'Üstte tırnakları (studs) ve altta tüpleri (tubes) olan modern LEGO® tuğlasının patenti, tam 13:58\'de Danimarka\'da alındı. Mükemmel kilitlenme gücü (Clutch Power) dünyayı değiştirdi.',
    color: 'bg-[#D22B2B]',
  },
  {
    year: '1968',
    title: 'İlk LEGOLAND® Açılıyor',
    desc: 'Billund\'da açılan ilk LEGOLAND tema parkı beklentileri altüst etti. İlk sezonunda 3.000 ziyaretçi beklenirken inanılmaz bir şekilde 625.000 kişiyi ağırladı.',
    color: 'bg-black',
  },
  {
    year: '1969',
    title: 'Büyük Çaplı Devrim: DUPLO®',
    desc: 'Küçük çocukların yutmaması için klasik LEGO tuğlasından tam 8 kat daha büyük hacme sahip DUPLO® serisi piyasaya sürüldü. İlginçtir ki, DUPLO tuğlaları da klasik tuğlalara tam uyumluydu!',
    color: 'bg-[#D22B2B]',
  },
  {
    year: '1978',
    title: 'Gülümseyen İkon: MİNİFİGÜR!',
    desc: 'Jens Nygaard Knudsen tarafından tasarlanan hareketli kolları, bacakları ve karakteristik sarı yüzüyle efsanevi "Minifigür" dünyaya tanıtıldı! O yıl uzay, şövalye ve şehir temaları peş peşe geldi.',
    color: 'bg-black',
  },
  {
    year: '1989',
    title: 'Korsanlar ve Farklı Yüzler',
    desc: 'Minifigürler ilk defa klasik iki nokta ve bir gülümseme kalıbının dışına çıktı. LEGO® Korsanlar (Pirates) temasıyla sakallı, kancalı ve göz bantlı minifigürler hayatımıza girdi.',
    color: 'bg-[#D22B2B]',
  },
  {
    year: '1999',
    title: 'Galaktik Bir Uyanış: Star Wars™',
    desc: 'LEGO, tarihinde ilk kez bir sinema lisansıyla (Star Wars) anlaşma imzaladı. İlk "LEGO Star Wars" seti piyasaya çıktı ve ticari bir efsane doğdu.',
    color: 'bg-black',
  },
  {
    year: '2001',
    title: 'Küllerinden Doğan Efsane: BIONICLE®',
    desc: 'Şirketin finansal krize girdiği bir dönemde tanıtılan, zengin hikayeli fantastik robot/savaşçı teması BIONICLE, LEGO\'yu adeta iflastan kurtaran kahraman oldu.',
    color: 'bg-[#D22B2B]',
  },
  {
    year: '2007',
    title: 'Milenyum Şahini: Devlerin Dönemi',
    desc: '5.195 parçalık İlk Ultimate Collector Series (UCS) Millennium Falcon piyasaya sürüldü. LEGO\'nun sadece çocuklara değil, AFOL (Yetişkin Hayranlara) hitap ettiği altın çağ başladı.',
    color: 'bg-black',
  },
  {
    year: '2014',
    title: 'Beyazperdeye Sıçrayış',
    desc: 'Efsanevi "The LEGO Movie" filmi vizyona girdi ve gişeleri salladı. Filmin "Her şey harika! (Everything is Awesome)" şarkısı bir pop müzik hitine dönüştü.',
    color: 'bg-[#D22B2B]',
  },
  {
    year: 'Bugün',
    title: 'Sınır Tanımayan Bir Tutku',
    desc: 'Bugün LEGO®, dünyanın en değerli ve yenilikçi oyuncak markası. Sıklıkla vurguladığı "Sadece hayal gücü ile sınırlısın" felsefesiyle kuşaklar boyu aktarılan muhteşem bir kültür.',
    color: 'bg-black',
  }
];

export default function LegoHakkindaPage() {
  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-32">
      


      {/* Hero Header */}
      <div className="w-full relative px-4 sm:px-8 max-w-7xl mx-auto mt-8">
        <div className="relative w-full h-[350px] md:h-[450px] bg-[#0a0a0a] overflow-hidden rounded-3xl shadow-2xl flex items-center justify-center text-center px-6 group">
            <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0"></div>
            
            <div className="relative z-10">
                <div className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 font-bold text-xs tracking-[0.2em] text-white uppercase shadow-sm">
                   90 YILLIK SERÜVEN
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-lg">
                   Tarihin <span className="text-[#D22B2B]">Tuğlaları</span>
                </h1>
                <p className="text-gray-300 font-medium text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4 md:px-0 opacity-90">
                   Billund'daki mütevazı bir marangoz atölyesinden ekranlara uzanan dünyanın en ikonik yaratıcılık imparatorluğu.
                </p>
            </div>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 mt-24 relative">
        
        {/* Ortadan İnen Kırmızı-Glow Çizgi (Sadece Desktop) */}
        <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-1.5 bg-gradient-to-b from-[#D22B2B] via-red-600 to-[#D22B2B] transform -translate-x-1/2 rounded-full shadow-[0_0_15px_rgba(210,43,43,0.5)] z-0"></div>

        <div className="space-y-12 lg:space-y-20 relative z-10 w-full">
            {TIMELINE_EVENTS.map((event, index) => {
                const isEven = index % 2 === 0; // True = Sol taraf
                return (
                    <div key={index} className="flex flex-col lg:flex-row items-center justify-between w-full group">
                        
                        {/* Sol Taraf */}
                        <div className={`w-full lg:w-[46%] mb-8 lg:mb-0 transform transition-all duration-500 lg:hover:-translate-y-2 ${isEven ? 'lg:text-right lg:pr-14' : 'lg:order-3 lg:pl-14'}`}>
                            <div className="bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(210,43,43,0.08)] border border-gray-100 rounded-[2rem] relative overflow-hidden transition-all duration-300">
                                <div className={`absolute top-0 w-full h-[6px] left-0 ${event.color} transition-all duration-300 origin-left`}></div>
                                
                                <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 tracking-tighter opacity-10">{event.year}</h3>
                                <div className="absolute top-8 md:top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl w-32 h-32 bg-red-400/10 rounded-full mix-blend-multiply pointer-events-none"></div>

                                <div className="relative z-10 -mt-10">
                                  <h3 className="text-3xl font-black text-[#D22B2B] mb-2 tracking-tight">{event.year}</h3>
                                  <h4 className="text-2xl font-bold mb-4 text-gray-900 tracking-tight">{event.title}</h4>
                                  <p className="text-gray-600 font-medium leading-loose text-base md:text-[17px]">{event.desc}</p>
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
