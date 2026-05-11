'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toggleCollectionStatus, saveRating } from '@/app/actions/collection';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

import { useAuth } from '@/components/providers/AuthProvider';
import { useGamification } from '@/components/providers/GamificationProvider';
import { trackAddToCollection, trackRemoveFromCollection, trackAddToWatchlist, trackRemoveFromWatchlist, FigureTrackingProps } from '@/lib/analytics';

export default function CollectionActions({ minifigureId, trackingProps }: { minifigureId: string, trackingProps: Omit<FigureTrackingProps, 'route'> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user } = useAuth();
  const { userStatusMap, updateStatus: setGlobalStatus } = useGamification();
  const isLoggedIn = !!user;
  const tCard = useTranslations('FigureCard');
  const tAction = useTranslations('CollectionActions');
  const tCommon = useTranslations('CommonTypes');

  const [loading, setLoading] = useState(false);
  
  // Local state for instant feedback, syncs with global
  const [status, setStatus] = useState<'have' | 'want' | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync with global gamification context
  useEffect(() => {
     if (searchParams.get('rate') === 'true') {
        setShowRatingModal(true);
        // Clean URL instantly to prevent race condition loop
        router.replace(pathname, { scroll: false });
     }
  }, [searchParams, pathname, router]);

  const closeRatingModal = () => {
     setShowRatingModal(false);
  };
   
   useEffect(() => {
    setStatus(userStatusMap[minifigureId] || null);
  }, [userStatusMap, minifigureId]);

  // Fetch initial rating from server just for this figure
  useEffect(() => {
    if (isLoggedIn && mounted) {
        fetch(`/api/rating?minifigure_id=${minifigureId}`)
            .then(res => res.json())
            .then(data => {
                if (data.rating) setRating(data.rating);
            })
            .catch(err => console.error(err));
    }
  }, [isLoggedIn, mounted, minifigureId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = async (type: 'have' | 'want') => {
    if (!isLoggedIn) {
       router.push('/login');
       return;
    }

    const previousStatus = status;
    const optimisticStatus = status === type ? null : type;
    
    // OPTIMISTIC UPDATE
    setStatus(optimisticStatus);
    setGlobalStatus(minifigureId, optimisticStatus);

    setLoading(true);
    try {
      const result = await toggleCollectionStatus(minifigureId, previousStatus, type); 
      
      if (result?.error) {
         // ROLLBACK ON ERROR
         setStatus(previousStatus);
         setGlobalStatus(minifigureId, previousStatus);
         if (result.code === 'UNAPPROVED_USER') {
             toast.error(tAction('ApprovalRequired'));
         } else {
             toast.error(result.error);
         }
      } else {
         // ANALYTICS TRACKING ON SUCCESS
         if (type === 'have') {
             if (optimisticStatus === 'have') trackAddToCollection({ ...trackingProps, route: pathname });
             else trackRemoveFromCollection({ ...trackingProps, route: pathname });
         } else if (type === 'want') {
             if (optimisticStatus === 'want') trackAddToWatchlist({ ...trackingProps, route: pathname });
             else trackRemoveFromWatchlist({ ...trackingProps, route: pathname });
         }
      }
    } catch (err) {
       // ROLLBACK ON CRITICAL ERROR
       console.error("Action error:", err);
       setStatus(previousStatus);
       setGlobalStatus(minifigureId, previousStatus);
       toast.error(tCommon('ERROR_UNKNOWN'));
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isLoggedIn) return router.push('/login');
      
      const form = e.currentTarget;
      const formData = new FormData(form);
      const starStr = formData.get('rating') as string;
      const star = parseInt(starStr, 10);

      if (!star) return;

      setLoading(true);
      const result = await saveRating(minifigureId, star);
      
      if (result?.success) {
         setRating(star);
         closeRatingModal();
      } else {
         alert(result?.error || tCommon('RATING_FAILED'));
      }
      setLoading(false);
  };

  // EĞER GİRİŞ YAPILMAMIŞSA, KARTLARDAKİ PREMIUM BLUR MANTIĞINI UYGULA
  if (!isLoggedIn) {
     return (
        <div className="w-full relative group/blur mt-2">
           {/* Static Fake Buttons */}
           <div className="flex flex-col gap-3 w-full pointer-events-none select-none opacity-40">
              <div className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border-2 bg-[#D22B2B] border-[#D22B2B] text-white shadow-sm">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                 <span className="text-[13px] md:text-[14px] uppercase tracking-widest font-black">
                    {tCard('AddToCollection')}
                 </span>
              </div>
              <div className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl border-2 bg-gray-50 border-gray-200 text-gray-700">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  <span className="text-[11px] md:text-[12px] uppercase tracking-[0.15em]">
                    {tCard('Follow')}
                  </span>
              </div>
              <div className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 flex items-center justify-center gap-2 font-bold text-sm">
                  <span className="text-yellow-400 text-lg">★</span> {tAction('GiveRating')}
              </div>
           </div>

           {/* Blur Overlay - EXACTLY like cards */}
           <div 
             onClick={() => router.push('/login')}
             className="absolute inset-[0] bg-white/40 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-[2px] rounded-2xl overflow-hidden cursor-pointer group/overlay mt-[-4px] mb-[-4px]"
           >
              <span className="text-[11px] font-black tracking-widest text-[#D22B2B] drop-shadow-[0_1px_1px_rgba(255,255,255,1)] text-center px-4 transition-all duration-300 opacity-0 translate-y-2 group-hover/overlay:opacity-100 group-hover/overlay:translate-y-0 absolute uppercase z-20">
                  {tCard('LoginToSeeDetails1')}<br/>{tCard('LoginToSeeDetails2')}
              </span>
           </div>
        </div>
     );
  }

  return (
    <div className="w-full flex flex-col gap-4">
       {/* 0. BAŞARI ROZETİ (GAMIFICATION) */}
       {status === 'have' && (
           <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center justify-between mb-2 shadow-sm animate-in fade-in slide-in-from-bottom-2">
               <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                   <div>
                       <h4 className="text-green-800 font-black text-sm uppercase tracking-wider mb-0.5">{tAction('SuccessTitle')}</h4>
                       <p className="text-green-700 font-medium text-[11px]">{tAction('SuccessDesc')}</p>
                   </div>
               </div>
           </div>
       )}

       {/* 1. Bende Var / İstiyorum Buton Grubu */}
       <div className="flex flex-col gap-3 w-full">
          <button 
             onClick={() => handleToggle('have')}
             disabled={loading}
             className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl transition-all border-2 ${status === 'have' ? 'bg-white border-green-500 text-green-600 shadow-sm opacity-50 hover:opacity-100' : 'bg-[#D22B2B] border-[#D22B2B] text-white hover:bg-red-700 hover:border-red-700 shadow-xl hover:-translate-y-1'}`}
          >
             {status === 'have' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
             ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
             )}
             <span className="text-[13px] md:text-[14px] uppercase tracking-widest font-black">
                {status === 'have' ? tCard('RemoveFromCollection') : tCard('AddToCollection')}
             </span>
          </button>
          
          <button 
             onClick={() => handleToggle('want')}
             disabled={loading}
             className={`w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl transition-all duration-300 border-2 ${status === 'want' ? 'bg-red-50 border-red-200 text-[#D22B2B] font-bold shadow-inner' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 font-medium shadow-sm hover:-translate-y-1 hover:shadow-md'}`}
          >
             {status === 'want' ? (
                <svg className="w-5 h-5 text-[#D22B2B]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
             ) : (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
             )}
             <span className="text-[11px] md:text-[12px] uppercase tracking-[0.15em]">
                {status === 'want' ? tCard('Unfollow') : tCard('Follow')}
             </span>
          </button>
       </div>

       {/* 2. Değerlendirme / Puanlama */}
       <button 
          onClick={() => {
             setShowRatingModal(true);
          }}
          className={`w-full py-3 px-4 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.04)] border flex items-center justify-center gap-2 font-bold text-sm transition-all duration-300 ${rating ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:-translate-y-1 hover:shadow-md'}`}
       >
          <span className="text-yellow-400 text-lg">★</span> 
          {rating ? `${rating} ${tAction('GivenStars')}` : tAction('GiveRating')}
       </button>

       {/* Puanlama Modalı (Portal) */}
       {mounted && showRatingModal && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
                <button onClick={() => closeRatingModal()} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h3 className="text-xl font-black text-center mb-2">{tAction('RateTitle')}</h3>
                <p className="text-xs text-gray-500 font-medium text-center mb-6">{tAction('RateDesc')}</p>
                
                <form onSubmit={submitRating} className="flex flex-col gap-6">
                   <div className="flex justify-center gap-2 flex-row-reverse star-rating-group mb-4">
                      {[5,4,3,2,1].map((val) => (
                         <div key={val} className="contents">
                           <input type="radio" id={`star${val}`} name="rating" value={val} className="hidden" defaultChecked={rating === val} required />
                           <label htmlFor={`star${val}`} className="text-4xl text-gray-200 cursor-pointer transition-colors">★</label>
                         </div>
                      ))}
                   </div>
                   
                   <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl hover:bg-gray-900 transition-colors uppercase tracking-widest text-xs">
                       {tAction('SaveRating')}
                   </button>
                </form>
             </div>
             
             {/* Simple CSS for star hover and checked effect mapping over display:contents */}
             <style dangerouslySetInnerHTML={{__html: `
                /* Hover state */
                .star-rating-group .contents:hover ~ .contents label,
                .star-rating-group .contents:hover label {
                   color: #FACC15 !important;
                }
                
                /* Checked state */
                .star-rating-group .contents:has(input:checked) ~ .contents label,
                .star-rating-group .contents:has(input:checked) label {
                   color: #FACC15 !important;
                }
             `}} />
          </div>,
          document.body
       )}
    </div>
  );
}
