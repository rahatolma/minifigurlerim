import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1 w-full bg-[#fcfcfc]">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
