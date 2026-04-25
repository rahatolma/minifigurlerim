import { useTranslations } from 'next-intl';

export default function TranslationFallbackBadge() {
  const t = useTranslations('Fallback');
  
  return (
    <div className="w-full bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-3 flex items-center justify-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
          <path d="M12 2v20"></path>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        <p className="text-xs sm:text-sm text-yellow-800 font-medium">
          {t('BadgeText')}
        </p>
      </div>
    </div>
  );
}
