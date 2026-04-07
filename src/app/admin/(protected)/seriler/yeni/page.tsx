'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ImagePlus, Loader2, Save, Wand2 } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { supabase } from '@/utils/supabase/client';
import { slugify } from '@/utils/helpers';
import BlockEditor from '@/components/admin/blocks/BlockEditor';
import { AnyContentBlock } from '@/types/content-blocks';
import toast from 'react-hot-toast';

export default function NewSeriesPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [imageUrls, setImageUrls] = useState({
    cover_image_url: null as string | null, // 1. Kart Görseli
    hero_image_url: null as string | null,  // 2. Büyük Hero/Slayt
  });
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    series_no: '',
    brand: 'LEGO®',
    figure_count: '',
    release_month: '',
    release_year: '',
    rarity: 'Yaygın',
    content_blocks: [] as AnyContentBlock[],
    title_en: '',
    content_blocks_en: [] as AnyContentBlock[]
  });

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').eq('type', 'seri_kategori').order('name');
      if (data) {
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0].name }));
        }
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof imageUrls) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploadingField(fieldName);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `series/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('minifigure-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('minifigure-images').getPublicUrl(filePath);
      
      setImageUrls(prev => ({ ...prev, [fieldName]: publicUrl }));
    } catch (error: any) {
      alert('Resim Yükleme Hatası: ' + error.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveImage = async (e: React.MouseEvent, fieldName: keyof typeof imageUrls) => {
    e.preventDefault();
    e.stopPropagation();
    const url = (imageUrls as any)[fieldName];
    if (!url) return;
    try {
      const path = url.split('/minifigure-images/')[1];
      if (path) {
        const { error } = await supabase.storage.from('minifigure-images').remove([path]);
        if (error) throw error;
      }
      setImageUrls(prev => ({ ...prev, [fieldName]: null }));
    } catch (err: any) {
      alert('Görsel silinirken hata: ' + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Lütfen Seri Adı alanını doldurun.");
      return;
    }
    if (!formData.brand) {
      toast.error("Lütfen Marka alanını doldurun.");
      return;
    }
    if (!formData.series_no) {
      toast.error("Lütfen Seri No alanını doldurun.");
      return;
    }
    if (!formData.category) {
      toast.error("Lütfen Kategori seçin.");
      return;
    }
    
    setIsSubmitting(true);
    const generatedSlug = slugify(`${formData.title} ${formData.category}`);
    
    try {
      const { error } = await supabase
        .from('series')
        .insert([
          {
            slug: generatedSlug,
            title: formData.title,
            category: formData.category,
            series_no: formData.series_no,
            brand: formData.brand,
            figure_count: formData.figure_count ? parseInt(formData.figure_count) : null,
            release_month: formData.release_month,
            release_year: formData.release_year,
            rarity: formData.rarity,
            cover_image_url: imageUrls.cover_image_url,
            hero_image_url: imageUrls.hero_image_url,
            content_blocks: formData.content_blocks,
            title_en: formData.title_en,
            description_blocks_en: formData.content_blocks_en
          }
        ]);

      if (error) throw error;
      alert('Seri başarıyla kaydedildi! 🎉');
      router.push('/admin/seriler');
    } catch (err: any) {
      alert('Kayıt Hatası: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAITranslate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.title && formData.content_blocks.length === 0) {
      toast.error("Önce çevrilecek içerik giriniz (Türkçe)!");
      return;
    }
    
    setIsTranslating(true);
    const translationPromise = fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        texts: [
          formData.title,
          JSON.stringify(formData.content_blocks)
        ], 
        targetLang: 'en' 
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.error && !data.simulated) throw new Error(data.error);
      
      const newTitleEn = data.translations[0];
      let newBlocksEn = [];
      try {
        newBlocksEn = JSON.parse(data.translations[1] || '[]');
      } catch (err) {
        console.warn("Could not parse translated JSON content", err);
      }
      
      setFormData(prev => ({ 
        ...prev, 
        title_en: newTitleEn, 
        content_blocks_en: newBlocksEn 
      }));
      
      return data;
    });

    toast.promise(
      translationPromise,
      {
        loading: 'LEGO Uzmanımız Çeviriyor...',
        success: (data) => data.simulated ? 'SİMÜLASYON: Başarıyla çevrildi!' : '🤖 Çeviri başarıyla tamamlandı!',
        error: (err) => `Çeviri Hatası: ${err.message}`
      }
    );

    translationPromise.finally(() => setIsTranslating(false));
  };

  const imageUploadBoxes = [
    { id: 'hero_image_url', title: 'HERO (SLIDE) GÖRSELİ', desc: 'Detay sayfasının en üstündeki devasa arkaplan görseli.' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black pb-24">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full max-w-[1600px] mx-auto px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-500">
            <Link href="/admin/seriler" className="hover:text-black transition-colors">SERİLER</Link>
            <ChevronRight size={14} />
            <span className="text-black">YENİ SERİ TANIMLAMA</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sol Kolon: Çoklu Görsel Yükleme */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border text-left border-gray-200 p-6 rounded-md shadow-sm mb-4">
             <h3 className="font-bold text-sm text-black mb-1">Seri Medya Yöneticisi</h3>
             <p className="text-[11px] font-medium text-gray-500">Bu serinin detay sayfasında kullanılacak tüm görselleri eksiksiz yükleyin.</p>
          </div>

          <div className="space-y-4">
            {imageUploadBoxes.map((box) => (
               <div key={box.id} className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                 <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-[11px] font-black uppercase tracking-wider text-black">{box.title}</p>
                    <p className="text-[10px] font-medium text-gray-500">{box.desc}</p>
                 </div>
                 <div className="relative group">
                   <label className="aspect-[2/1] w-full bg-white flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer relative z-10">
                      {uploadingField === box.id ? (
                        <div className="flex flex-col items-center text-black">
                          <Loader2 size={24} className="animate-spin mb-2" />
                          <span className="text-[9px] font-black tracking-widest uppercase">YÜKLENİYOR...</span>
                        </div>
                      ) : (imageUrls as any)[box.id] ? (
                        <img src={(imageUrls as any)[box.id]} alt="Preview" className="w-full h-full object-contain mix-blend-multiply border-none" />
                      ) : (
                        <>
                          <ImagePlus size={20} className="mb-2 group-hover:scale-110 group-hover:text-black transition-transform" />
                          <span className="text-[9px] font-black tracking-widest uppercase group-hover:text-black transition-colors">Tıkla ve Görsel Seç</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, box.id as any)} className="hidden" />
                   </label>

                   {(imageUrls as any)[box.id] && (
                     <button 
                       type="button" 
                       onClick={(e) => handleRemoveImage(e, box.id as keyof typeof imageUrls)} 
                       className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors z-20"
                       title="Görseli Sil"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </button>
                   )}
                 </div>
               </div>
            ))}
          </div>
        </div>

        {/* Sağ Kolon: Form Verileri */}
        <div className="lg:col-span-8 pb-20">
          <form onSubmit={handleSave} className="space-y-0 w-full text-[13px] font-bold">
             
            <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-8 overflow-hidden">
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Seri Adı (Title) <span className="text-[#D22B2B]">*</span></label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Örn: LEGO® Minifigürler Serisi 27" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                </div>
              </div>

              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Marka <span className="text-[#D22B2B]">*</span></label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="brand" type="text" value={formData.brand} onChange={handleChange} placeholder="Örn: LEGO®" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                </div>
              </div>
              
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Seri No <span className="text-[#D22B2B]">*</span></label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="series_no" type="text" value={formData.series_no} onChange={handleChange} placeholder="Örn: 71050" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                </div>
              </div>

              {/* Kategori Seçim Alanı (Dinamik) */}
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Seri Kategorisi <span className="text-[#D22B2B]">*</span></label>
                </div>
                <div className="w-2/3 py-3">
                    {categories.length === 0 ? (
                        <span className="px-3 text-red-500 font-bold">Önce Ayarlardan Kategori Ekleyin!</span>
                    ) : (
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold appearance-none cursor-pointer">
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    )}
                </div>
              </div>

              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Figür Sayısı</label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="figure_count" type="number" value={formData.figure_count} onChange={handleChange} placeholder="Örn: 12" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                </div>
              </div>

              {/* Çıkış Tarihi Ay */}
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Çıkış Tarihi (Ay)</label>
                </div>
                <div className="w-2/3 py-3">
                    <select name="release_month" value={formData.release_month} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold appearance-none cursor-pointer">
                        <option value="">Seçiniz</option>
                        {['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
              </div>
              
              {/* Çıkış Tarihi Yıl */}
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Çıkış Tarihi (Yıl)</label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="release_year" type="number" value={formData.release_year} onChange={handleChange} placeholder="Örn: 2025" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                </div>
              </div>
              
              {/* Nadirlik */}
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Nadirlik Derecesi</label>
                </div>
                <div className="w-2/3 py-3">
                    <select name="rarity" value={formData.rarity} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold appearance-none cursor-pointer">
                        <option value="Yaygın">Yaygın</option>
                        {['Nadir', 'Çok Nadir', 'Sınırlı Üretim', 'Özel Sürüm'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
              </div>
            </div>
            
            {/* Modüler İçerik Blokları Editörü */}
            <div className="bg-transparent border-t border-gray-200 pt-8 mt-8">
               <div className="mb-6 flex flex-col">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">İçerik Blokları Yöneticisi</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Serinin detay sayfasında sergilenecek içerikleri modüler bloklar kullanarak oluşturun.</p>
               </div>
               
               <BlockEditor 
                  blocks={formData.content_blocks} 
                  onChange={(newBlocks) => setFormData(prev => ({ ...prev, content_blocks: newBlocks }))} 
               />
            </div>

            {/* Translate Button & Save Button */}
            <div className="mt-12 flex items-center justify-end gap-4">
              
              <button 
                type="button" 
                onClick={handleAITranslate}
                disabled={isTranslating}
                className="bg-[#FFE5B4] text-[#D22B2B] border border-[#ffdb99] hover:bg-[#ffdb99] disabled:opacity-50 transition-colors px-10 py-5 text-[11px] font-black tracking-widest uppercase rounded-sm flex items-center gap-3 w-full md:w-auto justify-center shadow-sm duration-300"
              >
                {isTranslating ? (
                  <><Loader2 size={16} className="animate-spin" /> ÇEVRİLİYOR...</>
                ) : (
                  <><Wand2 size={16} /> 🤖 OTOMATİK ÇEVİR (EN)</>
                )}
              </button>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-[#D22B2B] disabled:bg-gray-400 transition-colors px-16 py-5 text-[11px] font-black tracking-widest uppercase rounded-sm flex items-center gap-3 w-full md:w-auto justify-center shadow-lg duration-300"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> KAYDEDİLİYOR...</>
                ) : (
                  <><Save size={16} /> SERİYİ KAYDET</>
                )}
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}
