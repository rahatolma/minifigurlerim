import { Sen } from "next/font/google";
import "../globals.css";

const sen = Sen({
  variable: "--font-sen",
  subsets: ["latin"],
});

export const metadata = {
  title: "Çok Yakında | Minifigürlerim",
  description: "Koleksiyonerler için kapsamlı minifigür platformu hazırlanıyor.",
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${sen.variable} h-full antialiased`}>
      <body className={`${sen.className} min-h-full flex flex-col bg-[#111] m-0 p-0`}>
        {children}
      </body>
    </html>
  );
}
