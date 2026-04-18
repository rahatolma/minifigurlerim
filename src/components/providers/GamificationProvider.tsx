'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getUserCollectionStatus, getUserSeriesProgress } from '@/services/client_dal';
import { useAuth } from '@/components/providers/AuthProvider';

interface SeriesProgress {
  percent: number;
  collected: number;
  total: number;
}

interface GamificationContextType {
  userStatusMap: Record<string, 'have' | 'want'>;
  userSeriesProgressMap: Record<string, SeriesProgress>;
  userLatestAddedFigureMap: Record<string, string>;
  loading: boolean;
  updateStatus: (minifigureId: string, status: 'have' | 'want' | null) => void;
}

const GamificationContext = createContext<GamificationContextType>({
  userStatusMap: {},
  userSeriesProgressMap: {},
  userLatestAddedFigureMap: {},
  loading: true,
  updateStatus: () => {},
});

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userStatusMap, setUserStatusMap] = useState<Record<string, 'have' | 'want'>>({});
  const [userSeriesProgressMap, setUserSeriesProgressMap] = useState<Record<string, SeriesProgress>>({});
  const [userLatestAddedFigureMap, setUserLatestAddedFigureMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async (userId: string) => {
    setLoading(true);
    
    // 1. Minifigure have/want durumları
    try {
      const collectData = await getUserCollectionStatus(userId);
      const statusMap: Record<string, 'have' | 'want'> = {};
      const latestFigureMap: Record<string, string> = {};
      
      const trueScores: Record<string, number> = {};
      
      if (collectData) {
        collectData.forEach(c => {
          if (c.minifigure_id && c.status) {
            statusMap[c.minifigure_id] = c.status as 'have' | 'want';
          }
          if (c.status === 'have' && c.minifigures && (c.minifigures as any).series_id) {
            const sId = (c.minifigures as any).series_id;
            trueScores[sId] = (trueScores[sId] || 0) + 1;
            
            if (!latestFigureMap[sId]) {
              latestFigureMap[sId] = (c.minifigures as any).name;
            }
          }
        });
      }
      setUserStatusMap(statusMap);
      setUserLatestAddedFigureMap(latestFigureMap);

      // 2. Seri tamamlanma oranları
      const statsData = await getUserSeriesProgress(userId);
      const progressMap: Record<string, SeriesProgress> = {};
      if (statsData) {
        statsData.forEach(stat => {
          const actualCount = trueScores[stat.series_id] || 0;
          if (actualCount > 0) {
            progressMap[stat.series_id] = {
              percent: Number(((actualCount / Math.max(1, stat.total_count)) * 100).toFixed(2)),
              collected: actualCount,
              total: stat.total_count
            };
          }
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
      setUserLatestAddedFigureMap({});
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
    
    // UI'ı anında yansıttıktan sonra genel istatistikleri ve progress barlarını
    // asenkron olarak arka planda 500ms gecikmeli doğrula (Rate Limit ve DB yazma sonrası)
    if (user) {
      setTimeout(() => {
        fetchData(user.id);
      }, 500);
    }
  };

  return (
    <GamificationContext.Provider value={{ userStatusMap, userSeriesProgressMap, userLatestAddedFigureMap, loading, updateStatus }}>
      {children}
    </GamificationContext.Provider>
  );
}

export const useGamification = () => useContext(GamificationContext);
