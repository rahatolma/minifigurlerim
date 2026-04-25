'use client';

import { triggerLegalModal } from '@/components/ui/LegalNoticeModal';
import { useTranslations } from 'next-intl';

export default function LegalNoticeButton({ className, text }: { className?: string, text?: string }) {
  const t = useTranslations('Navigation');
  return (
    <button 
      onClick={triggerLegalModal}
      className={className || "bg-[#D22B2B] text-white font-bold py-3 px-8 rounded-md hover:bg-[#B22222] transition-colors mt-6 md:mt-0 tracking-wide text-sm"}
    >
      {text || t('LegalNotice')}
    </button>
  );
}
