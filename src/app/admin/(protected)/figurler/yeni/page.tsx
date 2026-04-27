'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ImagePlus, Wand2, Loader2, Save } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { slugify } from '@/utils/helpers';
import { normalizeIncomingMinifigure } from '@/services/inputNormalizers';
import { logNormalizationEventsAction } from '@/app/admin/actions/logger';

export default function NewFigurePage() {
  const router = useRouter();
  const [magicEraser, setMagicEraser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data sources
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [defGroups, setDefGroups] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    series_id: '',
    brand: 'LEGO®',
    name: '',
    description: '',
    figure_no: '',
    code: '',
    piece_count: '',
    body_material: 'Abs Plastik',
    value_usd: '', // Legacy API'den kalma, silme
    min_price: '',
    max_price: '',
    avg_price: '',
    release_month: '',
    release_year: '',
    rarity_score: '1',
    series_score: '1',
    view_count_30d: 0,
    collection_count_30d: 0,
    favorite_count_30d: 0,
    rating_count: 0
  });

  const [customAttributes, setCustomAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      // Paralel DB çekimi
      const [sRes, gRes, cRes] = await Promise.all([
        supabase.from('series').select('id, title, category, series_no').order('created_at', { ascending: false }),
        supabase.from('definition_groups').select('*').neq('slug', 'seri_kategori').order('created_at', { ascending: true }),
        supabase.from('categories').select('*').order('name', { ascending: true })
      ]);

      if (sRes.data) setSeriesList(sRes.data);
      if (gRes.data) setDefGroups(gRes.data);
      if (cRes.data) setCategories(cRes.data);
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCustomAttrChange = (groupSlug: string, value: string) => {
    setCustomAttributes(prev => ({ ...prev, [groupSlug]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploadingIdx(idx);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `figures/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('minifigure-images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('minifigure-images').getPublicUrl(filePath);
      
      setUploadedImages(prev => {
        const newImages = [...prev];
        newImages[idx] = publicUrl;
        return newImages;
      });
    } catch (err: any) {
      toast.error("Görsel yüklenemedi: " + err.message);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleRemoveImage = async (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const url = uploadedImages[idx];
    if (!url) return;
    try {
      const path = url.split('/minifigure-images/')[1];
      if (path) {
        const { error } = await supabase.storage.from('minifigure-images').remove([path]);
        if (error) throw error;
      }
      setUploadedImages(prev => {
        const newImages = [...prev];
        newImages[idx] = '';
        return newImages;
      });
      toast.success('Görsel başarıyla silindi.');
    } catch (err: any) {
      toast.error('Görsel silinirken hata: ' + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.series_id) {
      toast.error("Lütfen Figür Adı ve Ait Olduğu Seri alanlarını doldurun.");
      return;
    }
    
    setIsSubmitting(true);
    
    const pieceCount = formData.piece_count ? parseInt(formData.piece_count) : null;
    const valueUsd = formData.value_usd ? parseFloat(formData.value_usd.replace(',', '.')) : null;

    // Geriye dönük uyumluluk (Eski tabloda kalan sütunlar) ve esnek JSONB ataması
    const finalCustomAttr = { ...customAttributes };
    let role = null;
    let type = null;
    let rarity = null;

    if (finalCustomAttr[' figur-rolu']) { role = finalCustomAttr['figur-rolu']; delete finalCustomAttr['figur-rolu']; }
    if (finalCustomAttr['figur-tipi']) { type = finalCustomAttr['figur-tipi']; delete finalCustomAttr['figur-tipi']; }
    if (finalCustomAttr['nadirlik-derecesi']) { rarity = finalCustomAttr['nadirlik-derecesi']; delete finalCustomAttr['nadirlik-derecesi']; }

    const selectedSeries = seriesList.find(s => s.id === formData.series_id);
    const generatedSlug = slugify(`${formData.name} ${selectedSeries?.title || ''} ${formData.code || ''}`);

    try {
      const rawRecord = {
        slug: generatedSlug,
        series_id: formData.series_id,
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        category: selectedSeries?.category || '',
        series_name: selectedSeries?.title || '',
        series_no: selectedSeries?.series_no || '',
        figure_no: formData.figure_no,
        role: role,
        type: type,
        code: formData.code,
        piece_count: pieceCount,
        body_material: formData.body_material,
        rarity: rarity,
        value_usd: valueUsd,
        min_price: formData.min_price ? parseFloat(formData.min_price.toString().replace(',', '.')) : null,
        max_price: formData.max_price ? parseFloat(formData.max_price.toString().replace(',', '.')) : null,
        avg_price: formData.avg_price ? parseFloat(formData.avg_price.toString().replace(',', '.')) : null,
        rarity_score: parseInt(formData.rarity_score) || 1,
        series_score: parseInt(formData.series_score) || 1,
        view_count_30d: parseInt(formData.view_count_30d.toString()) || 0,
        collection_count_30d: parseInt(formData.collection_count_30d.toString()) || 0,
        favorite_count_30d: parseInt(formData.favorite_count_30d.toString()) || 0,
        rating_count: parseInt(formData.rating_count.toString()) || 0,
        release_month: formData.release_month,
        release_year: formData.release_year,
        images: uploadedImages.filter(Boolean),
        custom_attributes: finalCustomAttr
      };

      const { safeRecord: normalizedRecord, logs: normalizationLogs } = normalizeIncomingMinifigure(rawRecord);

      if (normalizationLogs.length > 0) {
        console.warn('[DataGovernance: Normalization Executed]');
        normalizationLogs.forEach(log => {
          console.warn(`  ↳ Field '${log.field}': '${log.originalValue}' -> '${log.normalizedValue}'`);
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-orange-50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-orange-900">Sistem Uyarısı (Otomatik Düzeltme)</p>
                    <p className="mt-1 text-sm text-orange-700">{`'${log.field}' alanı sistem tarafından düzeltildi: '${log.originalValue}' -> '${log.normalizedValue}'`}</p>
                  </div>
                </div>
              </div>
            </div>
          ), { duration: 6000 });
        });
      }

      const { data, error } = await supabase
        .from('minifigures')
        .insert([normalizedRecord])
        .select();

      if (error) throw error;
      
      // Fire-and-forget persistent logging if there are normalization logs
      if (normalizationLogs.length > 0 && data && data.length > 0) {
         logNormalizationEventsAction(normalizationLogs, 'minifigures', 'admin_panel', data[0].id).catch(err => {
            console.error('[DataGovernance] Client failed to trigger log persistence:', err);
         });
      }

      toast.success('Figür sisteme başarıyla kaydedildi.');
      router.push('/admin/figurler');
    } catch (err: any) {
      console.error(err);
      toast.error('Kayıt Hatası. "custom_attributes" SQL yamasını Run etmemiş olabilirsiniz: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSeries = seriesList.find(s => s.id === formData.series_id);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black pb-24">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full max-w-[1600px] mx-auto px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-500">
            <Link href="/admin/figurler" className="hover:text-black transition-colors">FİGÜRLER</Link>
            <ChevronRight size={14} />
            <span className="text-black">YENİ TANIMLAMA</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sol Kolon: Görseller & Magic Eraser */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border text-left border-gray-200 p-6 rounded-md shadow-sm mb-4">
             <h3 className="font-bold text-sm text-black mb-1">Figür Görselleri</h3>
             <p className="text-[11px] font-medium text-gray-500">Tıklayıp klasörden ürün kapak ve detay fotoğraflarını seçebilirsiniz.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map(idx => (
              <div key={idx} className="relative group aspect-[3/4] bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                <label className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer relative z-10">
                  {uploadingIdx === idx ? (
                    <div className="flex flex-col items-center text-black">
                      <Loader2 size={24} className="animate-spin mb-2" />
                      <span className="text-[10px] font-black tracking-widest uppercase">Yükleniyor</span>
                    </div>
                  ) : uploadedImages[idx] ? (
                    <img src={uploadedImages[idx]} alt="Figure Preview" className="w-full h-full object-contain p-2 mix-blend-multiply" />
                  ) : (
                    <>
                      <ImagePlus size={24} className="mb-3 group-hover:scale-110 transition-transform text-gray-300 group-hover:text-black" />
                      <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 group-hover:text-black">GÖRSEL {idx+1}</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} className="hidden" />
                </label>

                {uploadedImages[idx] && (
                  <button 
                    type="button" 
                    onClick={(e) => handleRemoveImage(e, idx)} 
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors z-20"
                    title="Görseli Sil"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white border text-left border-gray-200 p-6 rounded-md shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-black">
                    <Wand2 size={16} className="text-[#D22B2B]" /> Magic Eraser
                </div>
                <button 
                  type="button"
                  onClick={() => setMagicEraser(!magicEraser)}
                  className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${magicEraser ? 'bg-black' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${magicEraser ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">Arkaplanı otomatik olarak silip şeffaf (PNG) hale getirir.</p>
          </div>
        </div>

        {/* Sağ Kolon: Form Verileri */}
        <div className="lg:col-span-8 pb-20">
          <form onSubmit={handleSave} className="space-y-0 w-full text-[13px] font-bold">
            
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden mb-8">
                {/* MARKA */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Marka <span className="text-[#D22B2B]">*</span></label></div>
                    <div className="w-2/3 py-2"><input name="brand" type="text" value={formData.brand} onChange={handleChange} required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* SERİ ADI (Seri Seçici burada olacak!) */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                    <label className="text-gray-900 block truncate font-black tracking-wide">
                        Seri Adı <span className="text-[#D22B2B]">*</span>
                    </label>
                    </div>
                    <div className="w-2/3 py-3">
                    <select 
                        name="series_id"
                        value={formData.series_id}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent px-3 py-2 outline-none text-black font-semibold appearance-none cursor-pointer"
                    >
                        <option value="" disabled>Lütfen Bir Seri Seçin...</option>
                        {seriesList.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                    </select>
                    </div>
                </div>

                {/* SERİ NO, SERİ KATEGORİ (Otomatik Dolacak) */}
                <div className="flex border-b border-gray-100 items-center bg-gray-50/50">
                    <div className="w-1/3 py-4 pr-4 pl-6"><label className="text-gray-500 block font-black">Seri No</label></div>
                    <div className="w-2/3 py-2 px-3 text-gray-500 font-semibold">{selectedSeries?.series_no || '-'}</div>
                </div>
                <div className="flex border-b border-gray-100 items-center bg-gray-50/50">
                    <div className="w-1/3 py-4 pr-4 pl-6"><label className="text-gray-500 block font-black">Seri Kategori</label></div>
                    <div className="w-2/3 py-2 px-3 text-gray-500 font-semibold">{selectedSeries?.category || '-'}</div>
                </div>

                {/* FİGÜR ADI */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Figür Adı <span className="text-[#D22B2B]">*</span></label></div>
                    <div className="w-2/3 py-2"><input name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* FİGÜR AÇIKLAMASI */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors self-start mt-2">
                        <label className="text-gray-900 block truncate font-black tracking-wide">
                            Figür Açıklaması
                        </label>
                    </div>
                    <div className="w-2/3 py-2">
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={(e: any) => handleChange(e)}
                            placeholder="Figürün hikayesini yazın..."
                            rows={3}
                            className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold placeholder:font-normal placeholder:opacity-40 resize-y" 
                        />
                    </div>
                </div>
                



                {/* FİGÜR SIRA NO */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Figür Sıra No</label></div>
                    <div className="w-2/3 py-2"><input name="figure_no" type="text" value={formData.figure_no} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* FİGÜR ROLÜ (Dinamik Dropdown) */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Figür Rolü</label></div>
                    <div className="w-2/3 py-2">
                        <select value={customAttributes['figur-rolu'] || ''} onChange={(e) => handleCustomAttrChange('figur-rolu', e.target.value)} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold appearance-none cursor-pointer">
                            <option value="">Seçim Yapılmadı</option>
                            {categories.filter(c => c.type === 'figur-rolu').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* FİGÜR TİPİ (Dinamik Dropdown) */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Figür Tipi</label></div>
                    <div className="w-2/3 py-2">
                        <select value={customAttributes['figur-tipi'] || ''} onChange={(e) => handleCustomAttrChange('figur-tipi', e.target.value)} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold appearance-none cursor-pointer">
                            <option value="">Seçim Yapılmadı</option>
                            {categories.filter(c => c.type === 'figur-tipi').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* FİGÜR KODU */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Figür Kodu</label></div>
                    <div className="w-2/3 py-2"><input name="code" type="text" value={formData.code} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* PARÇA SAYISI */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Parça Sayısı</label></div>
                    <div className="w-2/3 py-2"><input name="piece_count" type="number" value={formData.piece_count} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* YENİ FİYAT VE DEĞER MOTORU (VALUE ENGINE) */}
                <div className="bg-gray-50 py-3 px-6 border-b border-gray-200 mt-4">
                    <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">Koleksiyon Değer Motoru (Value Engine)</span>
                </div>
                
                {/* Min Fiyat */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Min Fiyat (USD)</label></div>
                    <div className="w-2/3 py-2"><input name="min_price" type="text" value={formData.min_price} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" placeholder="Örn: 25.50" /></div>
                </div>

                {/* Max Fiyat */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Max Fiyat (USD)</label></div>
                    <div className="w-2/3 py-2"><input name="max_price" type="text" value={formData.max_price} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" placeholder="Örn: 40.00" /></div>
                </div>

                {/* Ortalama Fiyat */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Ortalama Fiyat (USD)</label></div>
                    <div className="w-2/3 py-2"><input name="avg_price" type="text" value={formData.avg_price} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" placeholder="Örn: 32.75" /></div>
                </div>

                {/* Nadirlik Skoru */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Nadirlik Skoru (1-5)</label></div>
                    <div className="w-2/3 py-2">
                        <select name="rarity_score" value={formData.rarity_score} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold appearance-none cursor-pointer">
                            <option value="1">1 - Çok Yaygın / 🪨</option>
                            <option value="2">2 - Yaygın / 🧩</option>
                            <option value="3">3 - Orta / ⚡</option>
                            <option value="4">4 - Nadir / 💎</option>
                            <option value="5">5 - Çok Nadir / 🔥 Efsane</option>
                        </select>
                    </div>
                </div>

                {/* Seri Gücü Skoru */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Seri Gücü Skoru (1-5)</label></div>
                    <div className="w-2/3 py-2">
                        <select name="series_score" value={formData.series_score} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold appearance-none cursor-pointer">
                            <option value="1">1 - Sıradan Seriler</option>
                            <option value="2">2 - Genel Seriler</option>
                            <option value="3">3 - CMF Klasik Seriler</option>
                            <option value="4">4 - Özel Seriler</option>
                            <option value="5">5 - Güçlü IP (Star Wars, Marvel, vb.)</option>
                        </select>
                    </div>
                </div>

                {/* YENİ TALEP MOTORU (DEMAND ENGINE - MVP MANUEL) */}
                <div className="bg-gray-50 py-3 px-6 border-b border-gray-200 mt-4">
                    <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">Talep Sinyali Motoru (Demand Engine MVP)</span>
                </div>
                
                {/* 30 Günlük Görüntülenme */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                        <label className="text-gray-900 block font-black">30g Görüntülenme</label>
                        <span className="block text-[10px] text-gray-500 font-medium">Manuel başlangıç sinyali</span>
                    </div>
                    <div className="w-2/3 py-2"><input name="view_count_30d" type="number" min="0" value={formData.view_count_30d} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* 30 Günlük Koleksiyon */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                        <label className="text-gray-900 block font-black">30g Koleksiyona Eklenme</label>
                    </div>
                    <div className="w-2/3 py-2"><input name="collection_count_30d" type="number" min="0" value={formData.collection_count_30d} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                 {/* 30 Günlük Favori */}
                 <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                        <label className="text-gray-900 block font-black">30g Favori / İstek List.</label>
                    </div>
                    <div className="w-2/3 py-2"><input name="favorite_count_30d" type="number" min="0" value={formData.favorite_count_30d} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* Puanlama (Rating) Sayısı */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                        <label className="text-gray-900 block font-black">Etkileşim / Puan Sayısı</label>
                    </div>
                    <div className="w-2/3 py-2"><input name="rating_count" type="number" min="0" value={formData.rating_count} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* LEGACY DEĞER */}
                <div className="bg-red-50 py-3 px-6 border-b border-red-100 mt-4">
                    <span className="text-[10px] font-black tracking-widest uppercase text-red-500">ESKİ SİSTEM (LEGACY)</span>
                </div>
                
                <div className="flex border-b border-gray-100 items-center hover:bg-red-50 transition-colors group opacity-60">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent transition-colors"><label className="text-gray-900 block font-black">Eski Canlı Fiyat (value_usd)</label></div>
                    <div className="w-2/3 py-2"><input name="value_usd" type="text" value={formData.value_usd} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* ÇIKIŞ TARİHİ AY */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Çıkış Tarihi Ay</label></div>
                    <div className="w-2/3 py-2"><input name="release_month" type="text" value={formData.release_month} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* ÇIKIŞ TARİHİ YIL */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Çıkış Tarihi Yıl</label></div>
                    <div className="w-2/3 py-2"><input name="release_year" type="number" value={formData.release_year} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>
            </div>

            {/* DİNAMİK TANIMLAR (Yukarıda Olmayan Ekstralar) */}
            {defGroups.filter(g => !['figur-rolu', 'figur-tipi', 'nadirlik-derecesi', 'marka', 'seri-adi', 'seri-no', 'seri-kategori'].includes(g.slug)).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden mb-8">
                    <div className="bg-gray-50 py-3 px-6 border-b border-gray-200">
                        <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">EKSTRA SİSTEM TANIMLARI</span>
                    </div>
                    
                    {defGroups.filter(g => !['figur-rolu', 'figur-tipi', 'nadirlik-derecesi', 'marka', 'seri-adi', 'seri-no', 'seri-kategori'].includes(g.slug)).map(group => {
                        const groupCats = categories.filter(c => c.type === group.slug);
                        return (
                            <div key={group.id} className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                                <div className="w-1/3 py-5 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                                    <label className="text-gray-900 block truncate font-black tracking-wide capitalize">
                                        {group.name}
                                    </label>
                                </div>
                                <div className="w-2/3 py-3">
                                    {groupCats.length === 0 ? (
                                        <div className="px-3 py-2 text-gray-400 font-medium italic text-xs">Bu gruba ait henüz bir alt tanım yok.</div>
                                    ) : (
                                        <select 
                                            value={customAttributes[group.slug] || ''}
                                            onChange={(e) => handleCustomAttrChange(group.slug, e.target.value)}
                                            className="w-full bg-transparent px-3 py-2 outline-none text-black font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="">Seçim Yapılmadı</option>
                                            {groupCats.map(c => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="mt-12 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-[#D22B2B] disabled:bg-gray-400 transition-colors px-16 py-5 text-[11px] font-black tracking-widest uppercase rounded-sm flex items-center gap-3 w-full md:w-auto justify-center shadow-lg"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> KAYDEDİLİYOR...</>
                ) : (
                  <><Save size={16} /> FİGÜRÜ KAYDET</>
                )}
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}
