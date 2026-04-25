'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ImagePlus, Loader2, Save, Globe } from 'lucide-react';
import RichTextEditor from '@/components/cto/RichTextEditor';
import { supabase } from '@/utils/supabase/client';
import { slugify } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { saveNewsData } from '@/app/cto/actions/news';
import { uploadEntityMedia } from '@/services/media_dal';

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingEN, setIsGeneratingEN] = useState(false);
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
    slug_en: '',
    summary_en: '',
    content_blocks_en: '',
    meta_title_en: '',
    meta_description_en: '',
    en_status: 'missing'
  });

  useEffect(() => {
    async function fetchNews() {
      if (id) {
        try {
          const { data, error } = await supabase.from('news').select('*').eq('id', id).single();
          if (error) throw error;
          
          if (data) {
            setFormData({
              title: data.title || '',
              summary: data.summary || '',
              content: data.content || '',
              status: data.status || 'published',
              min_read: data.min_read ? data.min_read.toString() : '1',
              title_en: data.title_en || '',
              slug_en: data.slug_en || '',
              summary_en: data.summary_en || '',
              content_blocks_en: data.content_blocks_en || '',
              meta_title_en: data.meta_title_en || '',
              meta_description_en: data.meta_description_en || '',
              en_status: data.en_status || 'missing'
            });
            setImageUrls({
              cover_image_url: data.cover_image_url || null,
              cover_image_vertical_url: data.cover_image_vertical_url || null,
            });
          }
        } catch (err: any) {
console.error(err);
          toast.error("Hata: Haber bulunamadı.");
          router.push('/cto/haberler');
        }
      }
      setLoading(false);
    }
    fetchNews();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'cover_image_url' | 'cover_image_vertical_url') => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploadingField(fieldName);
      
      const file = event.target.files[0];
      const formMedia = new FormData();
      formMedia.append('file', file);
      formMedia.append('entityType', 'blog');
      formMedia.append('slug', formData.title ? slugify(formData.title) : 'unknown-news');
      formMedia.append('field', fieldName);

      const publicUrl = await uploadEntityMedia(formMedia);
      
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
      toast.success('Görsel başarıyla silindi.');
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
          slug_en: formData.slug_en,
          summary_en: formData.summary_en,
          content_blocks_en: formData.content_blocks_en,
          meta_title_en: formData.meta_title_en,
          meta_description_en: formData.meta_description_en,
          en_status: formData.en_status,
      };

      const result = await saveNewsData(dbPayload, true, id);
      if (!result.success) throw new Error(result.error);

      toast.success(result.message);
      router.push('/cto/haberler');
    } catch (err: any) {
console.error(err);
      toast.error('Güncelleme Hatası: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateENDraft = async () => {
    if (!id) return toast.error("Taslak için önce haberi kaydetmelisiniz.");
    
    if (formData.title_en || formData.content_blocks_en) {
      const confirmOverwrite = window.confirm("İngilizce içerik zaten mevcut. Üzerine yazarak yeni bir taslak oluşturmak istediğinize emin misiniz?");
      if (!confirmOverwrite) return;
    }

    try {
      setIsGeneratingEN(true);
      const toastId = toast.loading('İngilizce taslak üretiliyor (Yapay Zeka devrede)...');
      
      const res = await fetch('/api/cto/generate-en-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: 'news', entity_id: id })
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'API Hatası');
      
      toast.success('İngilizce içerikler başarıyla oluşturuldu!', { id: toastId });
      
      if (resData.data) {
        setFormData(prev => ({
          ...prev,
          slug_en: resData.data.slug_en || prev.slug_en,
          title_en: resData.data.title_en || prev.title_en,
          summary_en: resData.data.summary_en || prev.summary_en,
          content_blocks_en: resData.data.content_blocks_en || prev.content_blocks_en,
          meta_title_en: resData.data.meta_title_en || prev.meta_title_en,
          meta_description_en: resData.data.meta_description_en || prev.meta_description_en,
          en_status: 'draft',
        }));
      }
      
    } catch (err: any) {
      console.error(err);
      toast.error('Taslak oluşturulamadı: ' + err.message);
    } finally {
      setIsGeneratingEN(false);
    }
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-gray-400" size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black pb-24">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full max-w-[1600px] mx-auto px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-500">
            <Link href="/cto/haberler" className="hover:text-black transition-colors">HABERLER</Link>
            <ChevronRight size={14} />
            <span className="text-black">HABERİ DÜZENLE: {formData.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerateENDraft}
              disabled={isGeneratingEN}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors px-6 py-2.5 text-[11px] font-black tracking-widest uppercase rounded flex items-center gap-2 shadow-sm"
            >
              {isGeneratingEN ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              Generate EN Draft 🇺🇸
            </button>
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
              <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">Haber Başlığı <span className="text-[#D22B2B]">*</span></label>
                </div>
                <div className="w-2/3 py-3">
                    <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Örn: LEGO Collectible Minifigures Series 26 Geliyor!" required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" />
                </div>
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
            
            <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-8 overflow-hidden">
              {/* Özet */}
              <div className="flex border-b border-gray-100 items-start hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 pt-6 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                  <label className="text-gray-900 block font-black tracking-wide">Kart Özeti (Kısa Metin)</label>
                </div>
                <div className="w-2/3 py-4">
                  <textarea 
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="Ana sayfadaki listede haberin altında görünecek 1-2 cümlelik vuruş metni..."
                    className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold placeholder:font-medium placeholder:opacity-30 min-h-[80px] resize-y" 
                  />
                </div>
              </div>

               {/* İçerik */}
               <div className="flex border-b border-gray-100 items-start hover:bg-gray-50 transition-colors group">
                <div className="w-1/3 pt-6 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                  <label className="text-gray-900 block font-black tracking-wide">Haberin Tam Metni (HTML)</label>
                  <p className="text-[10px] text-gray-400 font-medium mt-2 leading-tight">Bu alana detaylı paragraf veya HTML formatında kalın/italik metinler ekleyebilirsiniz.</p>
                </div>
                <div className="w-2/3 py-4">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                    placeholder="Haber metni buraya yazılacak..."
                  />
                </div>
              </div>
            </div>

            {/* =========================================
                İNGİLİZCE SEO & İÇERİK
            ========================================= */}
            <div className="w-full bg-blue-50/50 p-6 rounded-md border border-blue-100 flex flex-col gap-6 mt-12">
                 <div className="flex items-center justify-between border-b border-blue-200 pb-2 mb-2">
                    <h3 className="text-[13px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-2">
                       <Globe size={16} /> İngilizce İçerik (Global)
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Çeviri Durumu:</span>
                       <select 
                         name="en_status" 
                         value={formData.en_status} 
                         onChange={handleChange} 
                         className="bg-white border border-blue-200 text-blue-800 text-[11px] font-bold py-1 px-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                       >
                         <option value="missing">Missing</option>
                         <option value="draft">Draft</option>
                         <option value="reviewed">Reviewed</option>
                       </select>
                    </div>
                 </div>
            
            <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-8 overflow-hidden">
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Başlık (EN)</label></div>
                    <div className="w-2/3 py-2"><input name="title_en" type="text" value={formData.title_en} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">URL Slug (EN)</label></div>
                    <div className="w-2/3 py-2"><input name="slug_en" type="text" value={formData.slug_en} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                <div className="flex border-b border-gray-100 items-start hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 pt-6 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Özet (EN)</label></div>
                    <div className="w-2/3 py-4"><textarea name="summary_en" rows={3} value={formData.summary_en} onChange={(e: any) => handleChange(e)} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold resize-y" /></div>
                </div>

                <div className="flex border-b border-gray-100 items-start hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 pt-6 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">İçerik (EN)</label></div>
                    <div className="w-2/3 py-4">
                      <RichTextEditor
                        value={formData.content_blocks_en}
                        onChange={(val) => setFormData(prev => ({ ...prev, content_blocks_en: val }))}
                        placeholder="English content here..."
                      />
                    </div>
                </div>

                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Meta Title (EN)</label></div>
                    <div className="w-2/3 py-2"><input name="meta_title_en" type="text" value={formData.meta_title_en} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                <div className="flex border-b border-gray-100 items-start hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 pt-6 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Meta Description (EN)</label></div>
                    <div className="w-2/3 py-4"><textarea name="meta_description_en" rows={2} value={formData.meta_description_en} onChange={(e: any) => handleChange(e)} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold resize-y" /></div>
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
                  <><Loader2 size={16} className="animate-spin" /> YAYINLANIYOR...</>
                ) : (
                  <><Save size={16} /> DEĞİŞİKLİKLERİ KAYDET</>
                )}
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}
