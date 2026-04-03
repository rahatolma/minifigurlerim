'use client';

import { useState } from 'react';
import { uploadAvatar } from './actions';
import { Camera, Loader2 } from 'lucide-react';

export default function AvatarUploader() {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (!e.target.files || e.target.files.length === 0) return;
     const file = e.target.files[0];
     
     setUploading(true);
     const formData = new FormData();
     formData.append('file', file);
     
     const res = await uploadAvatar(formData);
     if (res?.error) {
        alert(res.error);
     }
     
     setUploading(false);
  };

  return (
    <div className="mt-4">
        {/* Gizli dosya seçici */}
        <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg, image/webp" 
            className="hidden" 
            id="avatar-upload" 
            onChange={handleFileChange} 
            disabled={uploading}
        />
        
        {/* Özel Buton UI */}
        <label 
           htmlFor="avatar-upload" 
           className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed ${uploading ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-200 hover:border-black hover:bg-black hover:text-white text-gray-600 cursor-pointer'} transition-all text-xs font-black tracking-widest uppercase`}
        >
           {uploading ? (
              <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Yükleniyor...
              </>
           ) : (
              <>
                 <Camera className="w-4 h-4" />
                 Görsel Seç ve Yükle
              </>
           )}
        </label>
        <p className="text-[9px] text-center text-gray-400 mt-2 font-medium">Büyük boyuttaki görseller reddedilir. Max (5MB)</p>
    </div>
  );
}
