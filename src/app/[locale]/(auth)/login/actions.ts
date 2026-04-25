'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from '@/i18n/routing';
import { redirect as nextRedirect } from 'next/navigation';
import { headers } from 'next/headers';
import { signInWithPasswordDal, signUpDal, signOutDal, signInWithOAuthDal } from '@/services/action_dal';

export async function login(locale: string, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await signInWithPasswordDal(email, password);

  if (error) {
    return redirect({ href: '/login?error=invalid_credentials' as any, locale });
  }

  revalidatePath('/', 'layout');
  redirect({ href: '/koleksiyonum', locale });
}

export async function signup(locale: string, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const terms = formData.get('terms');

  if (!terms) {
    return redirect({ href: '/login?error=terms_required&type=register' as any, locale });
  }

  const { error } = await signUpDal(email, password, true);

  if (error) {
    return redirect({ href: '/login?error=registration_failed&type=register' as any, locale });
  }

  return redirect({ href: '/login?message=registration_success' as any, locale });
}

export async function logOut(locale: string = 'tr') {
  await signOutDal();
  revalidatePath('/', 'layout');
  redirect({ href: '/', locale });
}

// Yeni Google OAuth Bağlantısı
export async function signInWithGoogle() {
  const headersList = await headers();
  const rawOrigin = headersList.get('origin') || headersList.get('host');
  const origin = rawOrigin ? (rawOrigin.startsWith('http') ? rawOrigin : `https://${rawOrigin}`) : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004');
  const { data, error } = await signInWithOAuthDal('google', `${origin}/api/auth/callback`);

  if (error) {
    return redirect({ href: '/login?error=oauth_failed' as any, locale: 'tr' });
  }

  if (data?.url) {
     nextRedirect(data.url);
  }
}

