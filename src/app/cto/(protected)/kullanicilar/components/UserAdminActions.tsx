'use client';
import { useState } from 'react';
import { toggleUserApproval, banUserAction, unbanUserAction } from '@/app/cto/actions/user_admin';
import UserReviewModal from './UserReviewModal';

export default function UserAdminActions({ userId, status, role, currentUserId }: { userId: string, status: string, role: string, currentUserId?: string }) {
   const [loading, setLoading] = useState(false);
   const [showModal, setShowModal] = useState(false);

   const handleApproveToggle = async () => {
       setLoading(true);
       const result = await toggleUserApproval(userId, status === 'active', status);
       if (result?.error) alert(result.error);
       setLoading(false);
   };

   const isBanned = status === 'banned';
   const isAdmin = role === 'admin';
   const isSelf = userId === currentUserId;

   return (
      <div className="flex justify-end gap-2 items-center">
         {isAdmin && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mr-2">Sistem Yöneticisi</span>}
         
         <button 
             onClick={() => setShowModal(true)} 
             className="py-2 px-3 rounded text-[10px] font-black tracking-widest uppercase bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1"
             title="Kullanıcı Detayları"
         >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            İNCELE
         </button>

         {!isBanned && !isSelf && (
            <button 
                disabled={loading}
                onClick={handleApproveToggle} 
                className={`py-2 px-4 rounded text-[10px] font-black tracking-widest uppercase transition-colors ${
                   status === 'active' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
            >
               {loading ? '...' : (status === 'active' ? 'Onayı Kaldır' : 'Hesabı Onayla')}
            </button>
         )}

         {showModal && (
            <UserReviewModal 
               userId={userId}
               role={role}
               status={status}
               onClose={() => setShowModal(false)}
               loadingAction={loading}
               onApprove={handleApproveToggle}
            />
         )}
      </div>
   );
}
