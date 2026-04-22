import { supabase } from '@/utils/supabase/client';

export const getUserCollectionStatus = async (userId: string) => {
  const { data } = await supabase
    .from('user_collections')
    .select('status, minifigure_id, created_at, minifigures(name, series_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
};

export const getUserSeriesProgress = async (userId: string) => {
  const { data } = await supabase
    .from('user_series_stats')
    .select('series_id, completion_percent, owned_count, total_count')
    .eq('user_id', userId);
  return data || [];
};

export const getApprovedCommentsClient = async (entityType: string, entityId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('id, user_name, content, created_at')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

export const submitCommentClient = async (entityType: string, entityId: string, userName: string, content: string) => {
  const { error } = await supabase.from('comments').insert([{
    entity_type: entityType,
    entity_id: entityId,
    user_name: userName,
    content: content,
    status: 'approved'
  }]);
  if (error) throw error;
  return { success: true };
};

export const subscribeNewsletterClient = async (email: string) => {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email }]);
  if (error) throw error;
  return { success: true };
};

export const submitContactFormClient = async (data: { first_name: string, last_name: string, email: string, subject: string, message: string }) => {
  const { error } = await supabase
    .from('contact_messages')
    .insert([data]);
  if (error) throw error;
  return { success: true };
};

export const uploadImageClient = async (bucket: string, path: string, file: File) => {
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file);
    
  if (uploadError) throw uploadError;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl };
};
