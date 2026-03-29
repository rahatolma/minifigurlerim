'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export default function NewsletterBlock() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          toast.success('Zaten abonelik kaydınız bulunuyor! Yeniden göndermenize gerek yok 🚀');
        } else {
          throw error;
        }
      } else {
        toast.success('Bültene başarıyla abone oldunuz! Sizi bilgilendirmeye devam edeceğiz.');
        setEmail('');
      }
    } catch (err: any) {
      toast.error('Kayıt olurken bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-black text-white w-full rounded-lg overflow-hidden flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-10">
      <div className="w-full md:w-2/3 space-y-8">
        <h3 className="text-xl md:text-3xl font-extrabold leading-tight tracking-tight">
          Son çıkan mini figürleri ve güncel haberleri yakından takip etmek istiyorsanız e-mail haber grubuna abone olun!
        </h3>
        
        <form onSubmit={handleSubscribe} className="flex flex-col gap-4 max-w-xl">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Lütfen e-posta adresinizi giriniz... *"
            required
            className="w-full px-6 py-4 rounded bg-white text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#D22B2B] text-white font-extrabold tracking-widest px-6 py-5 rounded uppercase hover:bg-[#B22222] transition-colors disabled:opacity-50"
          >
            {loading ? 'KAYDEDİLİYOR...' : 'ABONE OLUN!'}
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
