'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

interface ClientViewTrackerProps {
  table: string;
  id: string; // uuid
}

export default function ClientViewTracker({ table, id }: ClientViewTrackerProps) {
  useEffect(() => {
    // Component mount olduğunda (sayfa açıldığında) görüntülenmeyi 1 artır.
    const incrementView = async () => {
      // Önce mevcut değeri al
      const { data, error } = await supabase.from(table).select('total_views, daily_views').eq('id', id).single();
      if (!error && data) {
        // Sonra güncelle (RPC de kullanılabilir ama şimdilik doğrudan update)
        await supabase.from(table).update({
          total_views: (data.total_views || 0) + 1,
          daily_views: (data.daily_views || 0) + 1
        }).eq('id', id);
      }
    };
    
    // Her sayfaya giriş çıkışta mükerrer saymayı önlemek için SessionStorage kontrolü
    const viewedKey = `viewed_${table}_${id}`;
    if (!sessionStorage.getItem(viewedKey)) {
      incrementView();
      sessionStorage.setItem(viewedKey, 'true');
    }
  }, [table, id]);

  return null; // Arayüzü yok, sadece görünmez sayaç tetikleyici
}
