import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import AuthSubmitButton from '@/components/ui/AuthSubmitButton';
import PasswordInput from '@/components/ui/PasswordInput';
import PasswordInputWithPolicy from '@/components/ui/PasswordInputWithPolicy';
import { updatePassword } from '../login/actions';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'Auth' });
  
  return {
    title: `${t('ResetPasswordTitle')} - Minifigurlerim`,
    description: t('ResetPasswordDesc'),
  };
}

export default async function ResetPasswordPage({
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
  
  const updatePasswordWithLocale = updatePassword.bind(null, locale);

  const errorMsgKey = resolvedParams?.error;
  const successMsgKey = resolvedParams?.message;

  const errorMsg = errorMsgKey && t.has(`Error_${errorMsgKey}`) ? t(`Error_${errorMsgKey}`) : errorMsgKey;
  const successMsg = successMsgKey && t.has(`Message_${successMsgKey}`) ? t(`Message_${successMsgKey}`) : successMsgKey;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden pb-32 md:pb-8">
      
      {/* İnce bir arka plan deseni */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      <div className="w-full max-w-lg flex flex-col items-center z-10 gap-5 sm:gap-6 mt-2 sm:mt-0">
        
        {/* LOGO ALANI */}
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
           <img src="/images/site-logo.png" alt="Minifigürlerim Logo" className="h-[48px] w-auto drop-shadow-sm" />
        </Link>

        {/* BEYAZ KART BÖLÜMÜ */}
        <div className="w-full bg-white rounded-[2rem] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden relative flex flex-col p-6 sm:p-14">
          
          {/* Dekoratif Çizgi (Üst) */}
          <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 w-full bg-gradient-to-r from-[#D22B2B] via-yellow-400 to-[#1D2136]"></div>
          
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 mb-1.5 sm:mb-2">{t('ResetPasswordTitle')}</h1>
            <p className="text-gray-500 text-[15px] font-medium leading-relaxed">{t('ResetPasswordDesc')}</p>
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

          <form className="space-y-5" action={updatePasswordWithLocale}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest" htmlFor="password">{t('NewPasswordLabel')}</label>
              </div>
              <PasswordInputWithPolicy
                id="password"
                name="password"
                placeholder="••••••••"
                required={true}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest" htmlFor="passwordConfirm">{t('NewPasswordConfirmLabel')}</label>
              </div>
              <PasswordInput
                id="passwordConfirm"
                name="passwordConfirm"
                placeholder="••••••••"
                required={true}
              />
            </div>
            
            <AuthSubmitButton isRegister={false} locale={locale} label={t('SaveNewPasswordBtn')} />
            
          </form>

        </div>
      </div>
    </div>
  );
}
