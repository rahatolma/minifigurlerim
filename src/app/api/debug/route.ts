import { NextResponse } from 'next/server';
import { getAboutSettings } from '@/services/dal';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const settings = await getAboutSettings();
  return NextResponse.json({ settings });
}
