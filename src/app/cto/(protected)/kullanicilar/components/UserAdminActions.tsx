'use client';
import { useState } from 'react';
import { toggleUserApproval, deleteUserFromDB } from '@/app/cto/actions/user_admin';
import UserReviewModal from './UserReviewModal';

export default function UserAdminActions({ userId, isApproved, role }: { userId: string, isApproved: boolean, role: string }) {
   const [loading, setLoading] = useState(false);
   const [showModal, setShowModal] = useState(false);

   const handleApprove = async () => {
       setLoading(true);
       const result = await toggleUserApproval(userId, isApproved);
       if (result?.error) alert(result.error);
       setLoading(false);
   };

   const handleBan = async () => {
       if (!confirm('Bu kullanıcıyı yasaklamak istediğinize emin misiniz?')) return;
       setLoading(true);
       const result = await deleteUserFromDB(userId);
       if (result?.error) alert(result.error);
       setLoading(false);
   };

   const isBanned = role === 'banned';
   const isAdmin = role === 'admin';

   if (isAdmin && isApproved) {
       return <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sistem Yöneticisi</span>
   }

   return (
      <div className="flex justify-end gap-2">
         {/* İNCELE BUTONU */}
         <button 
             onClick={() => setShowModal(true)} 
             className="py-2 px-3 rounded text-[10px] font-black tracking-widest uppercase bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1"
             title="Kullanıcı Detayları"
         >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            İNCELE
         </button>

         {/* ONAYLA BUTONU */}
         {!isBanned && (
            <button 
                disabled={loading}
                onClick={handleApprove} 
                className={`py-2 px-4 rounded text-[10px] font-black tracking-widest uppercase transition-colors ${
                   isApproved ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
            >
               {loading ? '...' : (isApproved ? 'Onayı Kaldır' : 'Hesabı Onayla')}
            </button>
         )}

         {/* BAN BUTONU */}
         {!isBanned && (
            <button 
                disabled={loading}
                onClick={handleBan}
                className="py-2 px-3 rounded text-[10px] font-black tracking-widest uppercase bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                title="Sistemden Engelle"
            >
               BANLA
            </button>
         )}

         {showModal && (
            <UserReviewModal 
               userId={userId}
               role={role}
               isApproved={isApproved}
               onClose={() => setShowModal(false)}
               loadingAction={loading}
               onApprove={handleApprove}
               onBan={handleBan}
            />
         )}
      </div>
   );
}
