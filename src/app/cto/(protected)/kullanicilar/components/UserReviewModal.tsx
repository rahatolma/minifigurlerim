'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getUserDetailedInfo, banUserAction, unbanUserAction } from '@/app/cto/actions/user_admin';

interface ModalProps {
  userId: string;
  status: string;
  role: string;
  onClose: () => void;
  onApprove: () => void;
  loadingAction: boolean;
}

export default function UserReviewModal({ userId, status, role, onClose, onApprove, loadingAction }: ModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loadingObj, setLoadingObj] = useState(true);
  const [banReason, setBanReason] = useState('');
  const [isSubmittingBan, setIsSubmittingBan] = useState(false);

  useEffect(() => {
    async function fetchInfo() {
      const res = await getUserDetailedInfo(userId);
      if (res.success) {
        setDetails(res);
      }
      setLoadingObj(false);
    }
    fetchInfo();
  }, [userId]);

  const handleBan = async () => {
     if (!banReason.trim()) {
        alert("Lütfen bir yasaklama sebebi belirtin.");
        return;
     }
     setIsSubmittingBan(true);
     const res = await banUserAction(userId, banReason);
     if (res?.error) alert(res.error);
     setIsSubmittingBan(false);
     onClose();
  };

  const handleUnban = async () => {
     setIsSubmittingBan(true);
     const res = await unbanUserAction(userId, 'Yönetici tarafından yasak kaldırıldı');
     if (res?.error) alert(res.error);
     setIsSubmittingBan(false);
     onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h3 className="text-2xl font-black text-gray-900 mb-2">Detaylı İnceleme</h3>
        <p className="text-xs text-gray-500 font-medium mb-8">Kullanıcıyı onaylamadan veya silmeden önce sistemdeki faaliyetlerini ve gerçekliğini kontrol edin.</p>

        {loadingObj ? (
           <div className="py-12 flex justify-center items-center flex-col gap-3">
               <div className="w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Veriler Çekiliyor...</span>
           </div>
        ) : (
           <div className="space-y-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                 <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">E-Posta Adresi</div>
                 <div className="text-sm font-bold text-gray-900 truncate">{details?.profile?.email || 'Bilinmiyor'}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Koleksiyon Figürü</div>
                    <div className="text-2xl font-black text-blue-900">{details?.collections?.length || 0}</div>
                 </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                 <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Kayıt Tarihi</div>
                 <div className="text-sm font-medium text-gray-700">
                    {details?.profile?.created_at ? new Date(details.profile.created_at).toLocaleString('tr-TR') : 'Bilinmiyor'}
                 </div>
              </div>

              {status !== 'banned' && role !== 'admin' && (
                 <div className="mt-4">
                    <label className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1 block">Yasaklama Sebebi (Zorunlu)</label>
                    <textarea 
                       className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none h-20"
                       placeholder="Örn: Spam, sahte hesap..."
                       value={banReason}
                       onChange={(e) => setBanReason(e.target.value)}
                    ></textarea>
                 </div>
              )}
           </div>
        )}

        {/* Aksiyon Butonları */}
        {role !== 'admin' && (
           <div className="flex gap-3">
              {status === 'banned' ? (
                 <button 
                    onClick={handleUnban}
                    disabled={isSubmittingBan || loadingObj}
                    className="flex-1 py-4 rounded-xl text-xs font-black tracking-widest uppercase bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50 border border-green-100"
                 >
                    {isSubmittingBan ? 'Bekleyin...' : 'Yasağı Kaldır'}
                 </button>
              ) : (
                 <button 
                    onClick={handleBan}
                    disabled={isSubmittingBan || loadingObj}
                    className="flex-1 py-4 rounded-xl text-xs font-black tracking-widest uppercase bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-100"
                 >
                    {isSubmittingBan ? 'Bekleyin...' : 'Banla'}
                 </button>
              )}
              
              <button 
                 onClick={() => { onApprove(); onClose(); }}
                 disabled={loadingAction || loadingObj || isSubmittingBan}
                 className={`flex-1 py-4 rounded-xl text-xs font-black tracking-widest uppercase text-white transition-colors shadow-md disabled:opacity-50 ${status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-[#5CB85C] hover:bg-green-600'}`}
              >
                 {loadingAction ? 'Bekleyin...' : (status === 'active' ? 'Onayı Geri Al' : 'Hesabı Onayla')}
              </button>
           </div>
        )}
      </div>
    </div>,
    document.body
  );
}
