'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Loader2, Save, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function AboutSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    quote_text: '',
    quote_author: '',
    boss_title: '',
    boss_subtitle: '',
    boss_desc: '',
    main_title: '',
    main_text: '',
    mid_title: '',
    mid_subtitle: '',
    mid_desc: '',
    small_title: '',
    small_subtitle: '',
    small_desc: '',
    join_title: '',
    join_text: '',
    join_btn_text: '',
    join_btn_link: '/iletisim',
  });

  const [imageUrls, setImageUrls] = useState({
    hero_image_url: null as string | null,
    boss_image_url: null as string | null,
    mid_image_url: null as string | null,
    small_image_url: null as string | null,
    join_image_url: null as string | null,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('about_settings').select('*').eq('id', 1).single();
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setFormData({
            quote_text: data.quote_text || '',
            quote_author: data.quote_author || '',
            boss_title: data.boss_title || '',
            boss_subtitle: data.boss_subtitle || '',
            boss_desc: data.boss_desc || '',
            main_title: data.main_title || '',
            main_text: data.main_text || '',
            mid_title: data.mid_title || '',
            mid_subtitle: data.mid_subtitle || '',
            mid_desc: data.mid_desc || '',
            small_title: data.small_title || '',
            small_subtitle: data.small_subtitle || '',
            small_desc: data.small_desc || '',
            join_title: data.join_title || '',
            join_text: data.join_text || '',
            join_btn_text: data.join_btn_text || 'FORMU DOLDURUNUZ',
            join_btn_link: data.join_btn_link || '/iletisim',
        });
        setImageUrls({
            hero_image_url: data.hero_image_url || null,
            boss_image_url: data.boss_image_url || null,
            mid_image_url: data.mid_image_url || null,
            small_image_url: data.small_image_url || null,
            join_image_url: data.join_image_url || null,
        });
      }
    } catch (err: any) {
      toast.error('Ayarlar yüklenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof imageUrls) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploadingField(fieldName);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `about/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('minifigure-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('minifigure-images').getPublicUrl(filePath);
      setImageUrls(prev => ({ ...prev, [fieldName]: publicUrl }));
    } catch (error: any) {
      toast.error('Resim Yükleme Hatası: ' + error.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveImage = async (fieldName: keyof typeof imageUrls) => {
    const url = imageUrls[fieldName];
    if (!url) return;
    try {
      const path = url.split('/minifigure-images/')[1];
      if (path) {
        await supabase.storage.from('minifigure-images').remove([path]);
      }
      setImageUrls(prev => ({ ...prev, [fieldName]: null }));
    } catch (err: any) {
      toast.error('Silinirken hata oluştu');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('about_settings').upsert({ id: 1, ...formData, ...imageUrls });
      if (error) throw error;
      toast.success('Hakkımızda sayfası güncellendi! 🎉');
    } catch (err: any) {
      toast.error('Hata: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadBoxes = [
    { id: 'hero_image_url', title: '1. Tepe (Hero) Mozaik', desc: 'En üstteki büyük yatay görsel.' },
    { id: 'boss_image_url', title: '2. Büyük Patron', desc: 'Hikaye metninin solundaki kare profil.' },
    { id: 'mid_image_url', title: '3. Ortanca Patron', desc: 'Alttaki üçlü gruptan soldaki.' },
    { id: 'small_image_url', title: '4. Küçük Patron', desc: 'Alttaki üçlü gruptan ortadaki.' },
    { id: 'join_image_url', title: '5. Katılım Görseli', desc: 'En sağdaki CTA kutusunun görseli.' },
  ];

  if (loading) return <div className="p-24 flex justify-center"><Loader2 className="animate-spin text-gray-300" size={40} /></div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto p-12 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">HAKKIMIZDA DÜZENLEME</h1>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Sitedeki "Hakkımızda" Sayfasının Tüm Medya ve Metin İçerikleri</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sol Kolon: Görseller */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border text-left border-gray-200 p-6 rounded-md shadow-sm mb-4">
             <h3 className="font-bold text-sm text-black mb-1">Medya Yöneticisi</h3>
             <p className="text-[11px] font-medium text-gray-500">Sayfadaki tüm görselleri buradan güncelleyin.</p>
          </div>
          {uploadBoxes.map(box => (
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
                        <img src={(imageUrls as any)[box.id]} className="w-full h-full object-contain mix-blend-multiply border-none" />
                      ) : (
                        <>
                          <ImagePlus size={20} className="mb-2 group-hover:scale-110 group-hover:text-black transition-transform" />
                          <span className="text-[9px] font-black tracking-widest uppercase group-hover:text-black transition-colors">Tıkla ve Görsel Seç</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, box.id as any)} className="hidden" />
                   </label>
                   {(imageUrls as any)[box.id] && (
                     <button type="button" onClick={(e) => { e.preventDefault(); handleRemoveImage(box.id as any); }} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors z-20">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </button>
                   )}
                 </div>
               </div>
          ))}
        </div>

        {/* Sağ Kolon: Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="space-y-8 text-[13px] font-bold">
            
            {/* Üst Alıntı */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="p-4 bg-black text-white px-6 font-black tracking-widest uppercase text-xs">Hero & Alıntı Alanı</div>
                <div className="p-6 space-y-4">
                   <div>
                       <label className="block mb-2 text-gray-700">Kırmızı Kutucuk Sloganı</label>
                       <textarea name="quote_text" value={formData.quote_text} onChange={handleChange} rows={2} className="w-full border border-gray-200 rounded p-3 focus:outline-black font-semibold text-gray-900" placeholder="Peşinden gidecek cesaretiniz varsa..."></textarea>
                   </div>
                   <div>
                       <label className="block mb-2 text-gray-700">Alıntı Sahibi</label>
                       <input name="quote_author" value={formData.quote_author} onChange={handleChange} className="w-full border border-gray-200 rounded p-3 focus:outline-black font-semibold text-gray-900" placeholder="Walt Disney" />
                   </div>
                </div>
            </div>

            {/* Büyük Patron */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="p-4 bg-black text-white px-6 font-black tracking-widest uppercase text-xs">Büyük Patron (Sol Profil)</div>
                <div className="p-6 space-y-4">
                   <div><label className="block mb-2">Başlık</label><input name="boss_title" value={formData.boss_title} onChange={handleChange} className="w-full border border-gray-200 rounded p-3 focus:outline-black" /></div>
                   <div><label className="block mb-2">Alt Başlık (Meslek vb.)</label><input name="boss_subtitle" value={formData.boss_subtitle} onChange={handleChange} className="w-full border border-gray-200 rounded p-3 focus:outline-black" /></div>
                   <div><label className="block mb-2">Kısa Açıklama</label><textarea name="boss_desc" value={formData.boss_desc} onChange={handleChange} rows={2} className="w-full border border-gray-200 rounded p-3 focus:outline-black text-xs font-semibold" /></div>
                </div>
            </div>

            {/* Ana Hikaye */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="p-4 bg-black text-white px-6 font-black tracking-widest uppercase text-xs">Ana Metin (Sağ Taraf)</div>
                <div className="p-6 space-y-4">
                   <div><label className="block mb-2">Hikaye Başlığı</label><input name="main_title" value={formData.main_title} onChange={handleChange} className="w-full border border-gray-200 rounded p-3 focus:outline-black" /></div>
                   <div>
                       <label className="block mb-2">Geniş Hikaye Metni</label>
                       <RichTextEditor value={formData.main_text} onChange={(val) => setFormData(p => ({ ...p, main_text: val }))} placeholder="Sitenin kuruluş hikayesi..." />
                   </div>
                </div>
            </div>

            {/* Alt 3'lü */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden p-6 space-y-4">
                 <h4 className="font-black border-b pb-2 mb-4">Ortanca Patron</h4>
                 <div><input name="mid_title" value={formData.mid_title} onChange={handleChange} placeholder="Başlık" className="w-full border p-2 text-xs" /></div>
                 <div><input name="mid_subtitle" value={formData.mid_subtitle} onChange={handleChange} placeholder="Alt Başlık" className="w-full border p-2 text-xs" /></div>
                 <div><textarea name="mid_desc" value={formData.mid_desc} onChange={handleChange} rows={3} placeholder="Açıklama" className="w-full border p-2 text-xs" /></div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden p-6 space-y-4">
                 <h4 className="font-black border-b pb-2 mb-4">Küçük Patron</h4>
                 <div><input name="small_title" value={formData.small_title} onChange={handleChange} placeholder="Başlık" className="w-full border p-2 text-xs" /></div>
                 <div><input name="small_subtitle" value={formData.small_subtitle} onChange={handleChange} placeholder="Alt Başlık" className="w-full border p-2 text-xs" /></div>
                 <div><textarea name="small_desc" value={formData.small_desc} onChange={handleChange} rows={3} placeholder="Açıklama" className="w-full border p-2 text-xs" /></div>
              </div>
            </div>

            {/* Katılım Kutusu */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="p-4 bg-black text-white px-6 font-black tracking-widest uppercase text-xs">Katılım / Ekip Kutusu (En Sağ)</div>
                <div className="p-6 space-y-4">
                   <div><label className="block mb-2 text-gray-700">Kutu Başlığı</label><input name="join_title" value={formData.join_title} onChange={handleChange} className="w-full border p-3 focus:outline-black" /></div>
                   <div><label className="block mb-2 text-gray-700">Davet Metni</label><textarea name="join_text" value={formData.join_text} onChange={handleChange} rows={3} className="w-full border p-3 focus:outline-black" /></div>
                   <div className="grid grid-cols-2 gap-4">
                     <div><label className="block mb-2 text-gray-700">Buton Sloganı</label><input name="join_btn_text" value={formData.join_btn_text} onChange={handleChange} className="w-full border p-3 focus:outline-black" /></div>
                     <div><label className="block mb-2 text-gray-700">Buton Linki</label><input name="join_btn_link" value={formData.join_btn_link} onChange={handleChange} className="w-full border p-3 focus:outline-black text-gray-400" /></div>
                   </div>
                </div>
            </div>

            <div className="flex justify-end pt-8">
              <button disabled={isSubmitting} type="submit" className="bg-[#D22B2B] hover:bg-black transition-colors text-white py-4 px-12 rounded shadow-md font-black tracking-widest text-sm flex gap-3 disabled:bg-gray-400">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                DEĞİŞİKLİKLERİ KAYDET
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
