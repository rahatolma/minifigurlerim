'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#D22B2B] text-white rounded-full shadow-[0_4px_14px_rgba(210,43,43,0.4)] hover:bg-[#B22222] transition-all hover:scale-110 flex items-center justify-center group"
          aria-label="Yukarı Çık"
        >
          <ArrowUp size={24} strokeWidth={2.5} className="group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </>
  );
}
