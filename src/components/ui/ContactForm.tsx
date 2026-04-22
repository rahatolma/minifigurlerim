'use client';

import { useState } from 'react';
import { submitContactFormClient } from '@/services/client_dal';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    
    // Uncontrolled form'dan özel isimli (anti-autofill) alanları alıp veritabanı stiline mapliyoruz
    const form = new FormData(e.currentTarget);
    const data = {
      first_name: form.get('cf_fname') as string,
      last_name: form.get('cf_lname') as string,
      email: form.get('cf_mail') as string,
      subject: form.get('cf_subj') as string,
      message: form.get('cf_msg') as string,
    };

    try {
      await submitContactFormClient(data);
      
      toast.success('Mesajınız başarıyla iletildi. En kısa sürede dönüş yapacağız!');
      
      // Native DOM reset to clear inputs
      (e.target as HTMLFormElement).reset();

    } catch (err: any) {
console.error(err);
      toast.error('Mesaj gönderilirken hata oluştu: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col flex-1 gap-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-white/90">Adınız <span className="text-[#D22B2B]">*</span></label>
                <input required type="text" name="cf_fname" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" className="w-full px-4 py-3 bg-[#1A1A1A] text-white font-medium border border-gray-800 rounded-md focus:outline-none focus:border-gray-500 focus:bg-[#222] transition-colors shadow-inner text-[13px]" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-white/90">Soyadınız <span className="text-[#D22B2B]">*</span></label>
                <input required type="text" name="cf_lname" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" className="w-full px-4 py-3 bg-[#1A1A1A] text-white font-medium border border-gray-800 rounded-md focus:outline-none focus:border-gray-500 focus:bg-[#222] transition-colors shadow-inner text-[13px]" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-white/90">E-Posta Adresiniz <span className="text-[#D22B2B]">*</span></label>
                <input required type="email" name="cf_mail" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" className="w-full px-4 py-3 bg-[#1A1A1A] text-white font-medium border border-gray-800 rounded-md focus:outline-none focus:border-gray-500 focus:bg-[#222] transition-colors shadow-inner text-[13px]" />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-white/90">Konu</label>
                <input type="text" name="cf_subj" autoComplete="new-password" data-lpignore="true" data-1p-ignore="true" className="w-full px-4 py-3 bg-[#1A1A1A] text-white font-medium border border-gray-800 rounded-md focus:outline-none focus:border-gray-500 focus:bg-[#222] transition-colors shadow-inner text-[13px]" />
            </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
            <label className="text-[13px] font-bold text-white/90">Mesajınız <span className="text-[#D22B2B]">*</span></label>
            <textarea required rows={7} name="cf_msg" className="w-full flex-1 px-4 py-3 bg-[#1A1A1A] text-white font-medium border border-gray-800 rounded-md focus:outline-none focus:border-gray-500 focus:bg-[#222] transition-colors shadow-inner resize-none text-[13px]" />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#fce01a] hover:bg-[#eacc0b] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-black text-[13px] tracking-widest uppercase py-4 rounded-md transition-colors mt-2 shadow-[0_8px_20px_rgba(252,224,26,0.2)]"
        >
            {isSubmitting ? 'GÖNDERİLİYOR...' : 'GÖNDER'}
        </button>
    </form>
  )
}
