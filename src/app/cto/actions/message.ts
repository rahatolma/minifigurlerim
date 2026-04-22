'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { getAuthUserProfile } from '@/services/action_dal';

export async function getContactMessagesAdmin() {
  const { user, profile } = await getAuthUserProfile();
  if (!user || profile?.role !== 'admin') {
    return { error: 'Yetkisiz erişim.', data: [] };
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return { error: 'Mesajlar alınırken hata oluştu.', data: [] };
  }

  return { success: true, data: data || [] };
}

export async function deleteContactMessageAdmin(id: number | string) {
  const { user, profile } = await getAuthUserProfile();
  if (!user || profile?.role !== 'admin') {
    return { error: 'Yetkisiz erişim.' };
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    return { error: 'Mesaj silinirken hata oluştu.' };
  }

  revalidatePath('/cto/mesajlar');
  return { success: true };
}
