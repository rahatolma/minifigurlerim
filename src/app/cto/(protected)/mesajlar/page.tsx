'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getContactMessagesAdmin, deleteContactMessageAdmin } from '@/app/cto/actions/message';

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await getContactMessagesAdmin();

    if (error) {
      toast.error(error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

    const { error } = await deleteContactMessageAdmin(id);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Mesaj silindi');
      setMessages(messages.filter(msg => msg.id !== id));
    }
  };

  const markAsReadUnread = async (id: number, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    // Geliştirmede is_read kolonumuz yok, fakat UI/UX düşünerek gelecekte eklenebilir. 
    // Şuan sadece görsel UI ya da basit toggle olarak dursun diye yer tutucu ekliyorum. 
    toast.success(currentStatus ? 'Okunmadı işaretlendi' : 'Okundu işaretlendi');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">GELEN MESAJLAR</h1>
          <p className="text-gray-500 text-sm mt-1">Sitenin iletişim formundan gönderilen mesajları yönet.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-bold">Yükleniyor...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-bold">Henüz gelen bir mesaj bulunmuyor.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((msg) => (
              <details key={msg.id} className="group p-4 hover:bg-gray-50 transition-colors [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                <summary className="flex items-center justify-between outline-none">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 flex-1 min-w-0">
                    <div className="flex flex-col min-w-[200px]">
                      <span className="text-black font-black text-sm">{msg.first_name} {msg.last_name}</span>
                      <a href={`mailto:${msg.email}`} className="text-gray-400 text-xs font-medium hover:text-blue-500 hover:underline">{msg.email}</a>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 pr-4">
                      <span className="text-black font-bold text-sm truncate">{msg.subject || 'Konu Belirtilmemiş'}</span>
                      <span className="text-gray-500 text-xs font-medium truncate mt-0.5" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'normal' }}>
                         {msg.message}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <span className="text-gray-400 text-xs font-bold whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button 
                        onClick={(e) => { e.preventDefault(); handleDelete(msg.id); }} 
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors"
                        title="Mesajı Sil"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                    <div className="text-gray-300 font-bold group-open:rotate-180 transition-transform duration-300">
                      ↓
                    </div>
                  </div>
                </summary>
                
                <div className="mt-4 pl-0 sm:pl-[224px] pr-12 pb-2">
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-md text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {msg.message}
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
