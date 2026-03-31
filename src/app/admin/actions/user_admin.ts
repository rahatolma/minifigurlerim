'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleUserApproval(userId: string, currentStatus: boolean) {
  const supabase = await createClient();

  // Güvenlik Önlemi: İstek atan kişi gerçekten Yetkili (Admin) mi?
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Oturum bulunamadı.' };

  const { data: adminCheck } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminCheck?.role !== 'admin') {
    return { error: 'Bu işlemi yapmak için yetkiniz (Admin Rolü) yok!' };
  }

  // İşlemi yap (True / False)
  const { error } = await supabase
    .from('profiles')
    .update({ is_approved: !currentStatus })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/kullanicilar');
  return { success: true };
}

export async function deleteUserFromDB(userId: string) {
   // Gelecek Faz: Sistemden tamamen silmek için Auth Hook'u yazılacak veya profile kaydı düşürülecek.
   // Şimdilik sadece "role" = "banned" yapalım.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: adminCheck } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

  if (adminCheck?.role !== 'admin') return { error: 'Yetkisiz İşlem' };

  const { error } = await supabase.from('profiles').update({ role: 'banned', is_approved: false }).eq('id', userId);
  
  if (error) return { error: error.message };
  
  revalidatePath('/admin/kullanicilar');
  return { success: true };
}

export async function getUserDetailedInfo(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Oturum bulunamadı.' };

  const { data: adminCheck } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminCheck?.role !== 'admin') return { error: 'Yetkisiz erişim.' };

  const { createClient: createAdminClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
  if (authError || !authUser?.user) return { error: 'Kullanıcı kimliği alınamadı.' };

  const { count: collectionCount } = await supabaseAdmin.from('user_collections').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId);
  const { count: ratingCount } = await supabaseAdmin.from('user_ratings').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId);

  return {
    success: true,
    email: authUser.user.email,
    lastSignIn: authUser.user.last_sign_in_at,
    collectionCount: collectionCount || 0,
    ratingCount: ratingCount || 0
  };
}
