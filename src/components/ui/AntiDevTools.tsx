'use client';

import { useEffect } from 'react';

export default function AntiDevTools() {
  useEffect(() => {
    // 1. Sağ Tıklamayı Engelle
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Kritik Klavye Kısayollarını Engelle (F12, Inspect, View Source)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
        (e.metaKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Kod çalmayı zorlaştırmak için Resim ve Link sürükleme engellemesi
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.tagName === 'A') {
        e.preventDefault();
      }
    };

    // Konsol mesajı şov
    console.log(
      "%c 🛑 DİKKAT: KURUMSAL İHLAL UYARISI 🛑", 
      "color: red; font-size: 24px; font-weight: bold; background: black; padding: 10px; border-radius: 5px;"
    );
    console.log(
      "%cBu sitenin lisanslı içerikleri (veri blokları, görseller ve sistem mimarisi) koruma altındadır. Otomatize bot yazılımları, veri madenciliği (scraping) ve manuel inspect (F12) girişimleri loglanmaktadır. Geliştirici konsolunu hemen kapatınız.",
      "color: white; font-size: 14px; background: #D22B2B; padding: 10px; border-radius: 5px;"
    );

    // Kapatmaları aktifleştir
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      // Bileşen silinirse kaldır
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
}
