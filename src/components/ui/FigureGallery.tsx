'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface FigureGalleryProps {
    images: string[];
    name: string;
}

export default function FigureGallery({ images, name }: FigureGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg">
                <span className="text-gray-400 font-black tracking-widest text-sm uppercase">Görsel Yok</span>
            </div>
        );
    }

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

    return (
        <div className="w-full flex flex-col items-center">
            {/* Main Image Stage */}
            <div className="relative w-full h-[500px] flex items-center justify-center group overflow-hidden">
                <Image 
                    src={images[currentIndex]} 
                    alt={`${name} - Görsel ${currentIndex + 1}`} 
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    priority={currentIndex === 0}
                    className="object-contain mix-blend-multiply transition-all duration-300 pointer-events-none" 
                />
                
                {images.length > 1 && (
                    <>
                        {/* Navigation Arrows */}
                        <button 
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-black shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-black shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 mt-6 overflow-x-auto pt-2 pb-4 scrollbar-hide justify-center w-full">
                    {images.map((img: string, idx: number) => (
                        <div 
                            key={idx} 
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-20 h-20 flex-shrink-0 bg-white border-2 overflow-hidden transition-all rounded-xl cursor-pointer
                                ${currentIndex === idx ? 'border-[#D22B2B] shadow-sm transform scale-105' : 'border-gray-100 hover:border-gray-300'}
                            `}
                        >
                            <div className="relative w-full h-full p-2">
                                <Image src={img} alt={`Küçük Önizleme ${idx + 1}`} fill sizes="80px" className="object-contain mix-blend-multiply" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
