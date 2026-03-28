'use client';
import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';

export default function BeforeAfterSlider({ beforeImage, afterImage }: { beforeImage: string, afterImage: string }) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const x = clientX - left;
    const percent = Math.max(0, Math.min(100, (x / width) * 100));
    setPosition(percent);
  };

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleDrag(e.clientX);
  };

  const handleTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleDrag(e.touches[0].clientX);
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleDrag(e.clientX);
  };

  const handleTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleDrag(e.touches[0].clientX);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Add global mouseup listener to stop dragging if mouse leaves container while dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchend', handleEnd);
    } else {
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square max-w-[500px] bg-white rounded-2xl overflow-hidden cursor-ew-resize select-none touch-none shadow-[0_4px_30px_rgba(0,0,0,0.05)] border border-gray-100"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* ALT KATMAN (Before) */}
      <img 
        src={beforeImage} 
        alt="Before" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none p-4"
        draggable={false}
      />

      {/* ÜST KATMAN (After - Kesilmiş) */}
      <img 
        src={afterImage} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none p-4"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />

      {/* Slider Ayraç Çizgisi ve Tutamaç */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white/30 backdrop-blur-md shadow-2xl pointer-events-none z-10"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-[0_0_20px_rgba(0,0,0,0.2)] rounded-full flex items-center justify-center border-4 border-[#D22B2B]">
           {/* İki yönlü ok ikonu */}
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#D22B2B]">
              <path d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
           </svg>
        </div>
      </div>
    </div>
  );
}
