import type { Metadata } from "next";
import { Sen } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import AntiCopyShield from "@/components/utils/AntiCopyShield";
import "./globals.css";

const sen = Sen({
  variable: "--font-sen",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minifigürlerim",
  description: "Türkiye'nin En Büyük LEGO Minifigür Koleksiyonerleri Platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${sen.variable} h-full antialiased`}
    >
      <body className={`${sen.className} min-h-full flex flex-col`}>
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
      </body>
    </html>
  );
}
