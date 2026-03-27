'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, ArrowRight, ImagePlus, Loader2, Save } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';

export default function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Next 15'te params artık bir Promise, use() ile çözüyoruz.
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Karakter Paketleri',
    series_no: '',
    brand: 'LEGO®',
    figure_count: '',
    release_date: ''
  });

  useEffect(() => {
    if (id) fetchSeries();
  }, [id]);

  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase.from('series').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'Karakter Paketleri',
          series_no: data.series_no || '',
          brand: data.brand || 'LEGO®',
          figure_count: data.figure_count ? data.figure_count.toString() : '',
          release_date: data.release_date || ''
        });
        setImageUrl(data.cover_image_url || null);
      }
    } catch (err: any) {
      alert("Hata: Seri bulanamadı.");
      router.push('/admin/seriler');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `series/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('minifigure-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('minifigure-images').getPublicUrl(filePath);
      setImageUrl(publicUrl);
    } catch (error: any) {
      alert('Resim Yükleme Hatası: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Lütfen Seri Adı alanını doldurun.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('series')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          series_no: formData.series_no,
          brand: formData.brand,
          figure_count: formData.figure_count ? parseInt(formData.figure_count) : null,
          release_date: formData.release_date,
          cover_image_url: imageUrl
        })
        .eq('id', id);

      if (error) throw error;
      alert('Seri başarıyla GÜNCELLENDİ! 🎉');
      router.push('/admin/seriler');
    } catch (err: any) {
      alert('Güncelleme Hatası: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="animate-spin text-gray-400" size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black pb-24">
      {/* Header / Breadcrumb */}
      <div className="w-full bg-white border-b border-gray-200 px-12 py-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-500">
          <Link href="/admin/seriler" className="hover:text-black transition-colors">SERİLER</Link>
          <ChevronRight size={14} />
          <span className="text-black">DÜZENLE: {formData.title}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sol Kolon: Görsel Yükleme */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border text-left border-gray-200 p-6 rounded-md shadow-sm mb-4">
            <h3 className="font-bold text-sm text-black mb-1">Seri Kapak Görseli</h3>
            <p className="text-[11px] font-medium text-gray-500">Tavsiye edilen boyut: 800x600px. PNG veya WEBP.</p>
          </div>
          
          <label className="aspect-[4/3] bg-white rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-black transition-all cursor-pointer relative overflow-hidden group shadow-sm">
            {uploading ? (
              <div className="flex flex-col items-center text-black">
                <Loader2 size={32} className="animate-spin mb-4" />
                <span className="text-[10px] font-black tracking-widest uppercase">YÜKLENİYOR...</span>
              </div>
            ) : imageUrl ? (
              <img src={imageUrl} alt="Cover Preview" className="w-full h-full object-contain p-4 mix-blend-multiply" />
            ) : (
              <>
                <ImagePlus size={32} className="mb-4 group-hover:scale-110 group-hover:text-black transition-transform" />
                <span className="text-[10px] font-black tracking-widest uppercase group-hover:text-black transition-colors">Tıkla ve Görsel Seç</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
          </label>
        </div>

        {/* Sağ Kolon: Form Verileri */}
        <div className="lg:col-span-7 pb-20">
          <form onSubmit={handleSave} className="space-y-0 w-full text-[13px] font-bold">
            
            {[
              { name: 'title', label: 'Seri Adı (Title)', required: true, type: 'text', placeholder: 'Örn: LEGO® Minifigürler Serisi 27' },
              { name: 'brand', label: 'Marka', required: true, type: 'text', placeholder: 'Örn: LEGO®' },
              { name: 'series_no', label: 'Seri No', required: true, type: 'text', placeholder: 'Örn: 71050' },
              { name: 'category', label: 'Kategori', required: true, type: 'select', 
                options: ['Karakter Paketleri', 'Koleksiyon Serileri', 'Özel Tematik Seriler'] },
              { name: 'figure_count', label: 'Figür Sayısı', required: false, type: 'number', placeholder: 'Örn: 12' },
              { name: 'release_date', label: 'Çıkış Tarihi', required: false, type: 'text', placeholder: 'Örn: Eylül 2025' },
            ].map((field) => (
              <div key={field.name} className="flex border-b border-gray-200 items-center hover:bg-white transition-colors group">
                <div className="w-1/3 py-5 pr-4 pl-3 border-l-2 border-transparent group-hover:border-black transition-colors">
                  <label className="text-gray-900 block truncate font-black tracking-wide">
                    {field.label} {field.required && <span className="text-[#D22B2B]">*</span>}
                  </label>
                </div>
                <div className="w-2/3 py-3">
                  {field.type === 'select' ? (
                    <select 
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold appearance-none"
                    >
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input 
                      name={field.name}
                      type={field.type} 
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-bold placeholder:font-medium placeholder:opacity-30" 
                    />
                  )}
                </div>
              </div>
            ))}
            
            {/* Description TextArea */}
            <div className="flex border-b border-gray-200 items-start hover:bg-white transition-colors group">
              <div className="w-1/3 pt-6 pr-4 pl-3 border-l-2 border-transparent group-hover:border-black transition-colors">
                <label className="text-gray-900 block truncate font-black tracking-wide">
                  Hikaye / Açıklama
                </label>
              </div>
              <div className="w-2/3 py-4">
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Bu serinin hikayesi ve detaylı açıklaması..."
                  className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold placeholder:font-medium placeholder:opacity-30 min-h-[150px] resize-y" 
                />
              </div>
            </div>

            {/* update Button */}
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
