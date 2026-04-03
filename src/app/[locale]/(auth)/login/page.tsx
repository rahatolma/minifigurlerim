import { login, signup, signInWithGoogle } from './actions';
import Link from 'next/link';

export const metadata = {
  title: 'Giriş Yap - Minifigürlerim',
  description: 'Koleksiyonunuzu yönetmek için Minifigürlerim\'e giriş yapın.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams?.error;
  const successMsg = resolvedParams?.message;
  const isRegister = resolvedParams?.type === 'register';

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* İnce bir arka plan deseni */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      {/* Misafir Olarak Dön Butonu */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm font-bold z-10 group bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-200">
         <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
         Siteye Dön
      </Link>

      <div className="w-full max-w-5xl flex flex-col items-center z-10 gap-6">
        
        {/* LOGO ALANI */}
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
           <img src="/uploads/media__1774631571720.png" alt="Minifigürlerim Logo" className="h-[48px] w-auto drop-shadow-sm" />
        </Link>

        {/* BEYAZ KART BÖLÜMÜ */}
        <div className="w-full bg-white rounded-[2rem] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden relative flex flex-col md:flex-row">
        
        {/* Dekoratif Çizgi (Üst) */}
        <div className="absolute top-0 left-0 right-0 h-2 w-full bg-gradient-to-r from-[#D22B2B] via-yellow-400 to-[#1D2136]"></div>
        
        {/* SOL TARAF: Geleneksel Giriş / Kayıt */}
        <div className="w-full md:w-1/2 p-10 sm:p-14 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-gray-900 mb-2">
              {isRegister ? 'Koleksiyonunu Oluştur' : 'Koleksiyonuna Geri Dön'}
            </h1>
            <p className="text-gray-500 text-[15px] font-medium leading-relaxed">
              {isRegister 
                ? 'Minifigürlerini ekle, ilerlemeni takip et, favorilerini kaydet.' 
                : 'Koleksiyonuna erişmek için giriş yap.'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 shadow-sm animate-pulse-once flex items-center gap-2">
              <span className="text-xl leading-none">•</span> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold mb-6 border border-green-100 shadow-sm flex items-center gap-2">
              <span className="text-xl leading-none">✓</span> {successMsg}
            </div>
          )}

          <form className="space-y-5" action={isRegister ? signup : login}>
            <div>
              <label className="block text-[11px] font-black text-gray-700 mb-1.5 uppercase tracking-widest" htmlFor="email">E-Posta Adresi</label>
              <input
                id="email"
                type="email"
                name="email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-[#D22B2B] focus:ring-1 focus:ring-[#D22B2B] transition-all text-black placeholder:text-gray-400"
                placeholder="koleksiyoner@mail.com"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest" htmlFor="password">Şifre</label>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-black placeholder:text-gray-400"
                placeholder="••••••••"
                required
              />
              {!isRegister && (
                  <div className="text-right mt-2">
                       <Link href="#" className="text-[11px] font-bold text-gray-500 hover:text-black transition-colors">Şifremi Unuttum</Link>
                  </div>
              )}
            </div>

            {isRegister ? (
              <div className="flex flex-col gap-1.5 mt-2 mb-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" name="terms" required className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#D22B2B] focus:ring-[#D22B2B] transition-colors cursor-pointer" />
                  <span className="text-[12px] text-gray-600 font-medium leading-snug">
                    <Link href="/kullanim-kosullari" className="text-[#D22B2B] font-bold hover:underline" target="_blank">Kullanım Koşulları</Link>, <Link href="/gizlilik" className="text-[#D22B2B] font-bold hover:underline" target="_blank">Gizlilik Politikası</Link> ve <Link href="/cerez-politikasi" className="text-[#D22B2B] font-bold hover:underline" target="_blank">Çerez Politikası</Link>'nı okudum, kabul ediyorum.
                  </span>
                </label>
                <p className="text-[10px] text-gray-400 font-bold tracking-wide pl-7">
                  Üyeliğin ücretsizdir. Hesabını istediğin zaman silebilirsin.
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full bg-[#1A2035] text-white font-black hover:bg-[#111526] py-3.5 rounded-xl transition-all shadow-[0_5px_20px_rgba(26,32,53,0.15)] mt-6 flex items-center justify-center gap-2 tracking-wide"
            >
              {isRegister ? 'Ücretsiz Hesap Oluştur' : 'Koleksiyonuma Git'}
            </button>
            
          </form>

          {!isRegister ? (
            <div className="mt-6 flex justify-center w-full">
              <p className="text-[11px] text-center text-gray-400 font-bold flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Verilerin güvende tutulur ve üçüncü kişilerle paylaşılmaz.
              </p>
            </div>
          ) : null}

          <div className="mt-8 text-center pt-8 border-t border-gray-100 flex flex-col gap-3 items-center">
            <p className="text-[13px] font-bold text-gray-500">
              {isRegister ? 'Zaten bir hesabınız var mı?' : 'Henüz koleksiyonun yok mu?'}
            </p>
            <Link 
              href={isRegister ? '/login' : '/login?type=register'} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-[#D22B2B] text-sm font-black rounded-xl transition-all shadow-sm border border-gray-200"
            >
              {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </Link>
          </div>
        </div>
        
        {/* SAĞ TARAF: Sosyal Girişler ve Özellikler */}
        <div className="w-full md:w-1/2 bg-gray-50/50 p-10 sm:p-14 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Arka plan süslemeleri */}
            <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
                <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20,20 h60 v60 h-60 z M30,10 h40 v10 h-40 z" />
                </svg>
            </div>

            <div className="w-full max-w-sm">
                <h3 className="text-center text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase mb-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    HIZLI GİRİŞ
                    <div className="h-px flex-1 bg-gray-200"></div>
                </h3>
                
                <div className="space-y-4">
                   {/* Google */}
                   <form action={signInWithGoogle} className="w-full">
                       <button type="submit" className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-800 font-bold py-3.5 px-6 rounded-xl transition-all">
                           <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                           </svg>
                           Google ile Devam Et
                       </button>
                   </form>
                   
                   {/* Apple */}
                   <button className="w-full flex items-center justify-center gap-3 bg-black text-white hover:bg-gray-900 font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                           <path d="M16.48 11.2a4.43 4.43 0 01-2.12-3.8c0-2.45 2.15-3.7 2.25-3.76-1.12-1.58-2.87-1.8-3.48-1.83-1.48-.15-2.9.89-3.66.89-.78 0-1.93-.86-3.14-.84-1.57.02-3.03.9-3.84 2.28-1.63 2.78-.42 6.89 1.17 9.15.77 1.1 1.69 2.33 2.87 2.29 1.15-.04 1.58-.75 2.97-.75 1.37 0 1.77.75 2.97.73 1.22-.02 2-.14 2.76-1.25.88-1.27 1.24-2.49 1.26-2.55-.030-.02-2.39-.9-2.39-3.55zM14.72 4.44c.64-.76 1.07-1.82.95-2.88-0.93.04-2.07.63-2.73 1.4-.58.68-1.08 1.75-.95 2.8C13.02 5.86 14.08 5.2 14.72 4.44z"/>
                       </svg>
                       Apple ile Devam Et
                   </button>
                   
                </div>
                
                
                {isRegister && (
                  <div className="mt-10 bg-blue-50/30 p-6 rounded-2xl border border-blue-100 text-center shadow-sm w-full">
                      <p className="text-[12px] font-black text-gray-800 mb-4 tracking-wide uppercase text-left pl-2">Seni Neler Bekliyor?</p>
                      <ul className="text-[12.5px] text-gray-700 font-bold space-y-3 mt-2 text-left px-2 leading-relaxed">
                          <li className="flex items-start gap-2.5">
                              <span className="text-emerald-500 font-black mt-0.5">✓</span> Koleksiyonundaki figürleri kaydet
                          </li>
                          <li className="flex items-start gap-2.5">
                              <span className="text-emerald-500 font-black mt-0.5">✓</span> Eksik figürlerini takip et
                          </li>
                          <li className="flex items-start gap-2.5">
                              <span className="text-emerald-500 font-black mt-0.5">✓</span> Serilerde ilerleme durumunu gör
                          </li>
                          <li className="flex items-start gap-2.5">
                              <span className="text-emerald-500 font-black mt-0.5">✓</span> Favori figürlerini ve radar listeni oluştur
                          </li>
                      </ul>
                  </div>
                )}
            </div>
        </div>
        </div>
      </div>
      

      
    </div>
  );
}
