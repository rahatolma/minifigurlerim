'use client';

import { useState } from 'react';
import { updateProfile, updatePassword } from './actions';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PasswordInput from '@/components/ui/PasswordInput';

export default function SettingsForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [profileMsg, setProfileMsg] = useState<{text: string, type: 'success'|'error'} | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{text: string, type: 'success'|'error'} | null>(null);
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
      setPasswordMsg(null);
      const formData = new FormData(e.currentTarget);
      const res = await updatePassword(formData);
      
      if (res?.error) {
          // Actions return translation keys for errors now!
          setPasswordMsg({ text: t(res.error) as string, type: 'error' });
      } else {
          setPasswordMsg({ text: t('SUCCESS_PASSWORD_UPDATED'), type: 'success' });
          (e.target as HTMLFormElement).reset();
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
          
          {passwordMsg && (
              <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {passwordMsg.text}
              </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{t('newPassword')}</label>
                  <PasswordInput 
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
      </section>
    </div>
  );
}
