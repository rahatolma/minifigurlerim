'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { submitContactFormClient } from '@/services/client_dal';

export default function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug'>('suggestion');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = new FormData(e.currentTarget);
    const data = {
      first_name: 'Geri',
      last_name: 'Bildirim',
      email: (form.get('cf_mail') as string) || 'anonim@minifigurlerim.com',
      subject: feedbackType === 'suggestion' ? 'Sistem Önerisi' : 'Hata Bildirimi',
      message: form.get('cf_msg') as string,
    };

    try {
      await submitContactFormClient(data);
      toast.success('Geri bildiriminiz için teşekkürler!');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error(err);
      toast.error('Gönderilirken hata oluştu: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-3">Geri Bildirim Gönder</h2>
        <p className="text-gray-600 text-[13px] font-medium leading-relaxed">
          Karşılaştığınız bir hatayı bildirin veya sistemin gelişmesi için önerinizi paylaşın.
        </p>
      </div>

      <form className="flex flex-col flex-1 gap-6" onSubmit={handleSubmit}>
        {/* Type Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setFeedbackType('suggestion')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-[13px] font-bold transition-all ${feedbackType === 'suggestion' ? 'bg-white text-[#D22B2B] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            Öneri
          </button>
          <button
            type="button"
            onClick={() => setFeedbackType('bug')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-[13px] font-bold transition-all ${feedbackType === 'bug' ? 'bg-white text-[#D22B2B] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Hata Bildir
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-bold text-gray-900">E-posta (İsteğe Bağlı)</label>
          <input 
            type="email" 
            name="cf_mail" 
            placeholder="Size ulaşabilmemiz için e-posta adresiniz..."
            className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-400 font-medium border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:bg-gray-50 transition-all text-[13px] shadow-sm" 
          />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[12px] font-bold text-gray-900">Mesajınız <span className="text-[#D22B2B]">*</span></label>
          <textarea 
            required 
            rows={5} 
            name="cf_msg" 
            placeholder={feedbackType === 'suggestion' ? "Örn: Şuraya şöyle bir metrik eklesek çok iyi olur..." : "Örn: Mobilden girince butonlar üst üste biniyor..."}
            className="w-full flex-1 px-4 py-3 bg-white text-gray-900 placeholder-gray-400 font-medium border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:bg-gray-50 transition-all resize-none text-[13px] shadow-sm" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black text-[13px] tracking-widest uppercase py-4 rounded-md transition-colors shadow-sm mt-2"
        >
            {isSubmitting ? 'GÖNDERİLİYOR...' : 'Gönder'}
        </button>
      </form>
    </div>
  )
}
