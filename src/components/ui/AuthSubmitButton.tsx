'use client';
import { useFormStatus } from 'react-dom';
import { trackAuthStarted } from '@/lib/analytics';
import { usePathname } from 'next/navigation';

export default function AuthSubmitButton({ 
  isRegister, 
  locale, 
  label,
  authProvider,
  className,
  children
}: { 
  isRegister: boolean, 
  locale: string, 
  label?: string,
  authProvider?: string,
  className?: string,
  children?: React.ReactNode
}) {
   const { pending } = useFormStatus();
   const pathname = usePathname();
   return (
       <button 
           type="submit" 
           disabled={pending}
           onClick={() => {
              trackAuthStarted({
                 locale,
                 route: pathname,
                 auth_type: isRegister ? 'signup' : 'login',
                 auth_provider: authProvider,
                 source_section: 'auth_page'
              });
           }}
           className={className || "w-full bg-[#1A2035] text-white font-black hover:bg-[#111526] transition-colors py-4 px-6 rounded-xl shadow-[0_10px_30px_rgba(26,32,53,0.15)] hover:shadow-[0_15px_40px_rgba(26,32,53,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none flex items-center justify-center gap-2 group tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"}
       >
           {pending ? '...' : (children || label)}
       </button>
   );
}
