import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
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
      </body>
    </html>
  );
}
