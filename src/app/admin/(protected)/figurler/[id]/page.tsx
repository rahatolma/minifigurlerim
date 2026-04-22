'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, ImagePlus, Wand2, Loader2, Save } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { slugify } from '@/utils/helpers';
import { saveFigureData } from '@/app/admin/actions/figure';
import { uploadEntityMedia } from '@/services/media_dal';

export default function EditFigurePage() {
  const router = useRouter();
  const params = useParams();
  const figureId = params.id as string;
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
    slug_tr: '',
    description: '',
    figure_number: '',
    code: '',
    piece_count: '',
    body_material: 'Abs Plastik',
    value_usd: '',
    min_price: '',
    max_price: '',
    avg_price: '',
    release_month: '',
    release_year: '',
    rarity_score: '1',
    series_score: '1',
    collection_count_30d: 0,
    favorite_count_30d: 0,
    rating_count: 0,
    total_views: 0,
    daily_views: 0
  });

  const [customAttributes, setCustomAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      if (!figureId) return;
      // Paralel DB çekimi
      const [sRes, gRes, cRes, fRes] = await Promise.all([
        supabase.from('series').select('id, title, category, series_no').order('created_at', { ascending: false }),
        supabase.from('definition_groups').select('*').neq('slug', 'seri_kategori').order('created_at', { ascending: true }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('minifigures').select('*, series(title, release_year, release_month)').eq('id', figureId).single()
      ]);

      if (sRes.data) setSeriesList(sRes.data);
      if (gRes.data) setDefGroups(gRes.data);
      if (cRes.data) setCategories(cRes.data);
      
      if (fRes.data) {
        const fig = fRes.data;
        
        let fallbackRoleId = fig.figure_role_id || '';
        if (!fallbackRoleId && (fig.figure_role || fig.role)) {
          const matchedCategory = cRes.data?.find((c: any) => c.type === 'figur-rolu' && (c.name === fig.figure_role || c.name === fig.role));
          if (matchedCategory) fallbackRoleId = matchedCategory.id;
        }

        let fallbackTypeId = fig.figure_type_id || '';
        if (!fallbackTypeId && (fig.figure_type || fig.type)) {
          const matchedCategory = cRes.data?.find((c: any) => c.type === 'figur-tipi' && (c.name === fig.figure_type || c.name === fig.type));
          if (matchedCategory) fallbackTypeId = matchedCategory.id;
        }

        let fallbackRarityId = fig.rarity_id || '';
        if (!fallbackRarityId && (fig.rarity_level || fig.rarity)) {
          const matchedCategory = cRes.data?.find((c: any) => c.type === 'nadirlik-derecesi' && (c.name === fig.rarity_level || c.name === fig.rarity));
          if (matchedCategory) fallbackRarityId = matchedCategory.id;
        }

        setFormData({
          series_id: fig.series_id || '',
          brand: fig.brand || 'LEGO®',
          name: fig.figure_name || fig.name || '',
          slug_tr: fig.slug_tr || fig.slug || '',
          description: fig.description || '',
          figure_number: fig.figure_number?.toString() || fig.figure_no?.toString() || '',
          code: fig.figure_code || fig.code || '',
          piece_count: fig.piece_count ? fig.piece_count.toString() : '',
          body_material: fig.body_material || 'Abs Plastik',
          value_usd: fig.value_usd ? fig.value_usd.toString() : '',
          min_price: fig.min_price ? fig.min_price.toString() : '',
          max_price: fig.max_price ? fig.max_price.toString() : '',
          avg_price: fig.avg_price ? fig.avg_price.toString() : '',
          release_month: fig.series?.release_month || fig.release_month || '',
          release_year: fig.series?.release_year || fig.release_year || '',
          rarity_score: fig.rarity_score ? fig.rarity_score.toString() : '1',
          series_score: fig.series_score ? fig.series_score.toString() : '1',
          view_count_30d: fig.view_count_30d || 0,
          collection_count_30d: fig.collection_count_30d || 0,
          favorite_count_30d: fig.favorite_count_30d || 0,
          rating_count: fig.rating_count || 0,
          total_views: fig.total_views || 0,
          daily_views: fig.daily_views || 0,
          figure_role_id: fallbackRoleId,
          figure_type_id: fallbackTypeId,
          rarity_id: fallbackRarityId
        });

        const attrs = fig.custom_attributes || {};
        if (fig.role) attrs['figur-rolu'] = fig.role;
        if (fig.type) attrs['figur-tipi'] = fig.type;
        if (fig.rarity) attrs['nadirlik-derecesi'] = fig.rarity;
        
        setCustomAttributes(attrs);
        
        if (fig.images && Array.isArray(fig.images)) {
            const arr = ['', '', '', ''];
            for(let i=0; i < fig.images.length; i++){
                if(i < 4) arr[i] = fig.images[i];
            }
            setUploadedImages(arr);
        }
      }
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
      const formMedia = new FormData();
      formMedia.append('file', file);
      formMedia.append('entityType', 'figures');
      formMedia.append('slug', slugify(formData.code || formData.name || 'figure-no-name'));
      formMedia.append('field', `main-${idx}`);

      const publicUrl = await uploadEntityMedia(formMedia);
      
      setUploadedImages(prev => {
        const newImages = [...prev];
        newImages[idx] = publicUrl;
        return newImages;
      });
    } catch (err: any) {
console.error(err);
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
console.error(err);
      toast.error('Görsel silinirken hata: ' + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.series_id || !formData.code || (!formData.figure_number && formData.figure_number !== "0") || (!formData.piece_count && formData.piece_count !== "0")) {
      toast.error("Validasyon Hatası: 'Seri', 'Minifigür Adı', 'Minifigür Kodu', 'Minifigür Sıra No' ve 'Parça Sayısı' zorunludur.");
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

    if (finalCustomAttr['figur-rolu']) { role = finalCustomAttr['figur-rolu']; delete finalCustomAttr['figur-rolu']; }
    if (finalCustomAttr['figur-tipi']) { type = finalCustomAttr['figur-tipi']; delete finalCustomAttr['figur-tipi']; }
    if (finalCustomAttr['nadirlik-derecesi']) { rarity = finalCustomAttr['nadirlik-derecesi']; delete finalCustomAttr['nadirlik-derecesi']; }

    const selectedSeries = seriesList.find(s => s.id === formData.series_id);
    const generatedSlug = formData.slug_tr || slugify(formData.name);

    try {
      const dbPayload = {
        series_id: formData.series_id,
        figure_name: formData.name,
        slug_tr: generatedSlug,
        figure_code: formData.code,
        description: formData.description,
        brand: formData.brand,
        category: selectedSeries?.category || '',
        series_name: selectedSeries?.title || '',
        series_no: selectedSeries?.series_no || '',
        figure_number: formData.figure_number,
        role: role,
        type: type,
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
      
      console.log('--- DB PAYLOAD ---', dbPayload);
      const result = await saveFigureData(dbPayload, true, figureId);
      if (!result.success) throw new Error(result.error);

      toast.success(result.message);
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
            <span className="text-black">FİGÜRÜ DÜZENLE</span>
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

                {/* MİNİFİGÜR ADI */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Minifigür Adı <span className="text-[#D22B2B]">*</span></label></div>
                    <div className="w-2/3 py-2"><input name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* URL SLUG KALDIRILDI - OTOMATİK OLUŞTURULACAK */}

                {/* FİGÜR AÇIKLAMASI */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors self-start mt-2">
                        <label className="text-gray-900 block truncate font-black tracking-wide">
                            Minifigür Açıklaması
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
                



                {/* MİNİFİGÜR SIRA NO */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Minifigür Sıra No <span className="text-[#D22B2B]">*</span></label></div>
                    <div className="w-2/3 py-2"><input name="figure_number" type="text" value={formData.figure_number} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* MİNİFİGÜR ROLÜ (Dinamik Dropdown) */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Minifigür Rolü</label></div>
                    <div className="w-2/3 py-2">
                        <select value={customAttributes['figur-rolu'] || ''} onChange={(e) => handleCustomAttrChange('figur-rolu', e.target.value)} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold appearance-none cursor-pointer">
                            <option value="">Seçim Yapılmadı</option>
                            {categories.filter(c => c.type === 'figur-rolu').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* MİNİFİGÜR TİPİ (Dinamik Dropdown) */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Minifigür Tipi</label></div>
                    <div className="w-2/3 py-2">
                        <select value={customAttributes['figur-tipi'] || ''} onChange={(e) => handleCustomAttrChange('figur-tipi', e.target.value)} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold appearance-none cursor-pointer">
                            <option value="">Seçim Yapılmadı</option>
                            {categories.filter(c => c.type === 'figur-tipi').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* MİNİFİGÜR KODU */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Minifigür Kodu <span className="text-[#D22B2B]">*</span></label></div>
                    <div className="w-2/3 py-2"><input name="code" type="text" value={formData.code} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* PARÇA SAYISI */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Parça Sayısı <span className="text-[#D22B2B]">*</span></label></div>
                    <div className="w-2/3 py-2"><input name="piece_count" type="number" value={formData.piece_count} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* ÇIKIŞ TARİHİ AY */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Çıkış Tarihi Ay</label></div>
                    <div className="w-2/3 py-2"><input name="release_month" type="text" value={formData.release_month} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" placeholder="Örn: Eylül" /></div>
                </div>

                {/* ÇIKIŞ TARİHİ YIL */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Çıkış Tarihi Yıl</label></div>
                    <div className="w-2/3 py-2"><input name="release_year" type="number" value={formData.release_year} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" placeholder="Örn: 2024" /></div>
                </div>

                {/* =========================================
                    2. DEĞER & TALEP
                ========================================= */}
                <div className="bg-gray-50 py-3 px-6 border-y border-gray-200 mt-8 mb-2">
                    <span className="text-[10px] font-black tracking-widest uppercase text-gray-800">2. DEĞER & TALEP</span>
                </div>
                
                {/* Min Fiyat */}
                <div className="flex border-b border-gray-100 items-center hover:bg-blue-50/30 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-blue-400 transition-colors">
                        <label className="text-gray-900 block font-black">Min Fiyat (USD)</label>
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Manuel Düzenlenebilir</span>
                    </div>
                    <div className="w-2/3 py-2"><input name="min_price" type="text" value={formData.min_price} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" placeholder="Örn: 25.50" /></div>
                </div>

                {/* Max Fiyat */}
                <div className="flex border-b border-gray-100 items-center hover:bg-blue-50/30 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-blue-400 transition-colors">
                        <label className="text-gray-900 block font-black">Max Fiyat (USD)</label>
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Manuel Düzenlenebilir</span>
                    </div>
                    <div className="w-2/3 py-2"><input name="max_price" type="text" value={formData.max_price} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" placeholder="Örn: 40.00" /></div>
                </div>

                {/* Ortalama Fiyat */}
                <div className="flex border-b border-gray-100 items-center hover:bg-blue-50/30 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-blue-400 transition-colors">
                        <label className="text-gray-900 block font-black">Ortalama Fiyat (USD)</label>
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Manuel Düzenlenebilir</span>
                    </div>
                    <div className="w-2/3 py-2"><input name="avg_price" type="text" value={formData.avg_price} onChange={handleChange} className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" placeholder="Örn: 32.75" /></div>
                </div>

                {/* Koleksiyon Değeri (Sistem Read-Only) */}
                <div className="flex border-b border-gray-100 items-center bg-gray-50/80">
                    <div className="w-1/3 py-4 pr-4 pl-6">
                        <label className="text-gray-600 block font-black">Koleksiyon Değeri</label>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sistem / Read-Only</span>
                    </div>
                    <div className="w-2/3 py-2 px-3 text-gray-900 font-black">
                        {formData.min_price && formData.max_price ? `$${formData.min_price} - $${formData.max_price}` : (formData.avg_price ? `$${formData.avg_price}` : 'Belirsiz')}
                    </div>
                </div>

                {/* Değer Skoru (Sistem Read-Only) */}
                <div className="flex border-b border-gray-100 items-center bg-gray-50/80">
                    <div className="w-1/3 py-4 pr-4 pl-6">
                        <label className="text-gray-600 block font-black">Değer Skoru</label>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sistem / Read-Only</span>
                    </div>
                    <div className="w-2/3 py-2 px-3 text-yellow-500 font-black uppercase">
                        YAYGIN
                    </div>
                </div>

                {/* Talep Sinyali (Sistem Read-Only) */}
                <div className="flex border-b border-gray-100 items-center bg-gray-50/80">
                    <div className="w-1/3 py-4 pr-4 pl-6">
                        <label className="text-gray-600 block font-black">Talep Sinyali</label>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sistem / Read-Only</span>
                    </div>
                    <div className="w-2/3 py-2 px-3 text-blue-600 font-black uppercase">
                        DÜŞÜK
                    </div>
                </div>



                {/* =========================================
                    3. ETKİLEŞİM METRİKLERİ (SİSTEM PANELİ)
                ========================================= */}
                <div className="bg-gray-100 py-3 px-6 border-y border-gray-200 mt-8 mb-2">
                    <span className="text-[10px] font-black tracking-widest uppercase text-gray-800">3. ETKİLEŞİM METRİKLERİ (SİSTEM ÇIKTISI / READ-ONLY)</span>
                </div>

                <div className="flex border-b border-gray-100 items-center bg-gray-50/80">
                    <div className="w-1/3 py-3 pr-4 pl-6"><label className="text-gray-500 block font-bold text-[13px]">Toplam Görüntülenme</label></div>
                    <div className="w-2/3 py-2 px-3 text-green-700 font-bold">{formData.total_views || '0'}</div>
                </div>

                <div className="flex border-b border-gray-100 items-center bg-gray-50/80">
                    <div className="w-1/3 py-3 pr-4 pl-6"><label className="text-gray-500 block font-bold text-[13px]">Günlük Görüntülenme</label></div>
                    <div className="w-2/3 py-2 px-3 text-green-600 font-bold">{formData.daily_views || '0'}</div>
                </div>

                <div className="flex border-b border-gray-100 items-center bg-gray-50/80">
                    <div className="w-1/3 py-3 pr-4 pl-6"><label className="text-gray-500 block font-bold text-[13px]">30g Görüntülenme</label></div>
                    <div className="w-2/3 py-2 px-3 text-gray-900 font-bold">{formData.view_count_30d || '0'}</div>
                </div>
                
                <div className="flex border-b border-gray-100 items-center bg-gray-50/80">
                    <div className="w-1/3 py-3 pr-4 pl-6"><label className="text-gray-500 block font-bold text-[13px]">30g Kol. Eklenme</label></div>
                    <div className="w-2/3 py-2 px-3 text-gray-900 font-bold">{formData.collection_count_30d || '0'}</div>
                </div>

                <div className="flex border-b border-gray-100 items-center bg-gray-50/80">
                    <div className="w-1/3 py-3 pr-4 pl-6"><label className="text-gray-500 block font-bold text-[13px]">30g Favori / İstek</label></div>
                    <div className="w-2/3 py-2 px-3 text-gray-900 font-bold">{formData.favorite_count_30d || '0'}</div>
                </div>

                <div className="flex items-center bg-gray-50/80 mb-2">
                    <div className="w-1/3 py-3 pr-4 pl-6"><label className="text-gray-500 block font-bold text-[13px]">Etkileşim / Puan Sayısı</label></div>
                    <div className="w-2/3 py-2 px-3 text-gray-900 font-bold">{formData.rating_count || '0'}</div>
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
