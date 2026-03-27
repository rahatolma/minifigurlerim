import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#f4f4f4] text-black w-full pt-20 pb-10 font-sans border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Col 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
             <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--color-brand-red)'}}>
              <span className="text-xl">🙂</span>
            </div>
            <span className="text-2xl font-black tracking-tight uppercase">Minifigürlerim</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed">
            Son çıkan mini figürleri ve güncel haberleri yakından takip etmek istiyorsanız e-mail haber grubuna abone olun!
          </p>
          <form className="flex flex-col gap-3 mt-6">
            <input 
              type="email" 
              placeholder="Lütfen e-posta adresinizi giriniz... *" 
              className="bg-white border border-gray-200 px-5 py-4 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 font-medium placeholder:font-normal text-sm"
              required
            />
            <button type="submit" className="bg-[#D22B2B] text-white font-bold py-4 rounded-md hover:bg-[#B22222] transition-colors uppercase">
              ABONE OLUN!
            </button>
          </form>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-bold text-lg mb-8">Koleksiyon</h4>
          <ul className="space-y-4 font-semibold text-[15px] text-gray-800">
            <li><Link href="/seriler?cat=karakter-paketleri" className="text-red-600 hover:text-black">Karakter Paketleri</Link></li>
            <li><Link href="/seriler?cat=ozel-seriler" className="hover:text-red-600">Özel Seri Teklifleri</Link></li>
            <li><Link href="/haberler" className="hover:text-red-600">Haberler & İncelemeler</Link></li>
            <li><Link href="/iletisim" className="hover:text-red-600">İletişim</Link></li>
            <li><Link href="/iade" className="hover:text-red-600">İade Politikası</Link></li>
            <li><Link href="/kargo" className="hover:text-red-600">Teslimat Bilgileri</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-bold text-lg mb-8">Hakkımızda</h4>
          <ul className="space-y-4 font-semibold text-[15px] text-gray-800">
            <li><Link href="/hakkimizda/kurumsal" className="text-red-600 hover:text-black">Kurumsal</Link></li>
            <li><Link href="/hakkimizda/misyon" className="hover:text-red-600">Misyonumuz</Link></li>
            <li><Link href="/iletisim" className="hover:text-red-600">Bize Ulaşın</Link></li>
            <li><Link href="/sss" className="hover:text-red-600">S.S.S</Link></li>
            <li><Link href="/gizlilik" className="hover:text-red-600">Gizlilik Sözleşmesi</Link></li>
            <li><Link href="/kullanim-kosullari" className="hover:text-red-600">Kullanım Koşulları</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="font-bold text-lg mb-8">Bize Ulaşın</h4>
          <div className="space-y-4 text-[15px] font-semibold">
            <p>Telefon</p>
            <p className="text-red-600 font-bold text-2xl tracking-tight mt-1">0090 533 399 62 21</p>
            <a href="mailto:destek@minifigurlerim.com" className="text-green-700 underline block mt-6">
              destek@minifigurlerim.com
            </a>
            
            <div className="flex gap-4 mt-8">
              <a href="#" className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-gray-300 flex flex-col md:flex-row items-center justify-between font-semibold text-[14px]">
        <p className="opacity-80">© Telif Hakkı 08/2024 - 2026 • Tüm Hakları Saklıdır • <span className="text-red-600 font-bold opacity-100">Minifigürlerim</span> tarafından geliştirilmiştir.</p>
        <button className="bg-[#D22B2B] text-white font-bold py-3 px-8 rounded-md hover:bg-[#B22222] transition-colors mt-6 md:mt-0 tracking-wide text-sm">
          Önemli Yasal Bilgilendirme
        </button>
      </div>
    </footer>
  );
}
