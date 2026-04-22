'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncSentryAndPostHog = (sessionUser: User | null) => {
      if (sessionUser) {
        Sentry.setUser({ id: sessionUser.id, email: sessionUser.email });
        posthog.identify(sessionUser.id, { email: sessionUser.email });
      } else {
        Sentry.setUser(null);
        posthog.reset();
      }
    };

    // İlk yüklemede state'i ayarla
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      syncSentryAndPostHog(session?.user ?? null);
      setLoading(false);
    });

    // Oturum değişikliklerini dinle (Login, Logout, vs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      syncSentryAndPostHog(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('MİMARİ HATA: useAuth() hook\'u bir AuthProvider sarmalayıcısı dışında çağrılamaz. Bu component yanlış bir ağaçta (boundary) render ediliyor.');
  }
  return context;
};
