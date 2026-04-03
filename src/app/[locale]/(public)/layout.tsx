import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import AntiDevTools from "@/components/ui/AntiDevTools";
import { createClient } from "@/utils/supabase/server";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <AntiDevTools />
      <Header user={user} />
      <main className="flex-1 w-full bg-[#fcfcfc]">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
