'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AntiCopyShield() {
  const pathname = usePathname();

  useEffect(() => {
    // Admin panelindeysek bu kısıtlamaları uygulama (kopyalama/yapıştırma lazım)
    if (pathname?.startsWith('/admin')) {
      document.body.style.userSelect = 'auto';
      document.body.style.webkitUserSelect = 'auto';
      return;
    }

    // Seçimi engelleme CSS'i
    const styleId = 'anti-copy-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        body {
          -webkit-user-select: none; /* Safari */
          -ms-user-select: none; /* IE 10 and IE 11 */
          user-select: none; /* Standard syntax */
        }
        img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
        }
        /* Ancak input ve textarealarda yazı seçilebilsin */
        input, textarea {
          -webkit-user-select: auto !important;
          user-select: auto !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Sağ tıklama engelleme
    const handleContextMenu = (e: MouseEvent) => {
      // Input veya form elemanına sağ tıklanıyorsa izin ver (yapıştırmak için vb.)
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      e.preventDefault();
    };

    // Kısayol Tuşları Engelleme (CTRL+C, CTRL+S, F12 vb.)
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      // F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
      }
      
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U vb
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
      }

      // Mac için Cmd+Opt+I (Mac tuş komb.)
      if (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
         e.preventDefault();
      }

      // Ctrl+U (Kaynağı görüntüle)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
      }

      // Ctrl+S (Sayfayı kaydet)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
      }
      
      // Ctrl+C (Kopyala)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
         // Secili yazi varsa engelle (zaten secilmiyor css ile ama garantileyelim)
         e.preventDefault();
      }
    };

    // Sürükle bırak (yazı vb sürükleme) engelleme
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      const styleNode = document.getElementById(styleId);
      if (styleNode) styleNode.remove();
    };
  }, [pathname]);

  return null; // Arayüzü yok, sadece görünmez koruma katmanı
}
