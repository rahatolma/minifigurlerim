import { createClient } from '@/utils/supabase/server';

export const signInWithPasswordDal = async (email: string, password: string) => {
  const supabase = await createClient();
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUpDal = async (email: string, password: string, termsAccepted: boolean, emailRedirectTo?: string) => {
  const supabase = await createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        terms_accepted: termsAccepted,
        terms_accepted_at: termsAccepted ? new Date().toISOString() : null,
      }
    }
  });
};

export const signOutDal = async () => {
  const supabase = await createClient();
  return supabase.auth.signOut();
};

export const signInWithOAuthDal = async (provider: any, redirectTo: string) => {
  const supabase = await createClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
};

export const resetPasswordForEmailDal = async (email: string, redirectTo: string) => {
  const supabase = await createClient();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
};

export const updateUserPasswordDal = async (password: string) => {
  const supabase = await createClient();
  return supabase.auth.updateUser({ password });
};
