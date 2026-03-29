'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ChevronRight } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import Link from 'next/link';

type FaqFormProps = {
  initialData?: any;
  isEdit?: boolean;
};

export default function FaqForm({ initialData, isEdit }: FaqFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    sort_order: initialData?.sort_order ?? 10,
    is_active: initialData?.is_active ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      toast.error("Soru ve Cevap alanları zorunludur.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('faqs')
          .update(formData)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success("Soru başarıyla güncellendi! 🎉");
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([formData]);
        if (error) throw error;
        toast.success("Yeni soru eklendi! 🎉");
      }
      router.push('/admin/sss');
    } catch (err: any) {
      toast.error("Kayıt Hatası: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black pb-24">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full max-w-[1600px] mx-auto px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-500">
            <Link href="/admin/sss" className="hover:text-black transition-colors">SIKÇA SORUYORLAR</Link>
            <ChevronRight size={14} />
            <span className="text-black">{isEdit ? 'SORU DÜZENLE' : 'YENİ SORU EKLE'}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-12 mt-12 pb-20">
        <form onSubmit={handleSave} className="space-y-0 w-full text-[13px] font-bold">
            
          <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-8 overflow-hidden">
            <div className="flex border-b border-gray-100 items-start hover:bg-gray-50 transition-colors group pb-2 pt-2">
              <div className="w-1/3 py-3 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                  <label className="text-gray-900 block truncate font-black tracking-wide mt-2">Soru Başlığı <span className="text-[#D22B2B]">*</span></label>
              </div>
              <div className="w-2/3 py-3 pr-4">
                  <textarea name="question" value={formData.question} onChange={handleChange} placeholder="Örn: Siparişim ne zaman kargoya verilir?" required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30 resize-y min-h-16" />
              </div>
            </div>

            <div className="flex border-b border-gray-100 items-start hover:bg-gray-50 transition-colors group pb-2 pt-2">
              <div className="w-1/3 py-3 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                  <label className="text-gray-900 block truncate font-black tracking-wide mt-2">Cevap (Açıklama) <span className="text-[#D22B2B]">*</span></label>
              </div>
              <div className="w-2/3 py-3 pr-4">
                  <textarea name="answer" value={formData.answer} onChange={handleChange} placeholder="Örn: Siparişleriniz aynı gün kargoya teslim edilmektedir." required className="w-full bg-transparent px-3 py-2 focus:outline-none text-gray-700 font-bold placeholder:font-medium placeholder:opacity-30 resize-y min-h-24" />
              </div>
            </div>

            <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
              <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                  <label className="text-gray-900 block truncate font-black tracking-wide">Sıralama</label>
              </div>
              <div className="w-2/3 py-3">
                  <input name="sort_order" type="number" value={formData.sort_order} onChange={handleChange} className="w-32 bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                  <span className="text-[10px] text-gray-400 font-normal italic ml-2">Küçük numara önce gösterilir.</span>
              </div>
            </div>

            <div className="flex items-center hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setFormData(prev => ({...prev, is_active: !prev.is_active}))}>
              <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                  <label className="text-gray-900 block truncate font-black tracking-wide cursor-pointer">Soru Aktif Mi?</label>
              </div>
              <div className="w-2/3 py-3 px-3">
                  <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 accent-black cursor-pointer pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-[#D22B2B] disabled:bg-gray-400 transition-colors px-16 py-5 text-[11px] font-black tracking-widest uppercase rounded-sm flex items-center gap-3 w-full md:w-auto justify-center shadow-lg duration-300"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> KAYDEDİLİYOR...</>
              ) : (
                <><Save size={16} /> BİLGİLERİ KAYDET</>
              )}
            </button>
          </div>
          
        </form>
      </div>

    </div>
  );
}
