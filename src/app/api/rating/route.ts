import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minifigureId = searchParams.get('minifigure_id');

    if (!minifigureId) {
      return NextResponse.json({ error: 'Minifigure ID required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ rating: null, total: 0 });
    }

    const { data, error } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('minifigure_id', minifigureId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rating: data?.rating || null, total: 0 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
