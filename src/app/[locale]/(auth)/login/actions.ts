'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from '@/i18n/routing';
import { redirect as nextRedirect } from 'next/navigation';
import { headers } from 'next/headers';
import { signInWithPasswordDal, signUpDal, signOutDal, signInWithOAuthDal, resetPasswordForEmailDal, updateUserPasswordDal } from '@/services/auth_dal';
import { checkMultiRateLimit } from '@/lib/rate-limit';
import { getURL } from '@/utils/helpers';

export async function login(locale: string, formData: FormData) {
  const rl = await checkMultiRateLimit('login', [
    { limit: 20, window: '1 m' },
    { limit: 100, window: '10 m' }
  ]);
  if (!rl.success) {
    return redirect({ href: '/login?error=rate_limited' as any, locale });
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await signInWithPasswordDal(email, password);

  if (error) {
    if (error.message?.includes('Email not confirmed')) {
      return redirect({ href: '/login?error=unconfirmed_email' as any, locale });
    }
    return redirect({ href: '/login?error=invalid_credentials' as any, locale });
  }

  revalidatePath('/', 'layout');
  redirect({ href: '/koleksiyonum', locale });
}

export async function signup(locale: string, formData: FormData) {
  const rl = await checkMultiRateLimit('register', [
    { limit: 10, window: '10 m' },
    { limit: 25, window: '1 h' }
  ]);
  if (!rl.success) {
    return redirect({ href: '/login?error=rate_limited&type=register' as any, locale });
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const terms = formData.get('terms');

  if (!terms) {
    return redirect({ href: '/login?error=terms_required&type=register' as any, locale });
  }

  const origin = getURL();
  const { data, error } = await signUpDal(email, password, true, `${origin}/api/auth/callback`);

  if (data?.user && data.user.identities && data.user.identities.length === 0) {
    return redirect({ href: '/login?error=account_exists&type=register' as any, locale });
  }

  if (error) {
    console.error(`[Auth Diagnostics] Signup Failed | Code: ${error.code} | Status: ${error.status} | Message: ${error.message}`);
    
    if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
      return redirect({ href: '/login?error=signup_rate_limited&type=register' as any, locale });
    }
    
    return redirect({ href: '/login?error=registration_failed&type=register' as any, locale });
  }

  return redirect({ href: '/login?message=registration_success_verify' as any, locale });
}

export async function logOut(locale: string = 'tr') {
  await signOutDal();
  revalidatePath('/', 'layout');
  redirect({ href: '/', locale });
}

export async function forgotPassword(locale: string, formData: FormData) {
  const rl = await checkMultiRateLimit('forgot_password', [
    { limit: 5, window: '10 m' }
  ]);
  if (!rl.success) {
    return redirect({ href: '/login?error=rate_limited&type=forgot' as any, locale });
  }

  const email = formData.get('email') as string;
  const origin = getURL();
  
  // Redirect to callback which sets session and forwards to completion screen
  const { error } = await resetPasswordForEmailDal(email, `${origin}/api/auth/callback?next=/sifre-sifirlama`);

  if (error) {
    console.error(`[Auth Diagnostics] Forgot Password Failed | Code: ${error.code} | Status: ${error.status} | Message: ${error.message}`);
    return redirect({ href: '/login?error=reset_failed&type=forgot' as any, locale });
  }

  return redirect({ href: '/login?message=reset_link_sent&type=forgot' as any, locale });
}

export async function updatePassword(locale: string, formData: FormData) {
  const rl = await checkMultiRateLimit('update_password', [
    { limit: 5, window: '10 m' }
  ]);
  if (!rl.success) {
    return redirect({ href: '/sifre-sifirlama?error=rate_limited' as any, locale });
  }

  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;

  if (password !== passwordConfirm) {
    return redirect({ href: '/sifre-sifirlama?error=passwords_mismatch' as any, locale });
  }

  if (password.length < 6) {
    return redirect({ href: '/sifre-sifirlama?error=password_too_short' as any, locale });
  }

  const { error } = await updateUserPasswordDal(password);

  if (error) {
    return redirect({ href: '/sifre-sifirlama?error=update_failed' as any, locale });
  }

  return redirect({ href: '/koleksiyonum?message=password_updated' as any, locale });
}

// Yeni Google OAuth Bağlantısı
export async function signInWithGoogle() {
  const origin = getURL();
  const { data, error } = await signInWithOAuthDal('google', `${origin}/api/auth/callback`);

  if (error) {
    return redirect({ href: '/login?error=oauth_failed' as any, locale: 'tr' });
  }

  if (data?.url) {
     nextRedirect(data.url);
  }
}

