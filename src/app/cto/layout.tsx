
import { Toaster } from 'react-hot-toast';
import { Sen } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../globals.css';

const sen = Sen({
  variable: '--font-sen',
  subsets: ['latin'],
});

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${sen.variable} h-full antialiased`}>
      <body className={`${sen.className} min-h-full flex flex-col`}>
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
        <SpeedInsights />
      </body>
    </html>
  );
}
