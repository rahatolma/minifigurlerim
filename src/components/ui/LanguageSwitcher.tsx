'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function onLanguageChange(newLocale: 'en' | 'tr') {
    startTransition(() => {
      if (!pathname) return;
      
      // We explicitly cast the routing object to the exact signature Next-Intl expects
      const routeArg = { pathname, params } as Parameters<typeof router.replace>[0];
      router.replace(routeArg, { locale: newLocale });
    });
  }

  return (
    <div className="flex items-center gap-2 text-sm font-bold bg-[#f4f4f4] rounded-full p-1 border border-gray-200">
      <button
        onClick={() => onLanguageChange('tr')}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-full transition-all ${
          locale === 'tr' 
            ? 'bg-white shadow-sm text-[#D22B2B]' 
            : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        TR
      </button>
      <button
        onClick={() => onLanguageChange('en')}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-full transition-all ${
          locale === 'en' 
            ? 'bg-white shadow-sm text-[#D22B2B]' 
            : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        EN
      </button>
    </div>
  );
}
