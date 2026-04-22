import { NextResponse } from 'next/server';
import { getAboutSettings } from '@/services/dal';

export async function GET() {
  const settings = await getAboutSettings();
  return NextResponse.json({
    settings
  });
}
