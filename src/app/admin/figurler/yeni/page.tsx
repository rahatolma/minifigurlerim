'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, ArrowRight, ImagePlus, Wand2, Loader2, Save } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

export default function NewFigurePage() {
  const router = useRouter();
  const [magicEraser, setMagicEraser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    series_id: '',
    brand: 'LEGO®',
    name: '',
    figure_no: '',
    role: '',
    type: '',
    code: '',
    piece_count: '',
    body_material: 'Abs Plastik',
    rarity: '',
    value_usd: '',
    release_year: ''
  });

  useEffect(() => {
    // DB'den Serileri Çek
    async function loadSeries() {
      const { data } = await supabase.from('series').select('id, title, category, series_no');
      if (data) setSeriesList(data);
    }
    loadSeries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
      alert("Görsel yüklenemedi: " + err.message);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.series_id) {
      alert("Lütfen Figür Adı ve Ait Olduğu Seri alanlarını doldurun.");
      return;
    }
    
    setIsSubmitting(true);
    
    const pieceCount = formData.piece_count ? parseInt(formData.piece_count) : null;
    const valueUsd = formData.value_usd ? parseFloat(formData.value_usd.replace(',', '.')) : null;

    // Seçilen serinin detaylarını bul (Kopya veriler için category, series_name vs)
    const selectedSeries = seriesList.find(s => s.id === formData.series_id);

    try {
      const { error } = await supabase
        .from('minifigures')
        .insert([
          {
            series_id: formData.series_id,
            name: formData.name,
            brand: formData.brand,
            category: selectedSeries?.category || '',
            series_name: selectedSeries?.title || '',
            series_no: selectedSeries?.series_no || '',
            figure_no: formData.figure_no,
            role: formData.role,
            type: formData.type,
            code: formData.code,
            piece_count: pieceCount,
            body_material: formData.body_material,
            rarity: formData.rarity,
            value_usd: valueUsd,
            release_year: formData.release_year,
            images: uploadedImages.filter(Boolean) // Sadece dolu olan url'leri yolla
          }
        ]);

      if (error) throw error;
      alert('Tebrikler! Figür başarıyla Supabase veritabanına kaydedildi! 🎉');
      router.push('/admin/figurler');
    } catch (err: any) {
      console.error(err);
      alert('Kayıt Hatası: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black pb-24">
      {/* Header / Breadcrumb */}
      <div className="w-full bg-white border-b border-gray-200 px-12 py-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-500">
          <Link href="/admin/figurler" className="hover:text-black transition-colors">FİGÜRLER</Link>
          <ChevronRight size={14} />
          <span className="text-black">YENİ TANIMLAMA</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sol Kolon: Görseller & Magic Eraser */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border text-left border-gray-200 p-6 rounded-md shadow-sm mb-4">
             <h3 className="font-bold text-sm text-black mb-1">Figür Görselleri</h3>
             <p className="text-[11px] font-medium text-gray-500">Tıklayıp klasörden ürün kapak ve detay fotoğraflarını seçebilirsiniz.</p>
          </div>

          {/* 4'lü Grid Görsel Yükleme */}
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map(idx => (
              <label key={idx} className="aspect-[3/4] bg-white rounded-md border border-gray-200 shadow-sm flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer group relative overflow-hidden">
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
                     <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 group-hover:text-black">UPLOAD</span>
                   </>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} className="hidden" />
              </label>
            ))}
          </div>

          {/* Magic Eraser Modülü */}
          <div className="bg-white border text-left border-gray-200 p-6 rounded-md shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-bold text-sm text-black">
                <Wand2 size={16} className="text-[#D22B2B]" /> Magic Eraser
              </div>
              <p className="text-[11px] font-medium text-gray-500">Auto-remove background on upload via Browser AI</p>
            </div>
            
            <button 
              type="button"
              onClick={() => setMagicEraser(!magicEraser)}
              className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${magicEraser ? 'bg-[#D22B2B]' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${magicEraser ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Sağ Kolon: Form Verileri */}
        <div className="lg:col-span-7 pb-20">
          <form onSubmit={handleSave} className="space-y-0 w-full text-[13px] font-bold">
            
            {/* SERİ SEÇİMİ (Supabase'den dinamik geldi) */}
            <div className="flex border-b border-gray-200 items-center hover:bg-white transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-3 border-l-2 border-transparent group-hover:border-black transition-colors">
                  <label className="text-gray-900 block truncate font-black tracking-wide">
                    Ait Olduğu Seri <span className="text-[#D22B2B]">*</span>
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

            {/* DİĞER ALANLAR */}
            {[
              { name: 'name', label: 'Figür Adı', required: true, type: 'text', placeholder: 'Örn: Deep Sea Diver' },
              { name: 'brand', label: 'Marka', required: true, type: 'text', placeholder: 'Örn: LEGO®' },
              { name: 'figure_no', label: 'Figür Sıra No', required: false, type: 'text', placeholder: 'Örn: 16' },
              { name: 'role', label: 'Figür Rolü', required: false, type: 'text', placeholder: 'Örn: Kaşif' },
              { name: 'type', label: 'Figür Tipi', required: false, type: 'text', placeholder: 'Örn: Cesur / Meraklı' },
              { name: 'code', label: 'Figür Kodu', required: false, type: 'text', placeholder: 'Örn: col01-16' },
              { name: 'piece_count', label: 'Parça Sayısı', required: false, type: 'number', placeholder: 'Numara Girin (Örn: 6)' },
              { name: 'body_material', label: 'Gövde Materyali', required: false, type: 'text', placeholder: 'Abs Plastik' },
              { name: 'rarity', label: 'Nadirlik Derecesi', required: false, type: 'text', placeholder: 'Örn: Yaygın, Nadir, Çok Nadir' },
              { name: 'value_usd', label: 'Değer (USD)', required: false, type: 'text', placeholder: 'Örn: 25' },
              { name: 'release_year', label: 'Çıkış Yılı', required: false, type: 'text', placeholder: 'Örn: 2010' },
            ].map((field) => (
              <div key={field.name} className="flex border-b border-gray-200 items-center hover:bg-white transition-colors group">
                <div className="w-1/3 py-4 pr-4 pl-3 border-l-2 border-transparent group-hover:border-black transition-colors">
                  <label className="text-gray-900 block truncate font-black tracking-wide">
                    {field.label} {field.required && <span className="text-[#D22B2B]">*</span>}
                  </label>
                </div>
                <div className="w-2/3 py-2">
                  <input 
                    name={field.name}
                    type={field.type} 
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold placeholder:font-normal placeholder:opacity-30" 
                  />
                </div>
              </div>
            ))}

            <div className="mt-12 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-black text-white hover:bg-[#D22B2B] disabled:bg-gray-400 transition-colors px-16 py-5 text-[11px] font-black tracking-widest uppercase rounded-sm flex items-center gap-3 w-full md:w-auto justify-center shadow-lg"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> KAYDEDİLİYOR...</>
                ) : (
                  <><Save size={16} /> SAVE CHANGES</>
                )}
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}
