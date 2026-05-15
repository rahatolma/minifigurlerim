'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AbonelerPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      const supabase = createClient();
      // Dummy query for now, assuming a 'newsletter_subscribers' table or similar exists
      // If it doesn't exist, this will just fail gracefully and show empty array
      const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }).limit(100);
      if (!error && data) {
        setSubscribers(data);
      }
      setLoading(false);
    };
    fetchSubscribers();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bülten Aboneleri</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Haber bültenine kayıt olan kullanıcıların salt okunur listesi.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">E-posta</th>
                <th className="px-6 py-4 font-bold tracking-wider">Kayıt Tarihi</th>
                <th className="px-6 py-4 font-bold tracking-wider">Kaynak / Dil</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Durum</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-medium">
                    Yükleniyor...
                  </td>
                </tr>
              ) : subscribers.length > 0 ? (
                subscribers.map((sub: any) => (
                  <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{sub.email}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(sub.created_at).toLocaleDateString('tr-TR')}</td>
                    <td className="px-6 py-4 text-gray-500">{sub.locale || sub.source || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${sub.status === 'active' || !sub.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <p className="text-gray-500 font-medium">Henüz bülten abonesi bulunmuyor.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
