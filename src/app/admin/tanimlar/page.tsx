'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Plus, Loader2, Trash2, ChevronRight, Tags } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DefinitionsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [definitionGroups, setDefinitionGroups] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  
  const [openGroup, setOpenGroup] = useState<string>('seri_kategori');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Paralel veri çekimi (Hem Gruplar hem Alt Tanımlar)
      const [groupsRes, catsRes] = await Promise.all([
         supabase.from('definition_groups').select('*').order('created_at', { ascending: true }),
         supabase.from('categories').select('*').order('created_at', { ascending: false })
      ]);
      
      if (groupsRes.error) throw groupsRes.error;
      if (catsRes.error) throw catsRes.error;

      setDefinitionGroups(groupsRes.data || []);
      setCategories(catsRes.data || []);
      
      // Eğer seçili grup yoksa ilkini aç
      if (groupsRes.data && groupsRes.data.length > 0 && !openGroup) {
          setOpenGroup(groupsRes.data[0].slug);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Veriler yüklenirken bir hata oluştu.');
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

  const handleAddGroup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newGroupName.trim()) return;
      
      setIsAddingGroup(true);
      const slug = slugify(newGroupName.trim());
      
      try {
        const { error } = await supabase.from('definition_groups').insert([{ name: newGroupName.trim(), slug }]);
        if (error) throw error;
        
        toast.success(`Yepyeni Ana Grup Eklendi: ${newGroupName}`);
        setNewGroupName('');
        fetchData();
        setOpenGroup(slug); // Yeni grubu otomatik aç
      } catch (err: any) {
        toast.error("Grup Eklenemedi: Şema güncellenirken bekleyin veya " + err.message);
      } finally {
        setIsAddingGroup(false);
      }
  };

  const handleAddCategory = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsAdding(true);
    const slug = slugify(newName.trim());
    
    try {
      const { error } = await supabase.from('categories').insert([{ name: newName.trim(), slug, type }]);
      if (error) throw error;
      setNewName('');
      toast.success("Alt Tanım başarıyla eklendi.");
      fetchData();
    } catch (err: any) {
      toast.error("Alt Tanım Eklenemedi: " + err.message);
    } finally {
      setIsAdding(false);
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if(!confirm(`DİKKAT: "${name}" alt tanımını silmek istediğinize emin misiniz?`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if(error) {
        toast.error("Silme hatası: " + error.message);
    } else {
        toast.success("Alt Tanım silindi.");
        fetchData();
    }
  }

  const handleDeleteGroup = async (e: React.MouseEvent, id: string, name: string) => {
      e.stopPropagation(); // Accordion açılmasını engeller
      if(!confirm(`DİKKAT: Ana Grup olan "${name}" siliniyor! İçindeki tüm alt tanımlar sahipsiz kalabilir. Emin misiniz?`)) return;
      
      const { error } = await supabase.from('definition_groups').delete().eq('id', id);
      if(error) {
          toast.error("Grup silinemedi: " + error.message);
      } else {
          toast.success("Ana Grup silindi.");
          fetchData();
      }
  }

  return (
    <div className="p-12 pb-24 max-w-[1600px] w-full mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Sistem Tanımları</h1>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">ÇOKLU TANITIM VE VERİ YÖNETİMİ</p>
        </div>
        
        {/* YENİ ANA GRUP EKLEME FORMU - Apple Kafası Üst Bar */}
        <form onSubmit={handleAddGroup} className="flex bg-white shadow-sm border border-gray-200 p-2 rounded-xl focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all max-w-sm w-full">
            <div className="flex items-center pl-4 pr-2 text-gray-400">
                <Tags size={18} />
            </div>
            <input 
                type="text" 
                value={newGroupName} 
                onChange={e => setNewGroupName(e.target.value)} 
                placeholder="Yeni Ana Kategori Başlığı..." 
                className="flex-1 bg-transparent px-2 py-2 text-[13px] font-bold outline-none placeholder:font-medium placeholder:opacity-50"
            />
            <button 
                type="submit" 
                disabled={isAddingGroup || !newGroupName.trim()}
                className="bg-black text-white px-5 rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-[#D22B2B] disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
                {isAddingGroup ? <Loader2 size={14} className="animate-spin" /> : 'OLUŞTUR'}
            </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center p-24"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
      ) : (
        <div className="space-y-6">
          {definitionGroups.map(groupInfo => {
            const groupItems = categories.filter(c => c.type === groupInfo.slug);
            const isOpen = openGroup === groupInfo.slug;
            
            return (
              <div key={groupInfo.id} className={`bg-white border rounded-xl overflow-hidden transition-all duration-500 ${isOpen ? 'border-gray-300 shadow-md ring-4 ring-gray-50' : 'border-gray-200'}`}>
                <div 
                    onClick={() => {
                        setOpenGroup(isOpen ? '' : groupInfo.slug);
                        setNewName(''); 
                    }}
                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                    <div className="flex items-center gap-4">
                        <span className="font-black text-sm text-gray-900 uppercase tracking-widest">{groupInfo.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOpen ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {groupItems.length}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Gruh Silme Butonu */}
                        <button 
                            onClick={(e) => handleDeleteGroup(e, groupInfo.id, groupInfo.name)} 
                            className={`p-2 rounded-md transition-all text-gray-300 hover:text-red-600 hover:bg-red-50 ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            title="Bu Ana Grubu Sil"
                        >
                            <Trash2 size={16} />
                        </button>
                        <ChevronRight className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-black' : ''}`} size={20} />
                    </div>
                </div>
                
                <div className={`transition-all overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="border-t border-gray-100 bg-[#f8f8f8] p-8 flex flex-col gap-8">
                        
                        {/* Hızlı Alt Ekleme Formu */}
                        <form onSubmit={(e) => handleAddCategory(e, groupInfo.slug)} className="flex items-center gap-3">
                            <input 
                                type="text" 
                                value={isOpen ? newName : ''} 
                                onChange={e => setNewName(e.target.value)} 
                                placeholder={`${groupInfo.name} İçin Yeni Kayıt...`} 
                                className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-lg text-[13px] font-bold outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
                                required
                            />
                            <button 
                                type="submit" 
                                disabled={isAdding || !newName.trim()}
                                className="bg-black text-white px-8 py-4 rounded-lg font-black text-[12px] uppercase tracking-widest hover:bg-[#D22B2B] disabled:bg-gray-300 disabled:text-gray-500 transition-all flex items-center justify-center gap-2 shadow-md whitespace-nowrap"
                            >
                                {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
                                ALT TANIM EKLE
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
                                            <tr key={c.id} className="hover:bg-gray-50 hover:text-black group transition-colors">
                                                <td className="px-8 py-5 font-black text-gray-900 w-1/2">{c.name}</td>
                                                <td className="px-8 py-5 text-gray-400 text-[11px] font-medium w-1/3 group-hover:text-gray-500">{c.slug}</td>
                                                <td className="px-8 py-5 text-right w-1/6">
                                                    <button onClick={() => handleDeleteCategory(c.id, c.name)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100">
                                                        <Trash2 size={16} />
                                                    </button>
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
