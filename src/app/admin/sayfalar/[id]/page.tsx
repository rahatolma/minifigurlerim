import SliderForm from '@/components/admin/SliderForm';
import { supabase } from '@/utils/supabase/client';

export const revalidate = 0;

export default async function EditSliderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { data: slider } = await supabase
    .from('home_sliders')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!slider) {
    return <div className="p-12 text-center text-red-500 font-bold tracking-widest uppercase">SLAYT BULUNAMADI!</div>;
  }

  return <SliderForm initialData={slider} isEdit={true} />;
}
