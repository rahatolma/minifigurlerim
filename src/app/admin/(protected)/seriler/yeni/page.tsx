'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ImagePlus, Loader2, Save } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { supabase } from '@/utils/supabase/client';
import { slugify } from '@/utils/helpers';
import BlockEditor from '@/components/admin/blocks/BlockEditor';
import { AnyContentBlock } from '@/types/content-blocks';
import { saveSeriesData } from '@/app/cto/actions/series';
import toast from 'react-hot-toast';

export default function NewSeriesPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [qualityReport, setQualityReport] = useState<{score: number, feedback: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'tr'|'en'>('tr');
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
    manual_rarity: 'Yaygın',
    content_blocks: [] as AnyContentBlock[],
    title_en: '',
    content_blocks_en: [] as AnyContentBlock[],
    slug_en: '',
    meta_title_en: '',
    meta_description_en: ''
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
    const generatedSlug = slugify(formData.title);
    
    try {
      const dbPayload = {
          slug: generatedSlug,
          title: formData.title,
          category: formData.category,
          series_no: formData.series_no,
          brand: formData.brand,
          figure_count: formData.figure_count ? parseInt(formData.figure_count) : null,
          release_month: formData.release_month,
          release_year: formData.release_year,
          cover_image_url: imageUrls.cover_image_url,
          hero_image_url: imageUrls.hero_image_url,
          content_blocks: formData.content_blocks,
          title_en: formData.title_en,
          description_blocks_en: formData.content_blocks_en,
          slug_en: formData.slug_en,
          meta_title_en: formData.meta_title_en,
          meta_description_en: formData.meta_description_en,
          en_translation_status: undefined // New items start missing or queued
      };
      
      const result = await saveSeriesData(dbPayload, false);
      if (!result.success) throw new Error(result.error);

      toast.success(result.message);
      router.push('/admin/seriler');
    } catch (err: any) {
      toast.error('Kayıt Hatası: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Taslak için TR Seri Adı girilmesi şarttır.");

    setIsGeneratingAI(true);
    const toastId = toast.loading('Yapay Zeka Taslağı Hazırlıyor...', { duration: 15000 });
    
    try {
      const textsToTranslate = [
        formData.title,
        JSON.stringify(formData.content_blocks)
      ];
      
      const seoData = { title: formData.title };

      const res = await fetch('/api/admin/translate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textsToTranslate, seoData })
      });

      if (!res.ok) throw new Error('API yanıt vermedi.');
      const data = await res.json();
      
      // Since we appended 3 SEO queries, we expect 2 text blocks + 3 SEO blocks = 5 bounds
      const [translatedTitle, translatedBlocksStr, metaTitleEn, metaDescEn, slugEn] = data.translatedChunks;
      let translatedBlocks = [];
      try {
        translatedBlocks = JSON.parse(translatedBlocksStr);
      } catch(e) {
        console.error("JSON parse error from AI:", e);
        translatedBlocks = formData.content_blocks; 
      }
      setQualityReport(data.qualityReport);

      setFormData(prev => ({
        ...prev,
        title_en: translatedTitle || prev.title_en,
        content_blocks_en: translatedBlocks,
        meta_title_en: metaTitleEn || prev.meta_title_en,
        meta_description_en: metaDescEn || prev.meta_description_en,
        slug_en: slugEn ? slugify(slugEn) : prev.slug_en
      }));

      toast.success('İngilizce Taslak Başarıyla Oluşturuldu!', { id: toastId });
    } catch (err: any) {
      toast.error('Yapay Zeka Hatası: ' + err.message, { id: toastId });
    } finally {
      setIsGeneratingAI(false);
    }
  };



  const imageUploadBoxes = [
    { id: 'cover_image_url', title: 'KAPAK GÖRSELİ', desc: 'Liste ve arama sonuçlarında görünecek kare görsel.' },
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
               {/* Evrensel Alanlar (Tüm diller için ortak) */}
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">EVRENSEL ALANLAR (ORTAK)</span>
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
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                 <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Çıkış Tarihi (Yıl)</label>
                 </div>
                 <div className="w-2/3 py-3">
                    <input name="release_year" type="number" value={formData.release_year} onChange={handleChange} placeholder="Örn: 2025" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                 </div>
              </div>
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                 <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Nadirlik Derecesi (Manual)</label>
                    <p className="text-[10px] text-gray-500 mt-1">Seçtiğiniz bu değer "Sınırlı Üretim" gibi bir istisna değilse arka plandaki algoritma tarafından ezilebilir.</p>
                 </div>
                 <div className="w-2/3 py-3">
                    <select name="manual_rarity" value={formData.manual_rarity} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold appearance-none cursor-pointer">
                        <option value="Yaygın">Yaygın</option>
                        {['Nadir', 'Çok Nadir', 'Sınırlı Üretim', 'Özel Üretim', 'Özel Sürüm'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
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
                   <div className="flex items-center group">
                     <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                         <label className="text-gray-900 block truncate font-black tracking-wide">Seri Adı (TR) <span className="text-[#D22B2B]">*</span></label>
                     </div>
                     <div className="w-2/3 py-3">
                         <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Örn: LEGO® Minifigürler Serisi 27" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                     </div>
                   </div>
                </div>
                
                <div className="bg-transparent pt-4">
                   <div className="mb-6 flex flex-col">
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">İçerik Blokları Yöneticisi (TR)</h3>
                      <p className="text-xs text-gray-500 font-semibold mt-1">Türkçe içerikleri modüler bloklar kullanarak oluşturun.</p>
                   </div>
                   
                   <BlockEditor 
                      blocks={formData.content_blocks} 
                      onChange={(newBlocks) => setFormData(prev => ({ ...prev, content_blocks: newBlocks }))} 
                   />
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
                   <div className="flex items-center group">
                     <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                         <label className="text-gray-900 block truncate font-black tracking-wide">Seri Adı (EN)</label>
                     </div>
                     <div className="w-2/3 py-3">
                         <input name="title_en" type="text" value={formData.title_en} onChange={handleChange} placeholder="Örn: LEGO® Minifigures Series 27" className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                     </div>
                   </div>
                </div>

                <div className="bg-transparent pt-4">
                   <div className="mb-6 flex flex-col">
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">İçerik Blokları Yöneticisi (EN)</h3>
                      <p className="text-xs text-gray-500 font-semibold mt-1">Yapay zekanın ürettiği blokları kontrol edebilir veya manuel olarak İngilizce blok ekleyebilirsiniz.</p>
                   </div>
                   
                   <BlockEditor 
                      blocks={formData.content_blocks_en} 
                      onChange={(newBlocks) => setFormData(prev => ({ ...prev, content_blocks_en: newBlocks }))} 
                   />
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
                         <p className="text-[10px] text-gray-500 mt-1">/en/series/... kısmı</p>
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
