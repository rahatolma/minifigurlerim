'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Custom Event tetikleyicisi
export const triggerLegalModal = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-legal-modal'));
    }
};

export default function LegalNoticeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('LegalNotice');

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            document.body.style.overflow = 'hidden'; // Arka plan kaydırmayı kilitle
        };
        window.addEventListener('open-legal-modal', handleOpen);
        
        return () => {
            window.removeEventListener('open-legal-modal', handleOpen);
        };
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        document.body.style.overflow = 'auto'; // Kilidi kaldır
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-300">
            {/* Modal Kapsayıcı - Genişletildi max-w-5xl */}
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[24px] shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Kapat Butonu */}
                <button 
                    onClick={handleClose}
                    className="absolute top-6 right-6 z-20 w-10 h-10 bg-white hover:bg-gray-100 text-black rounded-full flex items-center justify-center shadow transition-transform hover:scale-105"
                >
                    <X size={20} className="stroke-[3]" />
                </button>

                {/* Başlık ve İkon */}
                <div className="bg-[#D22B2B] px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-center sm:items-start gap-8 relative overflow-hidden shrink-0">

                    <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-black text-white tracking-widest uppercase z-10 text-center sm:text-left leading-[1.2] mt-2 whitespace-pre-line">
                        {t('Title').replace(', ', ',\n')}
                    </h2>
                    {/* Arka plan deseni - noktalı pattern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 3px, transparent 3px)', backgroundSize: '24px 24px' }}></div>
                    {/* Kırmızı vurgu/gölge efekti arka plan için */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#E33B3B] opacity-50 blur-3xl rounded-full z-0 transform scale-150 pointer-events-none"></div>
                </div>

                {/* İçerik Gövdesi - Düz Paragraflar halinde */}
                <div className="p-8 sm:p-12 overflow-y-auto w-full text-[#999999] text-sm sm:text-base lg:text-lg font-medium space-y-6 flex-1 tracking-wide leading-relaxed">
                    <p>{t('P1')}</p>
                    <p>{t('P2')}</p>
                    <p>{t('P3')}</p>
                    <p>{t('P4')}</p>
                    <p>{t('P5')}</p>
                </div>

                {/* Alt Bar / Onay */}
                <div className="bg-[#FAFAFA] border-t border-gray-100 p-6 sm:p-8 flex justify-end shrink-0 rounded-b-[24px]">
                    <button 
                        onClick={handleClose}
                        className="bg-black text-white font-bold py-4 px-10 rounded-lg hover:bg-gray-800 shadow-lg tracking-wide transition-all hover:-translate-y-1 uppercase"
                    >
                        {t('Understood')}
                    </button>
                </div>
            </div>
        </div>
    );
}
