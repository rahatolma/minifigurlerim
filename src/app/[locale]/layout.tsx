import type { Metadata } from "next";
import { Sen } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import AntiCopyShield from "@/components/utils/AntiCopyShield";
import "../globals.css";

const sen = Sen({
  variable: "--font-sen",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minifigürlerim",
  description: "Türkiye'nin En Büyük LEGO Minifigür Koleksiyonerleri Platformu",
};

import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${sen.variable} h-full antialiased`}
    >
      <body className={`${sen.className} min-h-full flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <PostHogProvider>
            <AntiCopyShield />
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                style: {
                  background: '#0A0A0A',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em'
                }
              }} 
            />
            {children}
          </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
