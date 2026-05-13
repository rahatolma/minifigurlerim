'use client';

import { useState } from 'react';
import { updateProfile, updatePassword } from './actions';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PasswordInput from '@/components/ui/PasswordInput';
import PasswordInputWithPolicy from '@/components/ui/PasswordInputWithPolicy';
import toast from 'react-hot-toast';

export default function SettingsForm({ initialData, isOAuthUser }: { initialData: any, isOAuthUser?: boolean }) {
  const router = useRouter();
  const [profileMsg, setProfileMsg] = useState<{text: string, type: 'success'|'error'} | null>(null);
  const [passwordResetKey, setPasswordResetKey] = useState(0);
  const t = useTranslations('Settings');

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setProfileMsg(null);
      const formData = new FormData(e.currentTarget);
      const res = await updateProfile(formData);
      
      if (res?.error) {
          setProfileMsg({ text: res.error, type: 'error' }); // Assuming profile action errors are already translated or keys
      } else {
          setProfileMsg({ text: t('SUCCESS_PROFILE_UPDATED'), type: 'success' });
          router.refresh();
      }
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const res = await updatePassword(formData);
      
      if (res?.error) {
          // Fallback message if translation key doesn't exist
          const errorMsg = t.has(res.error) ? t(res.error) : 'Şifre güncellenemedi.';
          toast.error(errorMsg, { duration: 4000 });
      } else {
          toast.success(t('SUCCESS_PASSWORD_UPDATED'), { duration: 4000 });
          (e.target as HTMLFormElement).reset();
          setPasswordResetKey(prev => prev + 1); // unmount/remount uncontrolled password inputs
      }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      {/* PROFIL FORMU */}
      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">{t('profileInfo')}</h2>
          
          {profileMsg && (
              <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {profileMsg.text}
              </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{t('emailLabel')}</label>
                  <input 
                      type="email" 
                      name="email"
                      defaultValue={initialData?.email || ''} 
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#D22B2B] focus:border-transparent outline-none transition-all" 
                      required
                  />
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">{t('emailDesc')}</p>
              </div>

              <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{t('nameLabel')}</label>
                  <input 
                      type="text" 
                      name="full_name"
                      defaultValue={initialData?.full_name || ''} 
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#D22B2B] focus:border-transparent outline-none transition-all" 
                      placeholder={t('namePlaceholder')} 
                  />
              </div>

              <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{t('ageLabel')}</label>
                  <input 
                      type="number" 
                      name="age"
                      defaultValue={initialData?.age || ''} 
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#D22B2B] focus:border-transparent outline-none transition-all" 
                      placeholder={t('agePlaceholder')} 
                  />
              </div>

              <div className="pt-4">
                 <button type="submit" className="bg-[#1D2136] text-white font-black py-3 px-8 rounded-xl shadow-md hover:bg-[#131627] transition-all tracking-widest uppercase text-xs">
                     {t('saveProfile')}
                 </button>
              </div>
          </form>
      </section>

      {/* ŞIFRE FORMU */}
      <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">{t('security')}</h2>
          
          {isOAuthUser ? (
             <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100">
                   <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                </div>
                <p className="text-sm font-bold text-gray-700 mt-2">
                   Google hesabın ile giriş yapıyorsun. Şifre yönetimi Google üzerinden yapılır.
                </p>
             </div>
          ) : (
             <form onSubmit={handlePasswordUpdate} className="space-y-5" key={passwordResetKey}>
              <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{t('newPassword')}</label>
                  <PasswordInputWithPolicy 
                      id="new_password"
                      name="new_password"
                      placeholder={t('passwordPlaceholder')} 
                      required={true}
                  />
              </div>

              <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{t('newPasswordConfirm')}</label>
                  <PasswordInput 
                      id="confirm_password"
                      name="confirm_password"
                      placeholder={t('confirmPlaceholder')} 
                      required={true}
                  />
              </div>

              <div className="pt-4">
                 <button type="submit" className="bg-[#D22B2B] text-white font-black py-3 px-8 rounded-xl shadow-md hover:bg-red-700 transition-all tracking-widest uppercase text-xs">
                     {t('changePassword')}
                 </button>
              </div>
          </form>
          )}
      </section>
    </div>
  );
}
