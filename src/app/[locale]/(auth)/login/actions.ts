'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signInWithPasswordDal, signUpDal, signOutDal, signInWithOAuthDal } from '@/services/action_dal';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await signInWithPasswordDal(email, password);

  if (error) {
    return redirect('/login?error=Giriş yapılamadı. E-posta ve şifrenizi kontrol edin.');
  }

  revalidatePath('/', 'layout');
  redirect('/koleksiyonum');
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const terms = formData.get('terms');

  if (!terms) {
    return redirect('/login?error=Kullanım koşullarını ve gizlilik politikasını kabul etmeniz gerekmektedir.&type=register');
  }

  const { error } = await signUpDal(email, password, true);

  if (error) {
    return redirect('/login?error=Kayıt sırasında bir hata oluştu: ' + error.message + '&type=register');
  }

  return redirect('/login?message=Kayıt başarılı! Lütfen hesabınıza giriş yapın.');
}

export async function logOut() {
  await signOutDal();
  revalidatePath('/', 'layout');
  redirect('/');
}

// Yeni Google OAuth Bağlantısı
export async function signInWithGoogle() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004';
  const { data, error } = await signInWithOAuthDal('google', `${origin}/api/auth/callback`);

  if (error) {
    return redirect('/login?error=Google ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.');
  }

  if (data?.url) {
     redirect(data.url);
  }
}

