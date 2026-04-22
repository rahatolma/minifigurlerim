import React from 'react';

// Ortak Zengin Metin (Rich Text) Düzenleme Aracı
// Bu bileşen, editörden gelen kopyalanmış stilli metinlerin sitenin dışına taşmasını engeller.
// &nbsp; karakterlerini temizler, boş paragrafları engeller.

interface RichTextContentProps {
    html: string;
    className?: string;
}

export default function RichTextContent({ html, className = '' }: RichTextContentProps) {
    if (!html) return null;

    // Sadece trim yapıp geçelim, bazen regex aktif paragrafın içindeki stilleri boşluk zannedip siliyor
    let cleanHtml = html.trim();

    // 2. Wrap sorununu yaratan &nbsp; (Non-breaking space) karakterlerini normal boşluğa çevir.
    cleanHtml = cleanHtml.replace(/&nbsp;|\u00A0/gi, ' ');

    // 3. İçinde sadece boşluk olan (veya tamamen boş olan) paragrafları <br> lı hale getir ki satır yüksekliği çökmesin.
    cleanHtml = cleanHtml.replace(/<p[^>]*>\s*<\/p>/gi, '<p><br></p>');

    return (
        <div 
           dangerouslySetInnerHTML={{ __html: cleanHtml }} 
           className={`prose max-w-none text-gray-700 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_*]:!whitespace-pre-wrap [&_*]:!break-words [&_*]:!max-w-full overflow-x-hidden [&_p]:min-h-[1.5rem] ${className}`} 
        />
    );
}
