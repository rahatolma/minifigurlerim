'use client';

import { useEffect, useState } from 'react';

export default function ScrollDownHint() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            // Hide the hint after scrolling 100px down
            if (window.scrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check right after mount
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div 
            className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-10 pointer-events-none duration-500 transition-all ${
                isVisible ? 'opacity-70' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
             <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">AŞAĞI KAYDIR</span>
             <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100 text-[#D22B2B]">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                 </svg>
             </div>
        </div>
    );
}
