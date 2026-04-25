'use client';

import { useState } from 'react';
import { subscribeNewsletterClient } from '@/services/client_dal';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function FooterNewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Newsletter');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await subscribeNewsletterClient(email);
      toast.success(t('SuccessMsg'));
      setEmail('');
    } catch (err: any) {
      console.error(err);
      if (err.code === '23505') {
        toast.success(t('AlreadySubscribedMsg'));
      } else {
        toast.error(t('ErrorMsg') + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col gap-5 mt-4 w-full">
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('Placeholder')}
        required
        className="w-full border-b border-gray-300 py-2 text-[13px] font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 transition-colors bg-transparent"
      />
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#D22B2B] text-white font-extrabold tracking-widest py-3 mt-1 rounded-sm uppercase hover:bg-[#B22222] transition-colors disabled:opacity-50 text-[11px] shadow-sm"
      >
        {loading ? t('LoadingBtn') : t('SubmitBtn')}
      </button>
    </form>
  );
}
