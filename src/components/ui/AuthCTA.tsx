'use client';
import { Link } from '@/i18n/routing';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from 'next-intl';

export interface AuthCTAProps {
  fullWidth?: boolean;
}

export default function AuthCTA({ fullWidth = false }: AuthCTAProps) {
  // Mimari kural 2 & 3 Revizyonu:
  // useAuth() artık stricly tiplendi. Provider dışına çıkarsa anında sert hata (throw Error) fırlatacak.
  // Bu yüzden kozmetik bir 'fallback' yapmıyoruz, doğrudan context'in gücüne ve hatasına güveniyoruz.
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const t = useTranslations('AuthCTA');

  const containerStyle = fullWidth
    ? "w-full relative overflow-hidden bg-gray-900 py-16 md:py-20 px-4 md:px-8 shadow-xl flex flex-col items-center justify-center text-center group border-y border-gray-800"
    : "w-full relative overflow-hidden bg-gray-900 rounded-3xl px-8 pt-8 pb-12 md:px-12 md:pt-10 md:pb-16 shadow-[0_15px_40px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center text-center group border border-gray-800";

  return (
    <div className={containerStyle}>
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#D22B2B]/20 blur-[60px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-[#D22B2B]/30"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/10 blur-[50px] rounded-full pointer-events-none"></div>

      {/* Icon */}
      <div className="relative z-10 w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
        <LegoHeadIcon mode={isLoggedIn ? "neutral" : "happy"} className="w-10 h-10" color={isLoggedIn ? "text-green-400" : "text-yellow-400"} />
      </div>

      {/* Main Copy */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
          {isLoggedIn ? t('LoggedInTitle') : t('LoggedOutTitle')}
        </h2>
        {!isLoggedIn && (
          <p className="text-[16px] md:text-[18px] font-bold text-gray-300 mt-4 max-w-xl mx-auto drop-shadow-sm">
            {t('LoggedOutDesc')}
          </p>
        )}
      </div>

      {/* CTA Button */}
      <div className="relative z-10 mt-6 mb-8 w-full md:w-auto">
        <Link 
          href={isLoggedIn ? "/koleksiyonum" : "/login"}
          className={`relative overflow-hidden inline-flex items-center justify-center font-black text-[13px] tracking-[0.15em] uppercase py-4 px-12 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(210,43,43,0.4)] group/btn w-full md:w-auto transform hover:-translate-y-1 ${isLoggedIn ? 'bg-green-600 text-white hover:bg-green-500 hover:shadow-[0_0_30px_rgba(22,163,74,0.6)]' : 'bg-[#D22B2B] text-white hover:bg-red-600 hover:shadow-[0_0_30px_rgba(210,43,43,0.6)]'}`}
        >
          <span className="relative z-10">{isLoggedIn ? t('BtnLoggedIn') : t('BtnLoggedOut')}</span>
          {/* Button shine effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
        </Link>
      </div>

      {/* Bonus Trust Copy */}
      <div className="relative z-10 flex items-center justify-center gap-4 text-[11px] md:text-[13px] font-bold text-gray-400 tracking-wide">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {t('Trust1')}
        </span>
        <span className="text-gray-600">•</span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {t('Trust2')}
        </span>
        <span className="text-gray-600">•</span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {t('Trust3')}
        </span>
      </div>
    </div>
  );
}
