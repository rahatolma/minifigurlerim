'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Plus, Loader2, Trash2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DefinitionsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [openGroup, setOpenGroup] = useState<string>('seri_kategori');

  const definitionTypes = [
    { id: 'seri_kategori', label: 'Seri Kategorisi' },
    { id: 'figur_rolu', label: 'Figür Rolü' },
    { id: 'figur_tipi', label: 'Figür Tipi' },
    { id: 'figur_nadirliği', label: 'Figür Nadirliği' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const slugify = (text: string) => {
    let result = text;
    const trMap: { [key: string]: string } = {
      'çÇ': 'c', 'ğĞ': 'g', 'şŞ': 's', 'üÜ': 'u', 'ıİ': 'i', 'öÖ': 'o'
    };
    for (let key in trMap) {
      result = result.replace(new RegExp('[' + key + ']', 'g'), trMap[key]);
    }
    return result.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const handleAdd = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsAdding(true);
    const slug = slugify(newName.trim());
    
    try {
      const { error } = await supabase.from('categories').insert([{ name: newName.trim(), slug, type }]);
      if (error) throw error;
      setNewName('');
      toast.success("Tanım başarıyla eklendi.");
      fetchCategories();
    } catch (err: any) {
      toast.error("Tanım Eklenemedi: " + err.message);
    } finally {
      setIsAdding(false);
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if(!confirm(`DİKKAT: "${name}" tanımını silmek istediğinize emin misiniz?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if(error) {
        toast.error("Silme hatası: " + error.message);
    } else {
        toast.success("Tanım başarıyla silindi.");
        fetchCategories();
    }
  }

  return (
    <div className="p-12 pb-24 max-w-[1600px] w-full mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Sistem Tanımları</h1>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">ÇOKLU TANITIM VE VERİ YÖNETİMİ</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-24"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
      ) : (
        <div className="space-y-6">
          {definitionTypes.map(typeDef => {
            const groupItems = categories.filter(c => c.type === typeDef.id);
            const isOpen = openGroup === typeDef.id;
            
            return (
              <div key={typeDef.id} className={`bg-white border rounded-xl overflow-hidden transition-all duration-500 ${isOpen ? 'border-gray-300 shadow-md ring-4 ring-gray-50' : 'border-gray-200'}`}>
                <button 
                    onClick={() => {
                        setOpenGroup(isOpen ? '' : typeDef.id);
                        setNewName(''); // Sekme değiştiğinde inputu temizle
                    }}
                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <span className="font-black text-sm text-gray-900 uppercase tracking-widest">{typeDef.label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOpen ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {groupItems.length}
                        </span>
                    </div>
                    <ChevronRight className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-black' : ''}`} size={20} />
                </button>
                
                <div className={`transition-all overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="border-t border-gray-100 bg-[#f8f8f8] p-8 flex flex-col gap-8">
                        
                        {/* Hızlı Ekleme Formu */}
                        <form onSubmit={(e) => handleAdd(e, typeDef.id)} className="flex items-center gap-3">
                            <input 
                                type="text" 
                                value={isOpen ? newName : ''} 
                                onChange={e => setNewName(e.target.value)} 
                                placeholder={`Yeni ${typeDef.label} Ekle...`} 
                                className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-lg text-[13px] font-bold outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
                                required
                            />
                            <button 
                                type="submit" 
                                disabled={isAdding || !newName.trim()}
                                className="bg-black text-white px-8 py-4 rounded-lg font-black text-[12px] uppercase tracking-widest hover:bg-[#D22B2B] disabled:bg-gray-300 disabled:text-gray-500 transition-all flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
                            >
                                {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
                                EKLE
                            </button>
                        </form>

                        {/* Liste */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            {groupItems.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 font-bold text-[12px] tracking-wide">Bu grupta henüz bir kayıt yok.</div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <tbody className="divide-y divide-gray-100 font-semibold text-[13px] text-gray-700">
                                        {groupItems.map(c => (
                                            <tr key={c.id} className="hover:bg-gray-50 group transition-colors">
                                                <td className="px-8 py-5 font-black text-gray-900 w-1/2">{c.name}</td>
                                                <td className="px-8 py-5 text-gray-400 text-[11px] font-medium w-1/3">{c.slug}</td>
                                                <td className="px-8 py-5 text-right w-1/6">
                                                    <button onClick={() => handleDelete(c.id, c.name)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                    </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
