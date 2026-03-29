'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';

// Client-side only yükleme (Next.js SSR hatalarını önlemek için)
const ReactQuill = dynamic(
  () => {
    return import('./QuillWrapper');
  },
  { 
    ssr: false, 
    loading: () => <div className="p-4 text-center text-xs text-gray-500 font-medium">✨ Editör Yükleniyor...</div> 
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  
  // Sadece en lazım özellikler (Resim yükleme, kalınlaştırma vs)
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }, { 'size': ['12px', '14px', false, '18px', '20px', '22px', '24px', '28px', '32px', '36px', '48px'] }],
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],                        // link and image
      ['clean']                                         // remove formatting button
    ],
  }), []);

  return (
    <div className="bg-white rounded-md border border-gray-200" style={{ minHeight: '300px' }}>
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        className="min-h-[300px]"
      />
      <style jsx global>{`
        /* Editör CSS Düzeltmeleri */
        .ql-container {
          font-size: 14px !important;
          font-family: inherit !important;
        }
        .ql-editor {
          min-height: 250px;
        }
        .ql-toolbar {
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          border-color: #e5e7eb !important;
          background: #f9fafb;
        }
        .ql-container.ql-snow {
          border-color: #e5e7eb !important;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        }
      `}</style>
    </div>
  );
}
