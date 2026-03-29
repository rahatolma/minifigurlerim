'use client';
import ReactQuill, { Quill } from 'react-quill-new';

// Boyutları class (ql-size-huge) yerine direk style (font-size: 24px) olarak yazdırması için ayarlıyoruz.
// Bu sayede her yere CSS yazmak zorunda kalmayacağız ve anında etki edecek.
const Size = Quill.import('attributors/style/size') as any;
Size.whitelist = ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px', '36px', '48px'];
Quill.register(Size, true);

export default function QuillWrapper(props: any) {
  return <ReactQuill {...props} />;
}
