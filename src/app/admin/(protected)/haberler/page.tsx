'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsListPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setNews(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Haberler çekilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if(!confirm(`DİKKAT: "${title}" adlı haberi silmek istediğinize emin misiniz?`)) return;
    
    // Haberin görsellerini de silmek iyi bir pratiktir ancak şimdilik sadece kaydı siliyoruz
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      toast.error('Silme hatası: ' + error.message);
    } else {
      toast.success('Haber başarıyla silindi.');
      fetchNews();
    }
  }

  const filteredNews = news.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (n.summary && n.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto p-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Haberler & Blog</h1>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">MINIFIG OS. ENTERPRISE SYSTEM</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Haberlerde Ara..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-sm px-4 py-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-black w-full md:w-64"
          />
          <Link href="/admin/haberler/yeni" className="bg-black text-white px-8 py-4 rounded-sm shadow-md text-xs font-black tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all uppercase whitespace-nowrap">
            <Plus size={16} /> Yeni Haber Ekle
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-24"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
      ) : (
        <div className="bg-white border text-left border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#fcfcfc] border-b border-gray-200 text-gray-600 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-8 py-5">Görsel</th>
                  <th className="px-8 py-5">Haber Başlığı</th>
                  <th className="px-8 py-5">Durum</th>
                  <th className="px-8 py-5">Görüntülenme</th>
                  <th className="px-8 py-5">Tarih</th>
                  <th className="px-8 py-5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-semibold text-[13px] text-gray-800">
                {filteredNews.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-bold">Veritabanında henüz bir haber kaydı bulunmuyor.</td></tr>
                ) : (
                  filteredNews.map((n: any) => (
                    <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-4">
                        {n.cover_image_url ? (
                          <img src={n.cover_image_url} alt={n.title} className="h-12 w-16 object-cover rounded-md border border-gray-200 bg-white" />
                        ) : (
                          <div className="h-12 w-16 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center text-[10px] text-gray-300">YOK</div>
                        )}
                      </td>
                      <td className="px-8 py-4 font-black text-gray-900 truncate max-w-xs" title={n.title}>{n.title}</td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${n.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {n.status === 'published' ? 'YAYINDA' : 'TASLAK'}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-bold text-gray-500">{n.total_views || 0}</td>
                      <td className="px-8 py-4 text-gray-400 font-medium">
                        {new Date(n.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-8 py-4">
                         <div className="flex items-center justify-end gap-1">
                           <Link href={`/admin/haberler/${n.id}`} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit size={16} /></Link>
                           <button onClick={() => handleDelete(n.id, n.title)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 size={16} /></button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
