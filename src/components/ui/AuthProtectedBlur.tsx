'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

export default function AuthProtectedBlur({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <div className="relative group/blur h-full">
        <div className={`transition-all h-full duration-300 ${!isLoggedIn ? 'pointer-events-none select-none blur-[2px]' : ''}`}>
            {children}
        </div>
        {!isLoggedIn && (
            <Link href="/login" className="absolute inset-[-20px] bg-white/40 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-[2px] rounded-3xl overflow-hidden cursor-pointer group/overlay border border-gray-100/30">
                <span className="text-[11px] font-black tracking-widest text-[#D22B2B] drop-shadow-[0_1px_1px_rgba(255,255,255,1)] text-center px-4 transition-all duration-300 opacity-0 translate-y-2 group-hover/overlay:opacity-100 group-hover/overlay:translate-y-0 absolute uppercase z-20">
                    Detayları görmek<br/>için erişim aç
                </span>
            </Link>
        )}
    </div>
  );
}
