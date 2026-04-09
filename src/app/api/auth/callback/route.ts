import { NextResponse } from 'next/server';
import { exchangeCodeForSessionDal } from '@/services/action_dal';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/koleksiyonum'; // Başarılı girişte panoya yolla

  if (code) {
    const { error } = await exchangeCodeForSessionDal(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Oturum açılamadı. Google hesabınızı kontrol edin.`);
}
