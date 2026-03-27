'use client';
import { useState } from 'react';

interface FigureGalleryProps {
    images: string[];
    name: string;
}

export default function FigureGallery({ images, name }: FigureGalleryProps) {
    const [mainImage, setMainImage] = useState(images.length > 0 ? images[0] : 'https://via.placeholder.com/600x800.png?text=Görsel+Yok');

    return (
        <div className="lg:col-span-6 flex flex-col items-center justify-start pt-8">
            <img 
                src={mainImage} 
                alt={name} 
                className="w-full max-w-[320px] object-contain mix-blend-multiply transition-all duration-300" 
            />
            
            {images.length > 1 && (
                <div className="flex gap-4 mt-8 overflow-x-auto pb-4 scrollbar-hide justify-center w-full">
                    {images.map((img: string, idx: number) => (
                        <div 
                            key={idx} 
                            onClick={() => setMainImage(img)}
                            className={`w-20 h-20 flex-shrink-0 bg-white border ${mainImage === img ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'} p-2 cursor-pointer hover:border-gray-400 transition-all rounded-sm`}
                        >
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-contain" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
