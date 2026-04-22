'use client';
import { useState, useEffect } from 'react';
import { getApprovedCommentsClient, submitCommentClient } from '@/services/client_dal';
import { User, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export default function CommentsBlock({ entityType, entityId }: { entityType: string, entityId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    user_name: '',
    content: ''
  });

  const fetchComments = async () => {
    try {
      const data = await getApprovedCommentsClient(entityType, entityId);
      if (data) {
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) fetchComments();
  }, [entityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_name || !form.content) {
      toast.error('Lütfen adınızı ve yorumunuzu girin!');
      return;
    }

    setSubmitting(true);
    try {
      // Şimdilik test amaçlı otomatik 'approved' kaydediyoruz (İleride 'pending' yapılabilir)
      await submitCommentClient(entityType, entityId, form.user_name, form.content);

      
      toast.success('Yorumunuz başarıyla gönderildi!');
      setForm({ user_name: '', content: '' });
      fetchComments(); // Listeyi yenile
    } catch (err: any) {
console.error(err);
      toast.error('Yorum gönderilirken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-sm font-bold text-gray-400">Yorumlar Yükleniyor...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <MessageSquare size={24} className="text-[#D22B2B]" />
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Topluluk Yorumları</h3>
        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-auto">{comments.length} Yorum</span>
      </div>

      {/* Yorum Listesi */}
      <div className="space-y-6 mb-12">
        {comments.length === 0 ? (
           <p className="text-sm font-medium text-gray-500 italic">Henüz yorum yapılmamış. İlk yorumu sen yapmak istemez misin?</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                <User size={18} className="text-gray-400" />
              </div>
              <div className="flex flex-col flex-1 bg-white p-5 rounded-md border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="font-bold text-[13px] text-gray-900">{c.user_name}</h4>
                   <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                     {new Date(c.created_at).toLocaleDateString('tr-TR')}
                   </span>
                </div>
                <p className="text-[14px] text-gray-700 font-medium leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Yorum Formu (Şimdilik üyeliksiz herkese açık) */}
      <div className="bg-gray-50 p-6 sm:p-8 border border-gray-200 rounded-md">
         <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#D22B2B]" />
           Yorum Bırak
         </h4>
         <form onSubmit={handleSubmit} className="space-y-4">
           <div>
             <input 
               type="text" 
               placeholder="Adınız Veya Nickname'iniz..."
               value={form.user_name}
               onChange={(e) => setForm(prev => ({ ...prev, user_name: e.target.value }))}
               disabled={submitting}
               className="w-full border border-gray-300 rounded-sm px-4 py-3 text-[13px] font-semibold text-black focus:outline-none focus:border-black placeholder:text-gray-400"
               required
             />
           </div>
           <div>
             <textarea 
               placeholder="Buraya yorumunuzu yazın. Fikirlerinize kulak vermek çok isteriz!"
               value={form.content}
               onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
               disabled={submitting}
               className="w-full border border-gray-300 rounded-sm px-4 py-3 text-[13px] font-semibold text-black focus:outline-none focus:border-black min-h-[120px] resize-y placeholder:text-gray-400"
               required
             />
           </div>
           <div className="pt-2">
             <button 
               type="submit" 
               disabled={submitting}
               className="bg-black text-white hover:bg-[#D22B2B] disabled:bg-gray-400 transition-colors uppercase tracking-widest text-[11px] font-black px-8 py-4 rounded-sm shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
             >
               {submitting && <Loader2 size={14} className="animate-spin" />}
               {submitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
             </button>
           </div>
         </form>
      </div>

    </div>
  );
}
