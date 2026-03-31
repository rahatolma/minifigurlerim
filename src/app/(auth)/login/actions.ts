'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/login?error=Giriş yapılamadı. E-posta ve şifrenizi kontrol edin.');
  }

  revalidatePath('/', 'layout');
  redirect('/koleksiyonum');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return redirect('/login?error=Kayıt sırasında bir hata oluştu: ' + error.message);
  }

  // Supabase'den mail onayı gerekiyorsa:
  return redirect('/login?message=Kayıt başarılı! Lütfen hesabınıza giriş yapın.');
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

// Yeni Google OAuth Bağlantısı
export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004';
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return redirect('/login?error=Google ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.');
  }

  // Supabase yetkilendirme linkini (data.url) döndürür
  if (data.url) {
     redirect(data.url);
  }
}
