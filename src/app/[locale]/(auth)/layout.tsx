import Header from '@/components/layout/Header';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header isAuthMode={true} />
      <main className="w-full min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-75px)]">
        {children}
      </main>
    </>
  );
}
