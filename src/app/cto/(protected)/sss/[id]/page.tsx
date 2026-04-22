import FaqForm from '@/components/cto/FaqForm';
import { getAdminFaqDal } from '@/services/action_dal';

export const revalidate = 0;

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const faq = await getAdminFaqDal(resolvedParams.id);

  if (!faq) {
    return <div className="p-12 text-center text-red-500 font-bold tracking-widest uppercase">SORU BULUNAMADI!</div>;
  }

  return <FaqForm initialData={faq} isEdit={true} />;
}
