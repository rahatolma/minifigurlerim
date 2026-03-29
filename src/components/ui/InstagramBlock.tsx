'use client';
import Link from 'next/link';
import InstagramIcon from './icons/InstagramIcon';

export default function InstagramBlock() {
  return (
    <div className="flex flex-col md:flex-row w-full gap-6 md:gap-10 items-stretch min-h-[360px]">
       {/* SOL Taraf: Kırmızı Teyakkuz Alanı */}
       <div className="w-full md:w-1/3 bg-[#D22B2B] rounded-xl p-10 md:p-14 text-white shadow-[0_10px_40px_rgba(210,43,43,0.3)] relative overflow-hidden group flex flex-col justify-between">
          
          {/* Arka Planda Şov (Devasa ve Silik İkon - Hover ile döner) */}
          <div className="absolute -right-12 -bottom-12 opacity-10 scale-150 rotate-[15deg] transition-all duration-700 ease-out group-hover:rotate-0 group-hover:scale-110 pointer-events-none">
             <InstagramIcon size={300} strokeWidth={1} />
          </div>
          
          <div className="relative z-10 flex flex-col gap-12">
            <h3 className="text-[28px] md:text-[34px] font-black leading-[1.15] tracking-tight">
              Bizi<br />Instagram'da<br />Takip<br />Edebilirsiniz.!
            </h3>
            
            <div className="space-y-8">
              <p className="font-extrabold text-[18px] md:text-[20px] tracking-wide inline-flex items-center gap-2">
                <InstagramIcon size={20} strokeWidth={2.5} /> @minifigurlerim
              </p>
              <div>
                <Link 
                  href="https://instagram.com/minifigurlerim" 
                  target="_blank" 
                  className="inline-flex items-center justify-center bg-black text-white px-8 py-5 font-black rounded text-[13px] uppercase tracking-widest hover:-translate-y-1 hover:shadow-2xl hover:bg-[#111] transition-all duration-300"
                >
                  Takip Edin
                </Link>
              </div>
            </div>
          </div>
       </div>

       {/* SAĞ Taraf: Admin Paneli Widget Iframe Barınağı */}
       <div className="w-full md:w-2/3 bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center p-2 relative group min-h-[360px]">
          
          {/* Burası Senin Widget Alanın: (Iframe / Script'i buraya yapıştırabilirsin) */}
          <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-lg bg-[#0A0A0A] p-8 text-center transition-colors group-hover:border-gray-700">
             
             {/* KANKAM İFRAME KODUNU BU DOSYADA TAM OLARAK BURAYA YAPIŞTIRACAKSIN */}
             {/* <iframe src="https://senin-widget-kodu..." className="..." /> */}
             
             <div className="space-y-4 text-gray-500">
                <InstagramIcon size={40} className="mx-auto opacity-50" />
                <p className="text-sm font-bold tracking-widest uppercase">INSTAGRAM WIDGET ALANI</p>
                <p className="text-xs font-medium max-w-sm mx-auto">Admin panelinden aldığın (Snapwidget / Elfsight vs) embed kodunu `src/components/ui/InstagramBlock.tsx` dosyasında gizli yorum satırının olduğu yere yapıştır.</p>
             </div>

          </div>

       </div>
    </div>
  )
}
