'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getUserCollectionStatus, getUserSeriesProgress } from '@/services/client_dal';
import { useAuth } from './AuthProvider';

interface SeriesProgress {
  percent: number;
  collected: number;
  total: number;
}

interface GamificationContextType {
  userStatusMap: Record<string, 'have' | 'want'>;
  userSeriesProgressMap: Record<string, SeriesProgress>;
  loading: boolean;
  updateStatus: (minifigureId: string, status: 'have' | 'want' | null) => void;
}

const GamificationContext = createContext<GamificationContextType>({
  userStatusMap: {},
  userSeriesProgressMap: {},
  loading: true,
  updateStatus: () => {},
});

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userStatusMap, setUserStatusMap] = useState<Record<string, 'have' | 'want'>>({});
  const [userSeriesProgressMap, setUserSeriesProgressMap] = useState<Record<string, SeriesProgress>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async (userId: string) => {
    setLoading(true);
    
    // 1. Minifigure have/want durumları
    try {
      const collectData = await getUserCollectionStatus(userId);
      const statusMap: Record<string, 'have' | 'want'> = {};
      if (collectData) {
        collectData.forEach(c => {
          if (c.minifigure_id && c.status) {
            statusMap[c.minifigure_id] = c.status as 'have' | 'want';
          }
        });
      }
      setUserStatusMap(statusMap);

      // 2. Seri tamamlanma oranları
      const statsData = await getUserSeriesProgress(userId);
      const progressMap: Record<string, SeriesProgress> = {};
      if (statsData) {
      statsData.forEach(stat => {
        progressMap[stat.series_id] = {
          percent: Number(stat.completion_percent),
          collected: stat.owned_count,
          total: stat.total_count
        };
      });
    }
    setUserSeriesProgressMap(progressMap);
    } catch (e) {
      console.error("Failed fetching gamification data", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData(user.id);
    } else {
      setUserStatusMap({});
      setUserSeriesProgressMap({});
      setLoading(false);
    }
  }, [user]);

  // Kartlar tıklandığında anında memory'i güncelleyen fonksiyon
  const updateStatus = (minifigureId: string, status: 'have' | 'want' | null) => {
    setUserStatusMap(prev => {
      const next = { ...prev };
      if (!status) delete next[minifigureId];
      else next[minifigureId] = status;
      return next;
    });
    // Burada Supabase db yazma RPC veya Insert yapılabilir, genelde karta ait component db'ye yazar, 
    // burası sadece UI'ı instant yansıtmak içindir.
  };

  return (
    <GamificationContext.Provider value={{ userStatusMap, userSeriesProgressMap, loading, updateStatus }}>
      {children}
    </GamificationContext.Provider>
  );
}

export const useGamification = () => useContext(GamificationContext);
