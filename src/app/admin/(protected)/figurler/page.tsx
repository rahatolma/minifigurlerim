'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { ChevronDown, ChevronRight, Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { deleteFigureData } from '@/app/admin/actions/figure';
import toast from 'react-hot-toast';

export default function FiguresListPage() {
  const [figures, setFigures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  useEffect(() => {
    fetchFigures();
  }, []);

  const fetchFigures = async () => {
    try {
      const { data, error } = await supabase.from('minifigures').select('*, series(title)').order('created_at', { ascending: false });
      if (error) throw error;
      setFigures(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if(!confirm(`DİKKAT: "${name}" figürünü silmek istediğinize emin misiniz?`)) return;
    
    const result = await deleteFigureData(id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
      fetchFigures();
    }
  }

  // Filtering
  const filteredFigures = figures.filter(f => 
       f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       (f.series?.title && f.series.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
       (f.series_name && f.series_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group by series
  const groupedFigures = filteredFigures.reduce((acc, f) => {
    const seriesName = f.series?.title || f.series_name || '🚀 Serisiz / Bağımsız Figürler';
    if (!acc[seriesName]) acc[seriesName] = [];
    acc[seriesName].push(f);
    return acc;
  }, {} as Record<string, any[]>);

  const toggleGroup = (groupName: string) => {
    if (expandedGroups.includes(groupName)) {
      setExpandedGroups(expandedGroups.filter(g => g !== groupName));
    } else {
      setExpandedGroups([...expandedGroups, groupName]);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">LEGO Figürleri</h1>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">MINIFIG OS. ENTERPRISE SYSTEM</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Koleksiyonda Ara..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-sm px-4 py-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-black w-full md:w-64"
          />
          <Link href="/admin/figurler/yeni" className="bg-black text-white px-8 py-4 rounded-sm shadow-md text-xs font-black tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all uppercase whitespace-nowrap">
            <Plus size={16} /> Yeni Figür Ekle
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-24"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedFigures).map(([groupName, groupFigs]: [string, any]) => {
            const isExpanded = expandedGroups.includes(groupName);
            return (
              <div key={groupName} className="bg-white border text-left border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div 
                  className="bg-[#fcfcfc] px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleGroup(groupName)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                    <h3 className="font-black text-gray-800 text-[13px] uppercase tracking-wider">{groupName} ({groupFigs.length})</h3>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-8 py-4">Görsel</th>
                            <th className="px-8 py-4">Figür Adı</th>
                            <th className="px-8 py-4">Nadir / Değer</th>
                            <th className="px-8 py-4 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-semibold text-[13px] text-gray-800">
                          {groupFigs.map((f: any) => {
                            const firstImage = (f.images && f.images.length > 0) ? f.images[0] : null;
                            return (
                              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-8 py-3 w-32">
                                  {firstImage ? (
                                    <img src={firstImage} alt={f.name} className="h-14 w-10 object-contain rounded-sm" />
                                  ) : (
                                    <div className="h-14 w-10 bg-gray-50 rounded-sm border border-gray-100 flex items-center justify-center text-[10px] text-gray-300">YOK</div>
                                  )}
                                </td>
                                <td className="px-8 py-3 font-black text-gray-900 truncate max-w-[300px]">{f.name}</td>
                                <td className="px-8 py-3">
                                  <span className="block">{f.rarity || '-'}</span>
                                  <span className="text-green-600 font-black text-[11px] block mt-1">{f.value_usd ? `$${f.value_usd}` : '-'}</span>
                                </td>
                                <td className="px-8 py-3">
                                  <div className="flex items-center justify-end gap-1">
                                    <Link href={`/admin/figurler/${f.id}`} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit size={16} /></Link>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id, f.name); }} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 size={16} /></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(groupedFigures).length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-16 text-center text-gray-400 font-bold">
                Aranan kritere uygun figür bulunamadı.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
