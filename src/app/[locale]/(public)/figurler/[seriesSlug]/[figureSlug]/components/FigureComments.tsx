import { getAuthUser, getFigureRatings } from '@/services/action_dal';
import Image from 'next/image';

export default async function FigureComments({ minifigureId }: { minifigureId: string }) {
  const user = await getAuthUser();

  let ratings;
  let errorMsg = null;
  
  try {
     ratings = await getFigureRatings(minifigureId);
  } catch (err: any) {
     errorMsg = err.message;
  }

  if (errorMsg) {
    return <div className="text-red-500 py-4 text-xs">Yorumlar yüklenemedi: {errorMsg}</div>;
  }

  return (
    <div className="mt-16 pt-12 border-t border-gray-200 w-full mb-24">
      <div className="flex items-center justify-between mb-8">
         <h3 className="text-2xl font-black text-gray-900 tracking-tight">Koleksiyoner Podyumu</h3>
         <div className="bg-gray-100 text-gray-600 px-3 py-1 font-bold rounded-lg text-xs tracking-widest uppercase">
            {ratings?.length || 0} Değerlendirme
         </div>
      </div>

      {!ratings || ratings.length === 0 ? (
         <div className="py-12 text-center bg-gray-50 border border-gray-100 rounded-2xl w-full">
            <p className="text-gray-400 font-black text-sm tracking-widest uppercase mb-1">Podyum Boş</p>
            <p className="text-gray-400 text-xs">Bu efsane parçayı ilk değerlendiren sen ol!</p>
         </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ratings.map((r: any) => {
           // @ts-ignore
           const userProfile = r.profiles; 
           const avatar = userProfile?.avatar_url || 'https://via.placeholder.com/150/EEEEEE/999999?text=U';
           const name = userProfile?.username || 'Adsız Koleksiyoner';
           const isAdmin = userProfile?.role === 'admin';
           
           return (
             <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_5px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative bg-gray-50">
                          <Image src={avatar} alt={name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div>
                          <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                             {name}
                             {isAdmin && <span className="bg-[#D22B2B] text-white text-[8px] px-1.5 py-0.5 rounded tracking-widest uppercase font-black">Admin</span>}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{new Date(r.created_at).toLocaleDateString('tr-TR')}</p>
                      </div>
                   </div>
                   
                   {/* Puan Yıldızları Render */}
                   <div className="flex gap-0.5">
                     {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                     ))}
                   </div>
                </div>

                {/* Kullanıcı isteği üzerine metin yorumları tamamen kaldırıldı, sadece yıldız ve profil render ediliyor. */}
             </div>
           )
        })}
      </div>
      )}
    </div>
  );
}
