import { login, signup, signInWithGoogle, forgotPassword } from './actions';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import AuthSubmitButton from '@/components/ui/AuthSubmitButton';
import PasswordInput from '@/components/ui/PasswordInput';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'Auth' });
  
  return {
    title: `${t('LoginBtn')} - Minifigurlerim`,
    description: t('LoginDesc'),
  };
}

export default async function LoginPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await searchParams;
  const resolvedParams2 = await params;
  const locale = resolvedParams2.locale;
  const t = await getTranslations('Auth');
  
  const loginWithLocale = login.bind(null, locale);
  const signupWithLocale = signup.bind(null, locale);

  const errorMsgKey = resolvedParams?.error;
  const successMsgKey = resolvedParams?.message;

  const errorMsg = errorMsgKey && t.has(`Error_${errorMsgKey}`) ? t(`Error_${errorMsgKey}`) : errorMsgKey;
  const successMsg = successMsgKey && t.has(`Message_${successMsgKey}`) ? t(`Message_${successMsgKey}`) : successMsgKey;
  
  const isRegister = resolvedParams?.type === 'register';
  const isSocial = resolvedParams?.type === 'social';
  const isForgot = resolvedParams?.type === 'forgot';
  const isSuccessState = successMsgKey === 'registration_success_verify';
  const currentView = isSuccessState ? 'success_state' : (isForgot ? 'forgot' : (isSocial ? 'social' : (isRegister ? 'register' : 'login')));
  const forgotWithLocale = forgotPassword.bind(null, locale);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden pb-32 md:pb-8">
      
      {/* İnce bir arka plan deseni */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      {/* Misafir Olarak Dön Butonu */}
      <Link href="/" className="hidden md:flex absolute top-8 left-8 items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm font-bold z-10 group bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-200">
         <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
         {t('BackToSite')}
      </Link>

      <div className="w-full max-w-5xl flex flex-col items-center z-10 gap-5 sm:gap-6 mt-2 sm:mt-0">
        
        {/* LOGO ALANI */}
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
           <img src="/images/site-logo.png" alt="Minifigürlerim Logo" className="h-[48px] w-auto drop-shadow-sm" />
        </Link>

        {/* BEYAZ KART BÖLÜMÜ */}
        <div className="w-full bg-white rounded-[2rem] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden relative flex flex-col md:flex-row">
        
        {/* Dekoratif Çizgi (Üst) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 w-full bg-gradient-to-r from-[#D22B2B] via-yellow-400 to-[#1D2136]"></div>
        
        {/* SOL TARAF: Formlar */}
        <div className={`w-full md:w-1/2 p-6 sm:p-14 border-b-0 md:border-r border-gray-100 flex-col justify-center ${currentView === 'social' ? 'hidden md:flex' : 'flex'}`}>
          
          {isSuccessState ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-10">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900">{t('SignupSuccessTitle')}</h1>
              <p className="text-gray-500 text-[15px] font-medium leading-relaxed max-w-sm">{t('SignupSuccessDesc')}</p>
              <Link href={"/login" as any} className="mt-4 px-8 py-3 bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm font-black rounded-xl transition-all shadow-sm border border-gray-200">
                {t('BackToLogin')}
              </Link>
            </div>
          ) : isForgot ? (
            <>
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 mb-1.5 sm:mb-2">{t('ForgotTitle')}</h1>
                <p className="text-gray-500 text-[15px] font-medium leading-relaxed">{t('ForgotDesc')}</p>
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

              <form className="space-y-5" action={forgotWithLocale}>
                <div>
                  <label className="block text-[11px] font-black text-gray-700 mb-1.5 uppercase tracking-widest" htmlFor="email">{t('EmailLabel')}</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-[#D22B2B] focus:ring-1 focus:ring-[#D22B2B] transition-all text-black placeholder:text-gray-400"
                    placeholder={t('EmailPlaceholder')}
                    required
                  />
                </div>
                
                <AuthSubmitButton isRegister={false} locale={locale} label={t('SendResetLinkBtn')} />
                
                <div className="mt-6 text-center">
                   <Link href={"/login" as any} className="text-[12px] font-bold text-gray-500 hover:text-black transition-colors">{t('BackToLogin')}</Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 mb-1.5 sm:mb-2">
                  {isRegister ? t('RegisterTitle') : t('LoginTitle')}
                </h1>
                <p className="text-gray-500 text-[15px] font-medium leading-relaxed">
                  {isRegister ? t('RegisterDesc') : t('LoginDesc')}
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

              <form className="space-y-5" action={isRegister ? signupWithLocale : loginWithLocale}>
                <div>
                  <label className="block text-[11px] font-black text-gray-700 mb-1.5 uppercase tracking-widest" htmlFor="email">{t('EmailLabel')}</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-[#D22B2B] focus:ring-1 focus:ring-[#D22B2B] transition-all text-black placeholder:text-gray-400"
                    placeholder={t('EmailPlaceholder')}
                    required
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest" htmlFor="password">{t('PasswordLabel')}</label>
                  </div>
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required={true}
                  />
                  {!isRegister && (
                      <div className="text-right mt-2">
                           <Link href={"/login?type=forgot" as any} className="text-[11px] font-bold text-gray-500 hover:text-black transition-colors">{t('ForgotPassword')}</Link>
                      </div>
                  )}
                </div>

                {isRegister ? (
                  <div className="flex flex-col gap-1.5 mt-2 mb-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" name="terms" required className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#D22B2B] focus:ring-[#D22B2B] transition-colors cursor-pointer" />
                      <span className="text-[12px] text-gray-600 font-medium leading-snug">
                        {t.rich('TermsAgreement', {
                          terms: (chunks) => <Link href="/yasal/kullanim-kosullari" className="text-[#D22B2B] font-bold hover:underline" target="_blank">{chunks}</Link>,
                          privacy: (chunks) => <Link href="/yasal/gizlilik-politikasi" className="text-[#D22B2B] font-bold hover:underline" target="_blank">{chunks}</Link>,
                          membership: (chunks) => <Link href="/yasal/uyelik-sozlesmesi" className="text-[#D22B2B] font-bold hover:underline" target="_blank">{chunks}</Link>
                        })}
                      </span>
                    </label>
                    <p className="text-[10px] text-gray-400 font-bold tracking-wide pl-7">
                      {t('FreeMembership')}
                    </p>
                  </div>
                ) : null}

                <AuthSubmitButton isRegister={isRegister} locale={locale} label={isRegister ? t('CreateAccountFree') : t('LoginBtn')} />
                
              </form>

              {!isRegister ? (
                <div className="mt-6 flex justify-center w-full">
                  <p className="text-[11px] text-center text-gray-400 font-bold flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    {t('DataSafe')}
                  </p>
                </div>
              ) : null}

              <div className="hidden md:flex mt-8 text-center pt-8 border-t border-gray-100 flex-col gap-3 items-center">
                <p className="text-[13px] font-bold text-gray-500">
                  {isRegister ? t('AlreadyHaveAccount') : t('DontHaveCollection')}
                </p>
                <Link 
                  href={(isRegister ? '/login' : '/login?type=register') as any} 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-[#D22B2B] text-sm font-black rounded-xl transition-all shadow-sm border border-gray-200"
                >
                  {isRegister ? t('LoginAction') : t('RegisterAction')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </Link>
              </div>
            </>
          )}
        </div>
        
        {/* SAĞ TARAF: Sosyal Girişler ve Özellikler */}
        <div className={`w-full md:w-1/2 bg-gray-50/50 p-6 sm:p-14 flex-col justify-center items-center relative overflow-hidden ${currentView === 'social' ? 'flex' : 'hidden md:flex'}`}>
            {/* Arka plan süslemeleri */}
            <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
                <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20,20 h60 v60 h-60 z M30,10 h40 v10 h-40 z" />
                </svg>
            </div>

            <div className="w-full max-w-sm">
                <h3 className="text-center text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase mb-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    {t('FastLogin')}
                    <div className="h-px flex-1 bg-gray-200"></div>
                </h3>
                
                <div className="space-y-4">
                   {/* Google */}
                   <form action={signInWithGoogle} className="w-full">
                       <AuthSubmitButton 
                           isRegister={isRegister} 
                           locale={locale} 
                           authProvider="google" 
                           className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-800 font-bold py-3.5 px-6 rounded-xl transition-all"
                       >
                           <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                           </svg>
                           {t('ContinueWithGoogle')}
                       </AuthSubmitButton>
                   </form>
                   
                   {/* Apple */}
                   <AuthSubmitButton 
                       isRegister={isRegister} 
                       locale={locale} 
                       authProvider="apple" 
                       className="w-full flex items-center justify-center gap-3 bg-black text-white hover:bg-gray-900 font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm"
                   >
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                           <path d="M16.48 11.2a4.43 4.43 0 01-2.12-3.8c0-2.45 2.15-3.7 2.25-3.76-1.12-1.58-2.87-1.8-3.48-1.83-1.48-.15-2.9.89-3.66.89-.78 0-1.93-.86-3.14-.84-1.57.02-3.03.9-3.84 2.28-1.63 2.78-.42 6.89 1.17 9.15.77 1.1 1.69 2.33 2.87 2.29 1.15-.04 1.58-.75 2.97-.75 1.37 0 1.77.75 2.97.73 1.22-.02 2-.14 2.76-1.25.88-1.27 1.24-2.49 1.26-2.55-.030-.02-2.39-.9-2.39-3.55zM14.72 4.44c.64-.76 1.07-1.82.95-2.88-0.93.04-2.07.63-2.73 1.4-.58.68-1.08 1.75-.95 2.8C13.02 5.86 14.08 5.2 14.72 4.44z"/>
                       </svg>
                       {t('ContinueWithApple')}
                   </AuthSubmitButton>
                   
                </div>
                
                
                  <div className="hidden sm:block mt-10 bg-blue-50/30 p-6 rounded-2xl border border-blue-100 text-center shadow-sm w-full">
                      <p className="text-[12px] font-black text-gray-800 mb-4 tracking-wide uppercase text-left pl-2">{t('WhatsWaitingForYou')}</p>
                      <ul className="text-[12.5px] text-gray-700 font-bold space-y-3 mt-2 text-left px-2 leading-relaxed">
                          <li className="flex items-start gap-2.5">
                              <span className="text-emerald-500 font-black mt-0.5">✓</span> {t('Feature1')}
                          </li>
                          <li className="flex items-start gap-2.5">
                              <span className="text-emerald-500 font-black mt-0.5">✓</span> {t('Feature2')}
                          </li>
                          <li className="flex items-start gap-2.5">
                              <span className="text-emerald-500 font-black mt-0.5">✓</span> {t('Feature3')}
                          </li>
                          <li className="flex items-start gap-2.5">
                              <span className="text-emerald-500 font-black mt-0.5">✓</span> {t('Feature4')}
                          </li>
                      </ul>
                  </div>
            </div>
        </div>
        </div>
      {/* MOBİL: Alt Menü (Tab Bar) - Sadece Auth Sayfasına Özel */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between pb-safe px-1">
          <Link 
            href="/"
            className="flex flex-col items-center justify-center gap-1.5 p-2 py-3 w-1/4 transition-colors text-gray-400 hover:text-gray-600"
          >
             <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
             <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 whitespace-nowrap">{t('Home')}</span>
          </Link>

          <Link 
            href={"/login" as any}
            className={`flex flex-col items-center justify-center gap-1.5 p-2 py-3 w-1/4 transition-colors ${currentView === 'login' ? 'text-[#D22B2B]' : 'text-gray-400 hover:text-gray-600'}`}
          >
             <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
             <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 whitespace-nowrap">{t('LoginAction')}</span>
          </Link>

          <Link 
            href={"/login?type=register" as any}
            className={`flex flex-col items-center justify-center gap-1.5 p-2 py-3 w-1/4 transition-colors ${currentView === 'register' ? 'text-[#D22B2B]' : 'text-gray-400 hover:text-gray-600'}`}
          >
             <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
             <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 whitespace-nowrap">{t('RegisterAction')}</span>
          </Link>

          <Link 
             href={"/login?type=social" as any}
             className={`flex flex-col items-center justify-center gap-1.5 p-2 py-3 w-1/4 transition-colors ${currentView === 'social' ? 'text-[#D22B2B]' : 'text-gray-400 hover:text-gray-600'}`}
          >
             <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 whitespace-nowrap">{t('FastLogin')}</span>
          </Link>
      </div>
      
      </div>
      
    </div>
  );
}
