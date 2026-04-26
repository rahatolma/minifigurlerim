'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function CollectorPodium({ ratings }: { ratings: any[] }) {
    const t = useTranslations('FigurePodium');
    const router = useRouter();
    const pathname = usePathname();
    const handleOpenRating = () => {
        router.push(`${pathname}?rate=true`, { scroll: false });
    };

    return (
        <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full">
            <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">{t('title')}</h3>
                    <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{t('reviewCount', { count: ratings?.length || 0 })}</span>
                </div>
            </div>

            {!ratings || ratings.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-gray-50/50 border border-dashed border-gray-200 rounded-xl py-12 px-4 text-center">
                    <h4 className="text-gray-400 font-black text-sm uppercase tracking-widest mb-1">{t('emptyTitle')}</h4>
                    <p className="text-gray-400 text-xs mb-6">{t('emptyDescription')}</p>
                    <button 
                        onClick={handleOpenRating}
                        className="bg-white border border-gray-200 text-gray-900 hover:border-blue-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-all shadow-sm"
                    >
                        {t('cta')}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ratings.map((r: any) => {
                            const userProfile = r.profiles;
                            const avatar = userProfile?.avatar_url || 'https://via.placeholder.com/150/EEEEEE/999999?text=U';
                            const name = userProfile?.username || t('anonymousCollector');
                            const isAdmin = userProfile?.role === 'admin';

                            return (
                                <div key={r.id} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative bg-white shrink-0">
                                            <Image src={avatar} alt={name} fill className="object-cover" sizes="40px" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                                <span className="truncate max-w-[100px] sm:max-w-[150px]">{name}</span>
                                                {isAdmin && <span className="bg-[#D22B2B] text-white text-[8px] px-1 py-0.5 rounded tracking-widest uppercase font-black shrink-0">Admin</span>}
                                            </p>
                                            <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium tracking-wide mt-0.5">{new Date(r.created_at).toLocaleDateString('tr-TR')}</p>
                                        </div>
                                    </div>

                                    {/* Puan Yıldızları Render */}
                                    <div className="flex gap-0.5 shrink-0">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < r.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    
                    <div className="w-full flex justify-center mt-4">
                        <button 
                            onClick={handleOpenRating}
                            className="bg-white border border-gray-200 text-gray-500 hover:border-blue-500 hover:text-blue-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-all"
                        >
                            {t('addReview')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
