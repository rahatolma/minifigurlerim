import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import ScrollToTop from "@/components/ui/ScrollToTop";
import AntiDevTools from "@/components/ui/AntiDevTools";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <AntiDevTools />
      <Header />
      <main className="flex-1 w-full bg-[#fcfcfc] pb-[70px] md:pb-0">
        {children}
      </main>
      <MobileTabBar />
      <Footer />
      <ScrollToTop />
    </>
  );
}
