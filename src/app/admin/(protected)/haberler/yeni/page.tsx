'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ImagePlus, Loader2, Save } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { supabase } from '@/utils/supabase/client';
import { slugify } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { saveNewsData } from '@/app/admin/actions/news';

export default function NewNewsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [qualityReport, setQualityReport] = useState<{score: number, feedback: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'tr'|'en'>('tr');
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  
  const [imageUrls, setImageUrls] = useState({
    cover_image_url: null as string | null,
    cover_image_vertical_url: null as string | null,
  });
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    status: 'published',
    min_read: '1',
    title_en: '',
    summary_en: '',
    content_en: '',
    slug_en: '',
    meta_title_en: '',
    meta_description_en: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'cover_image_url' | 'cover_image_vertical_url') => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploadingField(fieldName);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `news/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('minifigure-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('minifigure-images').getPublicUrl(filePath);
      
      setImageUrls(prev => ({ ...prev, [fieldName]: publicUrl }));
    } catch (error: any) {
console.error(error);
      toast.error('Resim Yükleme Hatası: ' + error.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveImage = async (e: React.MouseEvent, fieldName: 'cover_image_url' | 'cover_image_vertical_url') => {
    e.preventDefault();
    e.stopPropagation();
    const url = imageUrls[fieldName];
    if (!url) return;
    try {
      const path = url.split('/minifigure-images/')[1];
      if (path) {
        const { error } = await supabase.storage.from('minifigure-images').remove([path]);
        if (error) throw error;
      }
      setImageUrls(prev => ({ ...prev, [fieldName]: null }));
    } catch (err: any) {
console.error(err);
      toast.error('Görsel silinirken hata: ' + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Lütfen Haber Başlığı alanını doldurun.");
      return;
    }
    
    setIsSubmitting(true);
    const generatedSlug = slugify(formData.title);
    
    try {
      const dbPayload = {
            slug: generatedSlug,
            title: formData.title,
            summary: formData.summary,
            content: formData.content,
            status: formData.status,
            min_read: formData.min_read ? parseInt(formData.min_read) : 1,
            cover_image_url: imageUrls.cover_image_url,
            cover_image_vertical_url: imageUrls.cover_image_vertical_url,
            title_en: formData.title_en,
            summary_en: formData.summary_en,
            content_en: formData.content_en,
            slug_en: formData.slug_en,
            meta_title_en: formData.meta_title_en,
            meta_description_en: formData.meta_description_en
      };
      
      const result = await saveNewsData(dbPayload, false);
      if (!result.success) throw new Error(result.error);

      toast.success(result.message);
      router.push('/admin/haberler');
    } catch (err: any) {
console.error(err);
      toast.error('Kayıt Hatası: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return toast.error("Taslak için TR Başlık ve İçerik girilmesi şarttır.");

    setIsGeneratingAI(true);
    const toastId = toast.loading('Yapay Zeka Haber Taslağını Hazırlıyor...', { duration: 15000 });
    
    try {
      const textsToTranslate = [
        formData.title,
        formData.summary,
        formData.content
      ];
      
      const seoData = { title: formData.title };

      const res = await fetch('/api/admin/translate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textsToTranslate, seoData })
      });

      if (!res.ok) throw new Error('API yanıt vermedi.');
      const data = await res.json();
      
      const [translatedTitle, translatedSummary, translatedContent, metaTitleEn, metaDescEn, slugEn] = data.translatedChunks;
      setQualityReport(data.qualityReport);

      setFormData(prev => ({
        ...prev,
        title_en: translatedTitle || prev.title_en,
        summary_en: translatedSummary || prev.summary_en,
        content_en: translatedContent || prev.content_en,
        meta_title_en: metaTitleEn || prev.meta_title_en,
        meta_description_en: metaDescEn || prev.meta_description_en,
        slug_en: slugEn ? slugify(slugEn) : prev.slug_en
      }));

      toast.success('İngilizce Haber Taslağı Başarıyla Oluşturuldu!', { id: toastId });
    } catch (err: any) {
console.error(err);
      toast.error('Yapay Zeka Hatası: ' + err.message, { id: toastId });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black pb-24">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full max-w-[1600px] mx-auto px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-500">
            <Link href="/admin/haberler" className="hover:text-black transition-colors">HABERLER</Link>
            <ChevronRight size={14} />
            <span className="text-black">YENİ HABER BAŞLIĞI OLUŞTUR</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sol Kolon: Çoklu Görsel Yükleme */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border text-left border-gray-200 p-6 rounded-md shadow-sm mb-4">
             <h3 className="font-bold text-sm text-black mb-1">Haber Görseli Yöneticisi</h3>
             <p className="text-[11px] font-medium text-gray-500">Bu haberin listelenmesinde ve detay sayfasında kullanılacak kapak görselini yükleyin.</p>
          </div>

          <div className="space-y-4">
             <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-[11px] font-black uppercase tracking-wider text-black">Yatay Kapak Görseli</p>
               </div>
               <div className="relative group">
                 <label className="aspect-[21/9] w-full bg-white flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer relative z-10">
                    {uploadingField === 'cover_image_url' ? (
                      <div className="flex flex-col items-center text-black">
                        <Loader2 size={24} className="animate-spin mb-2" />
                        <span className="text-[9px] font-black tracking-widest uppercase">YÜKLENİYOR...</span>
                      </div>
                    ) : imageUrls.cover_image_url ? (
                      <img src={imageUrls.cover_image_url} alt="Preview" className="w-full h-full object-cover border-none" />
                    ) : (
                      <>
                        <ImagePlus size={20} className="mb-2 group-hover:scale-110 group-hover:text-black transition-transform" />
                        <span className="text-[9px] font-black tracking-widest uppercase group-hover:text-black transition-colors">Tıkla ve Görsel Seç</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_image_url')} className="hidden" />
                 </label>

                 {imageUrls.cover_image_url && (
                   <button 
                     type="button" 
                     onClick={(e) => handleRemoveImage(e, 'cover_image_url')} 
                     className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors z-20"
                     title="Görseli Sil"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                 )}
               </div>
             </div>

             <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-wider text-black">Dikey Kapak Görseli (Opsiyonel)</p>
               </div>
               <div className="relative group">
                 <label className="aspect-[4/5] w-full bg-white flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer relative z-10">
                    {uploadingField === 'cover_image_vertical_url' ? (
                      <div className="flex flex-col items-center text-black">
                        <Loader2 size={24} className="animate-spin mb-2" />
                        <span className="text-[9px] font-black tracking-widest uppercase">YÜKLENİYOR...</span>
                      </div>
                    ) : imageUrls.cover_image_vertical_url ? (
                      <img src={imageUrls.cover_image_vertical_url} alt="Preview" className="w-full h-full object-cover border-none" />
                    ) : (
                      <>
                        <ImagePlus size={20} className="mb-2 group-hover:scale-110 group-hover:text-black transition-transform" />
                        <span className="text-[9px] font-black tracking-widest uppercase group-hover:text-black transition-colors">Tıkla ve Görsel Seç</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_image_vertical_url')} className="hidden" />
                 </label>

                 {imageUrls.cover_image_vertical_url && (
                   <button 
                     type="button" 
                     onClick={(e) => handleRemoveImage(e, 'cover_image_vertical_url')} 
                     className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors z-20"
                     title="Görseli Sil"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   </button>
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* Sağ Kolon: Form Verileri */}
        <div className="lg:col-span-8 pb-20">
          <form onSubmit={handleSave} className="space-y-0 w-full text-[13px] font-bold">
             
            <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-8 overflow-hidden">
               {/* Evrensel Alanlar (Tüm diller için ortak) */}
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">EVRENSEL ALANLAR (ORTAK)</span>
              </div>
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Durum</label>
                </div>
                <div className="w-2/3 py-3">
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold appearance-none cursor-pointer">
                        <option value="published">Yayında</option>
                        <option value="draft">Taslak (Gizli)</option>
                    </select>
                </div>
              </div>

              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Tahmini Okuma Süresi (Dk)</label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="min_read" type="number" value={formData.min_read} onChange={handleChange} placeholder="Örn: 3" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                </div>
              </div>
            </div>

            {/* DİL BAZLI İÇERİKLER */}
            <div className="mb-4 flex gap-2 border-b border-gray-200">
              <button 
                type="button" 
                onClick={() => setActiveTab('tr')} 
                className={`px-6 py-3 font-black text-xs uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'tr' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                🇹🇷 TÜRKÇE İÇERİK (KAYNAK)
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('en')} 
                className={`px-6 py-3 font-black text-xs uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'en' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-gray-400 hover:text-black'}`}>
                🇺🇸 İNGİLİZCE İÇERİK (ÇEVİRİ)
              </button>
            </div>

            {activeTab === 'tr' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-8 overflow-hidden">
                  <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                        <label className="text-gray-900 block truncate font-black tracking-wide">Haber Başlığı (TR) <span className="text-[#D22B2B]">*</span></label>
                    </div>
                    <div className="w-2/3 py-3">
                        <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Örn: LEGO Collectible Minifigures Series 26 Geliyor!" required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                    </div>
                  </div>
                  <div className="flex border-b border-gray-100 items-start hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 pt-6 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                      <label className="text-gray-900 block font-black tracking-wide">Kart Özeti (TR)</label>
                    </div>
                    <div className="w-2/3 py-4">
                        <textarea name="summary" value={formData.summary} onChange={handleChange} rows={3} placeholder="Örn: Bu seride bizi Space, Castle ve Town temalarından yepyeni figürler bekliyor..." className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30 resize-none"></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-md shadow-sm mb-8 border border-gray-200">
                   <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between rounded-t-md">
                      <div>
                        <h3 className="font-black tracking-wider uppercase text-black text-xs md:text-sm">Haber Ana Metni (TR)</h3>
                        <p className="text-[10px] md:text-[11px] font-medium text-gray-500 mt-1">Haberin detayında okunacak olan zenginleştirilmiş içerik</p>
                      </div>
                   </div>
                   <div className="p-0 rounded-b-md">
                      <RichTextEditor value={formData.content} onChange={(html) => setFormData(p => ({...p, content: html}))} />
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'en' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-md shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <h3 className="font-bold text-sm text-blue-900">Otomatik İngilizce Taslak & Kalite Kontrol</h3>
                       {qualityReport && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${qualityReport.score >= 90 ? 'bg-green-100 text-green-700' : qualityReport.score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            SKOR: {qualityReport.score}/100
                          </span>
                       )}
                     </div>
                     
                     {!qualityReport ? (
                        <p className="text-[11px] font-medium text-blue-700">TÜRKÇE içeriği "Collector Tone" kurallarıyla optimize ederek profesyonel İngilizceye çevirin.</p>
                     ) : (
                        <p className="text-[11px] font-medium text-blue-700 max-w-2xl">
                          <span className="font-bold text-blue-900">AI Kalite Denetçisi:</span> {qualityReport.feedback}
                        </p>
                     )}
                   </div>
                   <button 
                     type="button" 
                     onClick={handleAIGenerate}
                     disabled={isGeneratingAI}
                     className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md text-[11px] font-black tracking-widest uppercase transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                   >
                     {isGeneratingAI ? <><Loader2 size={16} className="animate-spin" /> ÜRETİLİYOR...</> : "✨ REWRITE & TASLAK ÜRET"}
                   </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-8 overflow-hidden">
                  <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                        <label className="text-gray-900 block truncate font-black tracking-wide">Haber Başlığı (EN)</label>
                    </div>
                    <div className="w-2/3 py-3">
                        <input name="title_en" type="text" value={formData.title_en} onChange={handleChange} placeholder="Orn: LEGO Collectible Minifigures Series 26 is Coming!" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                    </div>
                  </div>
                  <div className="flex border-b border-gray-100 items-start hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 pt-6 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                      <label className="text-gray-900 block font-black tracking-wide">Kart Özeti (EN)</label>
                    </div>
                    <div className="w-2/3 py-4">
                        <textarea name="summary_en" value={formData.summary_en} onChange={handleChange} rows={3} placeholder="..." className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30 resize-none"></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-md shadow-sm mb-8 border border-gray-200">
                   <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between rounded-t-md">
                      <div>
                        <h3 className="font-black tracking-wider uppercase text-black text-xs md:text-sm">Haber Ana Metni (EN)</h3>
                        <p className="text-[10px] md:text-[11px] font-medium text-gray-500 mt-1">Yapay zekanın hazırladığı çeviriyi kontrol edin ve düzeltin</p>
                      </div>
                   </div>
                   <div className="p-0 rounded-b-md">
                      <RichTextEditor value={formData.content_en} onChange={(html) => setFormData(p => ({...p, content_en: html}))} />
                   </div>
                </div>
                
                {/* SEO BÖLÜMÜ */}
                <div className="bg-white border border-gray-200 rounded-md shadow-sm mt-8 overflow-hidden">
                   <div className="bg-[#111] px-6 py-4 flex items-center justify-between">
                     <h3 className="font-black text-white text-xs tracking-widest uppercase">Global SEO Yöneticisi</h3>
                     <span className="text-[10px] text-gray-400">Yapay Zeka Destekli</span>
                   </div>
                   
                   <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                     <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                         <label className="text-gray-900 block truncate font-black tracking-wide">SEO Slug (URL Ucu)</label>
                         <p className="text-[10px] text-gray-500 mt-1">/en/news/... kısmı</p>
                     </div>
                     <div className="w-2/3 py-3">
                         <input name="slug_en" type="text" value={formData.slug_en} onChange={handleChange} placeholder="Örn: lego-minifigures-series-27" className="w-full bg-transparent px-3 py-2 text-black font-semibold text-[13px] border-b border-gray-200 focus:border-black transition-colors focus:outline-none" />
                     </div>
                   </div>

                   <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                     <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                         <label className="text-gray-900 block truncate font-black tracking-wide">SEO Meta Title</label>
                         <p className="text-[10px] text-gray-500 mt-1">Maks. 60 Karakter</p>
                     </div>
                     <div className="w-2/3 py-3">
                         <input name="meta_title_en" type="text" value={formData.meta_title_en} onChange={handleChange} placeholder="Örn: LEGO Series 27 | Minifigürlerim" className="w-full bg-transparent px-3 py-2 text-black font-semibold text-[13px] border-b border-gray-200 focus:border-black transition-colors focus:outline-none" />
                     </div>
                   </div>

                   <div className="flex border-b border-gray-100 items-start hover:bg-gray-50 transition-colors group">
                     <div className="w-1/3 pt-6 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                         <label className="text-gray-900 block truncate font-black tracking-wide">SEO Meta Description</label>
                         <p className="text-[10px] text-gray-500 mt-1">Google aramalarında gözüken 160 karakterlik özet.</p>
                     </div>
                     <div className="w-2/3 py-4">
                         <textarea name="meta_description_en" value={formData.meta_description_en} onChange={handleChange} rows={3} placeholder="Discover the highly anticipated LEGO Minifigures Series 27." className="w-full bg-transparent px-3 py-2 text-black font-semibold text-[13px] border border-gray-200 focus:border-black transition-colors focus:outline-none rounded-sm resize-none"></textarea>
                     </div>
                   </div>
                </div>

              </div>
            )}

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
                  <><Save size={16} /> HABERİ YAYINLA</>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
