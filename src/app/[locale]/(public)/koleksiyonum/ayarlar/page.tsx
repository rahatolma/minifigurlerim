import { getAuthUserProfile } from '@/services/action_dal';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import SettingsForm from './SettingsForm';
import AvatarUploader from './AvatarUploader';
import { UserCircle, Settings } from 'lucide-react';

export const metadata = {
  title: 'Hesap Ayarları - Minifigürlerim',
  description: 'Profil bilgilerinizi ve şifrenizi yönetin.',
};

export default async function AyarlarPage() {
  const { user, profile } = await getAuthUserProfile();

  if (!user) {
    redirect('/login');
  }

  if (profile?.status === 'banned') {
    redirect('/banned');
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16">


        <div className="max-w-7xl mx-auto px-8 pt-8 flex flex-col md:flex-row gap-8 lg:gap-12">
            
            {/* SOL MENU BAR */}
            <aside className="w-full md:w-64 lg:w-80 flex-shrink-0">
               <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24">
                   <div className="flex items-center gap-4 mb-8">
                       <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                           {profile?.avatar_url ? (
                               <img src={profile.avatar_url} alt="Kullanıcı Avatarı" className="w-full h-full object-cover" />
                           ) : (
                               <UserCircle className="w-8 h-8 text-gray-400" />
                           )}
                       </div>
                       <div className="min-w-0">
                           <p className="font-black text-gray-900 text-lg truncate">{profile?.full_name || profile?.username || 'Koleksiyoner'}</p>
                           <p className="text-xs text-gray-500 font-bold break-all">{user.email}</p>
                       </div>
                   </div>

                   {/* YENİ NESİL AVATAR YÜKLEME ALANI */}
                   <AvatarUploader />

                   <nav className="space-y-1 mt-8">
                      <Link href="/koleksiyonum/ayarlar" className="flex items-center gap-3 bg-red-50 text-red-600 font-black text-sm px-4 py-3 rounded-xl transition-colors">
                          <Settings className="w-4 h-4" />
                          Hesap ve Güvenlik
                      </Link>
                      {/* Daha sonra eklenebilecek sekmeler buraya gelecek... */}
                   </nav>
               </div>
            </aside>

            {/* SAĞ İÇERİK (FORMLAR) */}
            <main className="flex-1 w-full min-w-0">
               {/* Client form component */}
               <SettingsForm 
                   initialData={profile ? { ...profile, email: user.email } : { email: user.email }} 
                   isOAuthUser={user.app_metadata?.providers?.includes('google')}
               />
            </main>
        </div>
    </div>
  );
}
