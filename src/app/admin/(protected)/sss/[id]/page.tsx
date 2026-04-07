import FaqForm from '@/components/admin/FaqForm';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  const { data: faq } = await supabase
    .from('faqs')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!faq) {
    return <div className="p-12 text-center text-red-500 font-bold tracking-widest uppercase">SORU BULUNAMADI!</div>;
  }

  return <FaqForm initialData={faq} isEdit={true} />;
}
