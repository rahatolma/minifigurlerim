'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ImagePlus, Loader2, Save } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { supabase } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { slugify } from '@/utils/helpers';
import BlockEditor from '@/components/admin/blocks/BlockEditor';
import { AnyContentBlock } from '@/types/content-blocks';

export default function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [imageUrls, setImageUrls] = useState({
    cover_image_url: null as string | null,
    hero_image_url: null as string | null,
  });
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    series_no: '',
    brand: 'LEGO®',
    figure_count: '',
    release_month: '',
    release_year: '',
    rarity: '',
    content_blocks: [] as AnyContentBlock[]
  });

  useEffect(() => {
    async function init() {
      if (id) {
           const { data: catData } = await supabase.from('categories').select('*').eq('type', 'seri_kategori').order('name');
           if (catData) setCategories(catData);
           
           try {
             const { data, error } = await supabase.from('series').select('*').eq('id', id).single();
             if (error) throw error;
             
             if (data) {
               setFormData({
                 title: data.title || '',
                 category: data.category || (catData?.length ? catData[0].name : 'Karakter Paketleri'),
                 series_no: data.series_no || '',
                 brand: data.brand || 'LEGO®',
                 figure_count: data.figure_count ? data.figure_count.toString() : '',
                 release_month: data.release_month || '',
                 release_year: data.release_year || '',
                 rarity: data.rarity || '',
                 content_blocks: Array.isArray(data.content_blocks) ? data.content_blocks : []
               });
               setImageUrls({
                 cover_image_url: data.cover_image_url || null,
                 hero_image_url: data.hero_image_url || null,
               });
             }
           } catch (err: any) {
             toast.error("Hata: Seri bulunamadı.");
             router.push('/admin/seriler');
           }
      }
      setLoading(false);
    }
    init();
  }, [id, router]);

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
      toast.error('Resim Yükleme Hatası: ' + error.message);
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
      toast.success('Görsel başarıyla silindi.');
    } catch (err: any) {
      toast.error('Görsel silinirken hata: ' + err.message);
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
        .update({
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
          content_blocks: formData.content_blocks
        })
        .eq('id', id);

      if (error) throw error;

      // Kaskad Güncelleme: Bu seriye ait tüm figürlerin de kategori, seri adı ve seri no bilgilerini otomatik eşitle.
      const { error: cascadeError } = await supabase
        .from('minifigures')
        .update({
          category: formData.category,
          series_name: formData.title,
          series_no: formData.series_no
        })
        .eq('series_id', id);

      if (cascadeError) {
        console.error("Figürler kaskad güncellenirken hata:", cascadeError);
        toast.error("Seri güncellendi ama içindeki figürler eşitlenemedi.");
      } else {
        toast.success('Seri GÜNCELLENDİ ve içindeki tüm figürler otomatik eşitlendi! 🎉');
        router.push('/admin/seriler');
      }

    } catch (err: any) {
      toast.error('Güncelleme Hatası: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageUploadBoxes = [
    { id: 'cover_image_url', title: 'KAPAK GÖRSELİ', desc: 'Liste ve arama sonuçlarında görünecek kare görsel.' },
    { id: 'hero_image_url', title: 'HERO (SLIDE) GÖRSELİ', desc: 'Detay sayfasının devasa arkaplan görseli.' }
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-gray-400" size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black pb-24">
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full max-w-[1600px] mx-auto px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-500">
            <Link href="/admin/seriler" className="hover:text-black transition-colors">SERİLER</Link>
            <ChevronRight size={14} />
            <span className="text-black">DÜZENLE: {formData.title}</span>
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
                        <select name="category" value={formData.category} onChange={handleChange} required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold appearance-none cursor-pointer">
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
                        <option value="">Seçiniz</option>
                        {['Yaygın', 'Nadir', 'Çok Nadir', 'Sınırlı Üretim', 'Özel Sürüm'].map(r => <option key={r} value={r}>{r}</option>)}
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

            <div className="mt-12 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-[#D22B2B] disabled:bg-gray-400 transition-colors px-16 py-5 text-[11px] font-black tracking-widest uppercase rounded-sm flex items-center gap-3 w-full md:w-auto justify-center shadow-lg duration-300"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> GÜNCELLENİYOR...</>
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
