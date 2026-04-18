import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import ScrollToTop from "@/components/ui/ScrollToTop";
import AuthCTA from '@/components/ui/AuthCTA';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <Header />
      <main className="flex-1 w-full bg-[#fcfcfc] pb-[70px] md:pb-0">
        {children}
      </main>
      <AuthCTA fullWidth={true} />
      <MobileTabBar />
      <Footer />
      <ScrollToTop />
    </>
  );
}
