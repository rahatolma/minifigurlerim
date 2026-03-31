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
         Vazgeç, Siteye Dön
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
              {isRegister ? 'Koleksiyona Katıl' : 'Sisteme Giriş Yap'}
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              {isRegister 
                ? 'Minifigür portföyünüzü oluşturun ve değerleri global çapta takip edin. Geleneksel e-posta ile hemen başlayın.' 
                : 'Minifigür borsanıza dönün. Klasik yöntemle e-posta üzerinden güvenli giriş yapın.'}
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
                  {!isRegister && (
                      <Link href="#" className="text-[10px] font-bold text-gray-400 hover:text-[#D22B2B] transition-colors">Şifremi Unuttum</Link>
                  )}
              </div>
              <input
                id="password"
                type="password"
                name="password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-[#D22B2B] focus:ring-1 focus:ring-[#D22B2B] transition-all text-black placeholder:text-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1A2035] text-white font-black hover:bg-[#111526] py-3.5 rounded-xl transition-all shadow-[0_5px_20px_rgba(26,32,53,0.15)] mt-4 flex items-center justify-center gap-2 tracking-wide"
            >
              {isRegister ? 'Ücretsiz Hesap Oluştur' : 'Güvenli Giriş Yap'}
            </button>
          </form>

          <div className="mt-8 text-center pt-2">
            <p className="text-sm font-medium text-gray-500 inline-block">
              {isRegister ? 'Zaten bir hesabınız var mı?' : 'Henüz portföyünüz yok mu?'}
            </p>
            <Link 
              href={isRegister ? '/login' : '/login?type=register'} 
              className="inline-block ml-2 text-[#D22B2B] font-black hover:underline"
            >
              {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
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
                    VEYA ŞUNLARLA DEVAM ET
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
                   
                   {/* X (Twitter) */}
                   <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                           <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                       </svg>
                       X (Twitter) ile Devam Et
                   </button>
                </div>
                
                <div className="mt-8 bg-blue-50/30 p-5 rounded-xl border border-blue-100 text-center shadow-sm">
                    <p className="text-[12px] font-bold text-gray-800 mb-3 tracking-wide uppercase">Neden Topluluğa Katılmalıyım?</p>
                    <ul className="text-[11px] text-gray-600 font-medium space-y-2 mt-2 text-left px-2">
                        <li className="flex items-start gap-2">
                            <span className="text-[#D22B2B] font-bold mt-0.5">•</span> Özel Minifigür piyasa değerlerini incele.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#D22B2B] font-bold mt-0.5">•</span> Bende Var / İstiyorum listeleri ile takasa hazırlan.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#D22B2B] font-bold mt-0.5">•</span> Koleksiyonuna kendi şık fotoğraflarını yükle.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#D22B2B] font-bold mt-0.5">•</span> Diğer üyelerin koleksiyonlarını gez ve yorumla.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        </div>
      </div>
      
      {/* GİZLİLİK VE ŞARTLAR */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10 px-4">
         <p className="text-xs text-gray-400 font-medium max-w-md mx-auto">
            Hesap oluşturarak <Link href="/sartlar" className="font-bold underline hover:text-gray-600 transition-colors">Hizmet Şartlarımız</Link> ve <Link href="/gizlilik" className="font-bold underline hover:text-gray-600 transition-colors">Gizlilik ve Çerez Bildirimimizi</Link> kabul etmiş olursunuz.
         </p>
      </div>
      
    </div>
  );
}
