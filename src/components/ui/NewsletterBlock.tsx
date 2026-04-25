'use client';

import { useState } from 'react';
import { subscribeNewsletterClient } from '@/services/client_dal';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function NewsletterBlock() {
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
    <section className="bg-black text-white w-full rounded-lg overflow-hidden flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-10">
      <div className="w-full md:w-2/3 space-y-8">
        <h3 className="text-xl md:text-3xl font-extrabold leading-tight tracking-tight">
          {t('BlockTitle')}
        </h3>
        
        <form onSubmit={handleSubscribe} className="flex flex-col gap-4 max-w-xl">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('Placeholder')}
            required
            className="w-full px-6 py-4 rounded bg-white text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#D22B2B] text-white font-extrabold tracking-widest px-6 py-5 rounded uppercase hover:bg-[#B22222] transition-colors disabled:opacity-50"
          >
            {loading ? t('LoadingBtn') : t('SubmitBtn')}
          </button>
        </form>
      </div>

      <div className="w-full md:w-1/3 flex justify-center md:justify-end">
        <div className="relative w-64 h-64 md:w-80 md:h-80 mr-4">
          <img 
            src="/images/newsletter-lego.jpg" 
            alt="Newsletter Lego Banner" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
