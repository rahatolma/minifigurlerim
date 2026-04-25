'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Loader2, Save, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/cto/RichTextEditor';
import { updateAboutSettingsAction } from './actions';
import { uploadEntityMedia } from '@/services/media_dal';

export default function AboutSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tr' | 'en'>('tr');

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
    // EN Fields
    quote_text_en: '',
    quote_author_en: '',
    boss_title_en: '',
    boss_subtitle_en: '',
    boss_desc_en: '',
    main_title_en: '',
    main_text_en: '',
    mid_title_en: '',
    mid_subtitle_en: '',
    mid_desc_en: '',
    small_title_en: '',
    small_subtitle_en: '',
    small_desc_en: '',
    join_title_en: '',
    join_text_en: '',
    join_btn_text_en: '',
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
            // EN Fields
            quote_text_en: data.quote_text_en || '',
            quote_author_en: data.quote_author_en || '',
            boss_title_en: data.boss_title_en || '',
            boss_subtitle_en: data.boss_subtitle_en || '',
            boss_desc_en: data.boss_desc_en || '',
            main_title_en: data.main_title_en || '',
            main_text_en: data.main_text_en || '',
            mid_title_en: data.mid_title_en || '',
            mid_subtitle_en: data.mid_subtitle_en || '',
            mid_desc_en: data.mid_desc_en || '',
            small_title_en: data.small_title_en || '',
            small_subtitle_en: data.small_subtitle_en || '',
            small_desc_en: data.small_desc_en || '',
            join_title_en: data.join_title_en || '',
            join_text_en: data.join_text_en || '',
            join_btn_text_en: data.join_btn_text_en || '',
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
console.error(err);
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
      
      const formMedia = new FormData();
      formMedia.append('file', file);
      formMedia.append('entityType', 'about');
      formMedia.append('slug', 'site-settings');
      formMedia.append('field', fieldName);

      const publicUrl = await uploadEntityMedia(formMedia);

      setImageUrls(prev => ({ ...prev, [fieldName]: publicUrl }));
      toast.success('Görsel Şablonu Yüklendi. Lütfen en alttan DEĞİŞİKLİKLERİ KAYDET e basın.', { duration: 5000 });
    } catch (err: any) {
      console.error(err);
      toast.error('Yükleme hatası: ' + err.message);
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
console.error(err);
      toast.error('Silinirken hata oluştu');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = { ...formData, ...imageUrls };
    // TRACE KANITI: Payload'u detaylıca консолa bas
    console.log("🔥 TRACE 1 - ACTIONA GİDEN PAYLOAD:", {
      boss_image_url: payload.boss_image_url,
      hero_image_url: payload.hero_image_url,
      main_text: payload.main_text ? payload.main_text.substring(0, 30) + '...' : null,
      full_payload: payload
    });
    
    try {
      const response = await updateAboutSettingsAction(payload);
      console.log("🔥 TRACE 2 - DB'DEN DÖNEN YENİ ROW:", response);
      toast.success('Hakkımızda sayfası güncellendi! 🎉');
    } catch (err: any) {
console.error(err);
      toast.error('Hata: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranslate = async () => {
    if (!formData.main_text || !formData.boss_title) {
      toast.error('Önce Türkçe alanları doldurun!');
      return;
    }
    
    setIsTranslating(true);
    const toastId = toast.loading('Yapay Zeka çeviriyor, lütfen bekleyin...');
    
    try {
      const response = await fetch('/api/cto/translate-about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Çeviri servisi yanıt vermedi');
      
      const { data, success } = await response.json();
      
      if (success && data) {
        setFormData(prev => ({
          ...prev,
          quote_text_en: data.quote_text_en || prev.quote_text_en,
          quote_author_en: data.quote_author_en || prev.quote_author_en,
          boss_title_en: data.boss_title_en || prev.boss_title_en,
          boss_subtitle_en: data.boss_subtitle_en || prev.boss_subtitle_en,
          boss_desc_en: data.boss_desc_en || prev.boss_desc_en,
          main_title_en: data.main_title_en || prev.main_title_en,
          main_text_en: data.main_text_en || prev.main_text_en,
          mid_title_en: data.mid_title_en || prev.mid_title_en,
          mid_subtitle_en: data.mid_subtitle_en || prev.mid_subtitle_en,
          mid_desc_en: data.mid_desc_en || prev.mid_desc_en,
          small_title_en: data.small_title_en || prev.small_title_en,
          small_subtitle_en: data.small_subtitle_en || prev.small_subtitle_en,
          small_desc_en: data.small_desc_en || prev.small_desc_en,
          join_title_en: data.join_title_en || prev.join_title_en,
          join_text_en: data.join_text_en || prev.join_text_en,
          join_btn_text_en: data.join_btn_text_en || prev.join_btn_text_en,
        }));
        toast.success('Çeviri tamamlandı! Kaydetmeyi unutmayın.', { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Çeviri başarısız oldu: ' + err.message, { id: toastId });
    } finally {
      setIsTranslating(false);
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">HAKKIMIZDA DÜZENLEME</h1>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Sitedeki "Hakkımızda" Sayfasının Tüm Medya ve Metin İçerikleri</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('tr')}
              className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'tr' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}
            >
              TÜRKÇE İÇERİK
            </button>
            <button 
              onClick={() => setActiveTab('en')}
              className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'en' ? 'bg-[#D22B2B] shadow-sm text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              İNGİLİZCE (EN)
            </button>
            {activeTab === 'en' && (
              <button
                type="button"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="ml-4 px-4 py-2 bg-[#111] hover:bg-black text-white rounded-md font-black text-[11px] tracking-widest uppercase transition-all shadow-md flex items-center gap-2 disabled:bg-gray-400"
              >
                {isTranslating ? (
                  <><Loader2 className="animate-spin" size={14} /> ÇEVRİLİYOR...</>
                ) : (
                  <>🤖 OTOMATİK ÇEVİRİ YAP</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sol Kolon: Görseller */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#fffcf0] border text-left border-[#f59e0b] p-5 rounded-md shadow-sm mb-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-[#f59e0b]"></div>
             <h3 className="font-bold text-sm text-[#b45309] mb-1 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                 Kayıt Onayı Bekleniyor!
             </h3>
             <p className="text-[11px] font-bold text-gray-700 leading-relaxed mt-2">
                 Görselleri seçip <b>Önizlemesini gördüğünüzde</b> henüz veritabanına <span className="text-red-500 uppercase">YAZILMAZ</span>. Sitede aktif olması için işleminiz bittikten sonra sayfanın en altındaki kırmızı <b className="text-[#D22B2B]">"DEĞİŞİKLİKLERİ KAYDET"</b> butonuna basmanız zorunludur.
             </p>
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
                <div className="p-4 bg-black text-white px-6 font-black tracking-widest uppercase text-xs flex justify-between items-center">
                  <span>Hero & Alıntı Alanı</span>
                  {activeTab === 'en' && <span className="text-[#D22B2B] bg-white px-2 py-0.5 rounded text-[10px]">İNGİLİZCE</span>}
                </div>
                <div className="p-6 space-y-4">
                   <div>
                       <label className="block mb-2 text-gray-700">Kırmızı Kutucuk Sloganı</label>
                       <textarea name={activeTab === 'en' ? 'quote_text_en' : 'quote_text'} value={activeTab === 'en' ? formData.quote_text_en : formData.quote_text} onChange={handleChange} rows={2} className="w-full border border-gray-200 rounded p-3 focus:outline-black font-semibold text-gray-900" placeholder={activeTab === 'en' ? "If you have the courage to pursue..." : "Peşinden gidecek cesaretiniz varsa..."}></textarea>
                   </div>
                   <div>
                       <label className="block mb-2 text-gray-700">Alıntı Sahibi</label>
                       <input name={activeTab === 'en' ? 'quote_author_en' : 'quote_author'} value={activeTab === 'en' ? formData.quote_author_en : formData.quote_author} onChange={handleChange} className="w-full border border-gray-200 rounded p-3 focus:outline-black font-semibold text-gray-900" placeholder="Walt Disney" />
                   </div>
                </div>
            </div>

            {/* Büyük Patron */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="p-4 bg-black text-white px-6 font-black tracking-widest uppercase text-xs flex justify-between items-center">
                  <span>Büyük Patron (Sol Profil)</span>
                  {activeTab === 'en' && <span className="text-[#D22B2B] bg-white px-2 py-0.5 rounded text-[10px]">İNGİLİZCE</span>}
                </div>
                <div className="p-6 space-y-4">
                   <div><label className="block mb-2">Başlık</label><input name={activeTab === 'en' ? 'boss_title_en' : 'boss_title'} value={activeTab === 'en' ? formData.boss_title_en : formData.boss_title} onChange={handleChange} className="w-full border border-gray-200 rounded p-3 focus:outline-black" /></div>
                   <div><label className="block mb-2">Alt Başlık (Meslek vb.)</label><input name={activeTab === 'en' ? 'boss_subtitle_en' : 'boss_subtitle'} value={activeTab === 'en' ? formData.boss_subtitle_en : formData.boss_subtitle} onChange={handleChange} className="w-full border border-gray-200 rounded p-3 focus:outline-black" /></div>
                   <div><label className="block mb-2">Kısa Açıklama</label><textarea name={activeTab === 'en' ? 'boss_desc_en' : 'boss_desc'} value={activeTab === 'en' ? formData.boss_desc_en : formData.boss_desc} onChange={handleChange} rows={2} className="w-full border border-gray-200 rounded p-3 focus:outline-black text-xs font-semibold" /></div>
                </div>
            </div>

            {/* Ana Hikaye */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="p-4 bg-black text-white px-6 font-black tracking-widest uppercase text-xs flex justify-between items-center">
                  <span>Ana Metin (Sağ Taraf)</span>
                  {activeTab === 'en' && <span className="text-[#D22B2B] bg-white px-2 py-0.5 rounded text-[10px]">İNGİLİZCE</span>}
                </div>
                <div className="p-6 space-y-4">
                   <div><label className="block mb-2">Hikaye Başlığı</label><input name={activeTab === 'en' ? 'main_title_en' : 'main_title'} value={activeTab === 'en' ? formData.main_title_en : formData.main_title} onChange={handleChange} className="w-full border border-gray-200 rounded p-3 focus:outline-black" /></div>
                   <div>
                       <label className="block mb-2">Geniş Hikaye Metni</label>
                       {activeTab === 'en' ? (
                           <RichTextEditor key="en-editor" value={formData.main_text_en} onChange={(val) => setFormData(p => ({ ...p, main_text_en: val }))} placeholder="Sitenin kuruluş hikayesi (İngilizce)..." />
                       ) : (
                           <RichTextEditor key="tr-editor" value={formData.main_text} onChange={(val) => setFormData(p => ({ ...p, main_text: val }))} placeholder="Sitenin kuruluş hikayesi..." />
                       )}
                   </div>
                </div>
            </div>

            {/* Alt 3'lü */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden p-6 space-y-4 relative">
                 {activeTab === 'en' && <span className="absolute top-4 right-4 text-[#D22B2B] bg-gray-100 px-2 py-0.5 rounded text-[10px]">İNGİLİZCE</span>}
                 <h4 className="font-black border-b pb-2 mb-4">Ortanca Patron</h4>
                 <div><input name={activeTab === 'en' ? 'mid_title_en' : 'mid_title'} value={activeTab === 'en' ? formData.mid_title_en : formData.mid_title} onChange={handleChange} placeholder="Başlık" className="w-full border p-2 text-xs" /></div>
                 <div><input name={activeTab === 'en' ? 'mid_subtitle_en' : 'mid_subtitle'} value={activeTab === 'en' ? formData.mid_subtitle_en : formData.mid_subtitle} onChange={handleChange} placeholder="Alt Başlık" className="w-full border p-2 text-xs" /></div>
                 <div><textarea name={activeTab === 'en' ? 'mid_desc_en' : 'mid_desc'} value={activeTab === 'en' ? formData.mid_desc_en : formData.mid_desc} onChange={handleChange} rows={3} placeholder="Açıklama" className="w-full border p-2 text-xs" /></div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden p-6 space-y-4 relative">
                 {activeTab === 'en' && <span className="absolute top-4 right-4 text-[#D22B2B] bg-gray-100 px-2 py-0.5 rounded text-[10px]">İNGİLİZCE</span>}
                 <h4 className="font-black border-b pb-2 mb-4">Küçük Patron</h4>
                 <div><input name={activeTab === 'en' ? 'small_title_en' : 'small_title'} value={activeTab === 'en' ? formData.small_title_en : formData.small_title} onChange={handleChange} placeholder="Başlık" className="w-full border p-2 text-xs" /></div>
                 <div><input name={activeTab === 'en' ? 'small_subtitle_en' : 'small_subtitle'} value={activeTab === 'en' ? formData.small_subtitle_en : formData.small_subtitle} onChange={handleChange} placeholder="Alt Başlık" className="w-full border p-2 text-xs" /></div>
                 <div><textarea name={activeTab === 'en' ? 'small_desc_en' : 'small_desc'} value={activeTab === 'en' ? formData.small_desc_en : formData.small_desc} onChange={handleChange} rows={3} placeholder="Açıklama" className="w-full border p-2 text-xs" /></div>
              </div>
            </div>

            {/* Katılım Kutusu */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="p-4 bg-black text-white px-6 font-black tracking-widest uppercase text-xs flex justify-between items-center">
                  <span>Katılım / Ekip Kutusu (En Sağ)</span>
                  {activeTab === 'en' && <span className="text-[#D22B2B] bg-white px-2 py-0.5 rounded text-[10px]">İNGİLİZCE</span>}
                </div>
                <div className="p-6 space-y-4">
                   <div><label className="block mb-2 text-gray-700">Kutu Başlığı</label><input name={activeTab === 'en' ? 'join_title_en' : 'join_title'} value={activeTab === 'en' ? formData.join_title_en : formData.join_title} onChange={handleChange} className="w-full border p-3 focus:outline-black" /></div>
                   <div><label className="block mb-2 text-gray-700">Davet Metni</label><textarea name={activeTab === 'en' ? 'join_text_en' : 'join_text'} value={activeTab === 'en' ? formData.join_text_en : formData.join_text} onChange={handleChange} rows={3} className="w-full border p-3 focus:outline-black" /></div>
                   <div className="grid grid-cols-2 gap-4">
                     <div><label className="block mb-2 text-gray-700">Buton Sloganı</label><input name={activeTab === 'en' ? 'join_btn_text_en' : 'join_btn_text'} value={activeTab === 'en' ? formData.join_btn_text_en : formData.join_btn_text} onChange={handleChange} className="w-full border p-3 focus:outline-black" /></div>
                     <div><label className="block mb-2 text-gray-700">Buton Linki</label><input name="join_btn_link" value={formData.join_btn_link} onChange={handleChange} className="w-full border p-3 focus:outline-black text-gray-400" disabled={activeTab === 'en'} title="Link tüm dillerde ortaktır" /></div>
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
