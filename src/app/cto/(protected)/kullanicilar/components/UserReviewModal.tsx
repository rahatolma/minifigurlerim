'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getUserDetailedInfo } from '@/app/cto/actions/user_admin';

interface ModalProps {
  userId: string;
  isApproved: boolean;
  role: string;
  onClose: () => void;
  onApprove: () => void;
  onBan: () => void;
  loadingAction: boolean;
}

export default function UserReviewModal({ userId, isApproved, role, onClose, onApprove, onBan, loadingAction }: ModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loadingObj, setLoadingObj] = useState(true);

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
                 <div className="text-sm font-bold text-gray-900 truncate">{details?.email || 'Bilinmiyor'}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Koleksiyon Figürü</div>
                    <div className="text-2xl font-black text-blue-900">{details?.collectionCount || 0}</div>
                 </div>
                 <div className="bg-yellow-50/50 rounded-xl p-4 border border-yellow-100">
                    <div className="text-[10px] text-yellow-500 font-black uppercase tracking-widest mb-1">Bırakılan Yorum</div>
                    <div className="text-2xl font-black text-yellow-900">{details?.ratingCount || 0}</div>
                 </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                 <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Son Giriş Zamanı</div>
                 <div className="text-sm font-medium text-gray-700">
                    {details?.lastSignIn ? new Date(details.lastSignIn).toLocaleString('tr-TR') : 'Hiç giriş yapmamış olabilir'}
                 </div>
              </div>
           </div>
        )}

        {/* Aksiyon Butonları */}
        {role !== 'banned' && (
           <div className="flex gap-3">
              <button 
                 onClick={onBan}
                 disabled={loadingAction || loadingObj}
                 className="flex-1 py-4 rounded-xl text-xs font-black tracking-widest uppercase bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-100"
              >
                 Reddet (Banla)
              </button>
              
              <button 
                 onClick={() => { onApprove(); onClose(); }}
                 disabled={loadingAction || loadingObj}
                 className={`flex-1 py-4 rounded-xl text-xs font-black tracking-widest uppercase text-white transition-colors shadow-md disabled:opacity-50 ${isApproved ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-[#5CB85C] hover:bg-green-600'}`}
              >
                 {loadingAction ? 'Bekleyin...' : (isApproved ? 'Onayı Geri Al' : 'Hesabı Onayla')}
              </button>
           </div>
        )}
      </div>
    </div>,
    document.body
  );
}
