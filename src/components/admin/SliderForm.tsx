'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ImagePlus, ChevronRight } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import Link from 'next/link';

type SliderFormProps = {
  initialData?: any;
  isEdit?: boolean;
};

export default function SliderForm({ initialData, isEdit }: SliderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    button1_text: initialData?.button1_text || '',
    button1_link: initialData?.button1_link || '',
    button2_text: initialData?.button2_text || '',
    button2_link: initialData?.button2_link || '',
    image_url: initialData?.image_url || '',
    is_active: initialData?.is_active ?? true,
    sort_order: initialData?.sort_order ?? 10,
    location: initialData?.location || 'top',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `sliders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('minifigure-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('minifigure-images').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Görsel başarıyla yüklendi.');
    } catch (error: any) {
console.error(error);
      toast.error('Resim Yükleme Hatası: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.image_url) return;
    try {
      const path = formData.image_url.split('/minifigure-images/')[1];
      if (path) {
        const { error } = await supabase.storage.from('minifigure-images').remove([path]);
        if (error) throw error;
      }
      setFormData(prev => ({ ...prev, image_url: '' }));
      toast.success('Görsel başarıyla silindi.');
    } catch (err: any) {
console.error(err);
      toast.error('Silme hatası: ' + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Başlık alanı zorunludur.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('home_sliders')
          .update(formData)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success("Slayt başarıyla güncellendi! 🎉");
      } else {
        const { error } = await supabase
          .from('home_sliders')
          .insert([formData]);
        if (error) throw error;
        toast.success("Yeni slayt kaydedildi! 🎉");
      }
      router.push('/admin/slaytlar');
    } catch (err: any) {
console.error(err);
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
            <Link href="/admin/slaytlar" className="hover:text-black transition-colors">KAPAKLAR (SLİDER)</Link>
            <ChevronRight size={14} />
            <span className="text-black">{isEdit ? 'SLAYT DÜZENLE' : 'YENİ SLAYT EKLE'}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sol Kolon */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border text-left border-gray-200 p-6 rounded-md shadow-sm mb-4">
             <h3 className="font-bold text-sm text-black mb-1">Arkaplan Görseli</h3>
             <p className="text-[11px] font-medium text-gray-500">Koyu tonlarda 1920x800 px veya üzeri büyüklükte bir görsel yüklemeniz önerilir.</p>
          </div>

          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden p-2 relative group">
             <label className="aspect-[21/9] bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer relative rounded border-2 border-dashed border-gray-200">
                {uploading ? (
                  <div className="flex flex-col items-center text-black">
                    <Loader2 size={24} className="animate-spin mb-2" />
                    <span className="text-[9px] font-black tracking-widest uppercase">YÜKLENİYOR...</span>
                  </div>
                ) : formData.image_url ? (
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover filter brightness-75 rounded" />
                ) : (
                  <>
                    <ImagePlus size={24} className="mb-2 group-hover:scale-110 group-hover:text-black transition-transform" />
                    <span className="text-[9px] font-black tracking-widest uppercase group-hover:text-black transition-colors">Tıkla ve Görsel Seç</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
             </label>
             {formData.image_url && (
                 <button type="button" onClick={handleRemoveImage} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors z-20" title="Görseli Sil">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
             )}
          </div>
        </div>

        {/* Sağ Kolon */}
        <div className="lg:col-span-8 pb-20">
          <form onSubmit={handleSave} className="space-y-0 w-full text-[13px] font-bold">
             
            <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-8 overflow-hidden">
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Büyük Başlık <span className="text-[#D22B2B]">*</span></label>
                </div>
                <div className="w-2/3 py-3 pr-4">
                    <textarea name="title" value={formData.title} onChange={handleChange} placeholder="Örn: Renkli dünyamıza hoş geldiniz!" required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30 resize-none h-16" />
                </div>
              </div>

              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Konum (Bölge)</label>
                </div>
                <div className="w-2/3 py-3 pr-4">
                    <select name="location" value={formData.location} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold appearance-none cursor-pointer">
                        <option value="top">Üst Slayt (Sayfa Başı - Hero)</option>
                        <option value="bottom">Alt Slayt (Haberler Altı)</option>
                    </select>
                </div>
              </div>

              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Alt Başlık (Açıklama)</label>
                </div>
                <div className="w-2/3 py-3 pr-4">
                    <textarea name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="Örn: Minifigür dünyasının kapılarını aralayın ve maceralarımıza katılın." className="w-full bg-transparent px-3 py-2 focus:outline-none text-gray-700 font-bold placeholder:font-medium placeholder:opacity-30 resize-none h-20" />
                </div>
              </div>

              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-[#D22B2B] block truncate font-black tracking-wide">Sol (Kırmızı) Buton Metni</label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="button1_text" type="text" value={formData.button1_text} onChange={handleChange} placeholder="Örn: Seriler veya Kataloğu Keşfet" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                </div>
              </div>

              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-[#D22B2B] block truncate font-black tracking-wide">Sol (Kırmızı) Buton Linki</label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="button1_link" type="text" value={formData.button1_link} onChange={handleChange} placeholder="Örn: /seriler" className="w-full bg-transparent px-3 py-2 focus:outline-none text-blue-500 font-bold placeholder:font-medium placeholder:opacity-30" />
                </div>
              </div>

              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Sağ (Şeffaf) Buton Metni</label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="button2_text" type="text" value={formData.button2_text} onChange={handleChange} placeholder="Örn: Figürler" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                </div>
              </div>

              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Sağ (Şeffaf) Buton Linki</label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="button2_link" type="text" value={formData.button2_link} onChange={handleChange} placeholder="Örn: /figurler" className="w-full bg-transparent px-3 py-2 focus:outline-none text-blue-500 font-bold placeholder:font-medium placeholder:opacity-30" />
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
                    <label className="text-gray-900 block truncate font-black tracking-wide cursor-pointer">Slayt Aktif Mi?</label>
                </div>
                <div className="w-2/3 py-3 px-3">
                    <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 accent-black cursor-pointer pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Save Button */}
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
    </div>
  );
}
