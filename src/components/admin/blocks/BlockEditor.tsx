'use client';

import React, { useState } from 'react';
import { 
  AnyContentBlock, 
  ContentBlockType,
  TextImageBlock,
  FullTextBlock,
  ImageBannerBlock,
  QuoteBlock,
  CTABlock
} from '@/types/content-blocks';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { supabase } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { Loader2, ImagePlus, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';

interface Props {
  blocks: AnyContentBlock[];
  onChange: (blocks: AnyContentBlock[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export default function BlockEditor({ blocks, onChange }: Props) {
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  // --- Helpers ---
  const updateBlockData = (id: string, partialData: any) => {
    onChange(blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...partialData } } as AnyContentBlock : b));
  };

  const removeBlock = (id: string) => {
    // Also might want to delete image from storage if applicable, but skipping for simplicity
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    
    // Update order values
    newBlocks.forEach((b, i) => b.order = i);
    
    onChange(newBlocks);
  };

  const addBlock = (type: ContentBlockType) => {
    const newBlockBase = {
      id: generateId(),
      type,
      order: blocks.length
    };

    let newBlock: AnyContentBlock;
    if (type === 'TEXT_IMAGE') {
      newBlock = { ...newBlockBase, type, data: { title: '', content: '', imageUrl: '', imageAlign: 'left' } } as TextImageBlock;
    } else if (type === 'FULL_TEXT') {
      newBlock = { ...newBlockBase, type, data: { title: '', content: '' } } as FullTextBlock;
    } else if (type === 'IMAGE_BANNER') {
      newBlock = { ...newBlockBase, type, data: { imageUrl: '', caption: '' } } as ImageBannerBlock;
    } else if (type === 'QUOTE') {
      newBlock = { ...newBlockBase, type, data: { title: 'Koleksiyoner Yorumu', content: '' } } as QuoteBlock;
    } else {
      newBlock = { ...newBlockBase, type: 'CTA', data: { title: '', description: '', buttonText: '', buttonAction: '' } } as CTABlock;
    }

    onChange([...blocks, newBlock]);
  };

  const handleImageUpload = async (file: File, blockId: string, dataKey: string) => {
    try {
      setUploadingBlockId(blockId);
      const fileExt = file.name.split('.').pop();
      const fileName = `${generateId()}.${fileExt}`;
      const filePath = `series/blocks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('minifigure-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('minifigure-images').getPublicUrl(filePath);
      
      updateBlockData(blockId, { [dataKey]: publicUrl });
      toast.success('Görsel başarıyla yüklendi.');
    } catch (error: any) {
      toast.error('Resim Yükleme Hatası: ' + error.message);
    } finally {
      setUploadingBlockId(null);
    }
  };

  // --- Renders for each type ---
  const renderImageUploader = (block: AnyContentBlock, imageKey: string, currentValue: string) => (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center min-h-[160px] relative">
      {uploadingBlockId === block.id ? (
        <div className="flex flex-col items-center gap-2 text-gray-400">
           <Loader2 className="animate-spin w-6 h-6" />
           <span className="text-[10px] font-bold uppercase">Yükleniyor...</span>
        </div>
      ) : currentValue ? (
        <div className="relative group w-full h-full flex justify-center">
            <img src={currentValue} className="max-h-[160px] object-contain rounded-md" alt="Preview" />
            <button 
              type="button" 
              onClick={() => updateBlockData(block.id, { [imageKey]: '' })}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
        </div>
      ) : (
        <label className="flex flex-col items-center cursor-pointer text-gray-400 hover:text-black transition-colors w-full h-full justify-center">
          <ImagePlus className="w-8 h-8 mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Görsel Seç</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageUpload(e.target.files[0], block.id, imageKey);
              }
            }} 
          />
        </label>
      )}
    </div>
  );

  const renderBlockEditor = (block: AnyContentBlock) => {
    switch (block.type) {
      case 'TEXT_IMAGE':
        return (
          <div className="space-y-4">
             <div className="flex gap-4">
               <div className="flex-1 space-y-3">
                 <input 
                   type="text" 
                   value={block.data.title || ''} 
                   onChange={(e) => updateBlockData(block.id, { title: e.target.value })} 
                   placeholder="Blok Başlığı"
                   className="w-full bg-white border border-gray-200 px-3 py-2 rounded-md font-bold text-sm"
                 />
                 <select 
                   value={block.data.imageAlign} 
                   onChange={(e) => updateBlockData(block.id, { imageAlign: e.target.value })}
                   className="w-full bg-white border border-gray-200 px-3 py-2 rounded-md font-medium text-sm"
                 >
                   <option value="left">Görsel Solda</option>
                   <option value="right">Görsel Sağda</option>
                 </select>
               </div>
               <div className="w-[200px] shrink-0">
                 {renderImageUploader(block, 'imageUrl', block.data.imageUrl)}
               </div>
             </div>
             <div>
               <RichTextEditor 
                 value={block.data.content} 
                 onChange={(val) => updateBlockData(block.id, { content: val })} 
                 placeholder="İçerik metnini buraya yazın..."
               />
             </div>
          </div>
        );
      case 'FULL_TEXT':
        return (
          <div className="space-y-4">
            <input 
               type="text" 
               value={block.data.title || ''} 
               onChange={(e) => updateBlockData(block.id, { title: e.target.value })} 
               placeholder="Bölüm Başlığı"
               className="w-full bg-white border border-gray-200 px-3 py-2 rounded-md font-bold text-sm text-center"
             />
             <RichTextEditor 
               value={block.data.content} 
               onChange={(val) => updateBlockData(block.id, { content: val })} 
               placeholder="Geniş içerik metnini buraya yazın..."
             />
          </div>
        );
      case 'IMAGE_BANNER':
        return (
          <div className="space-y-4">
             {renderImageUploader(block, 'imageUrl', block.data.imageUrl)}
             <input 
               type="text" 
               value={block.data.caption || ''} 
               onChange={(e) => updateBlockData(block.id, { caption: e.target.value })} 
               placeholder="Görsel altı küçük not (Opsiyonel)"
               className="w-full bg-white border border-gray-200 px-3 py-2 rounded-md font-medium text-sm text-center"
             />
          </div>
        );
      case 'QUOTE':
        return (
          <div className="space-y-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
             <input 
               type="text" 
               value={block.data.title || ''} 
               onChange={(e) => updateBlockData(block.id, { title: e.target.value })} 
               placeholder="Üst Etiket (Örn: Koleksiyoner Yorumu)"
               className="w-full bg-transparent border-b border-gray-200 px-2 py-2 font-bold text-sm text-center outline-none"
             />
             <RichTextEditor 
               value={block.data.content} 
               onChange={(val) => updateBlockData(block.id, { content: val })} 
               placeholder="Vurucu yorum veya alıntıyı buraya yazın..."
             />
          </div>
        );
      case 'CTA':
        return (
          <div className="space-y-4 bg-gray-900 border border-gray-800 p-6 rounded-xl text-white">
             <input 
               type="text" 
               value={block.data.title || ''} 
               onChange={(e) => updateBlockData(block.id, { title: e.target.value })} 
               placeholder="CTA Başlığı"
               className="w-full bg-gray-800/50 border border-gray-700 px-3 py-2 rounded-md font-black text-xl text-center text-white"
             />
             <input 
               type="text" 
               value={block.data.description || ''} 
               onChange={(e) => updateBlockData(block.id, { description: e.target.value })} 
               placeholder="Açıklama veya Yönlendirme Metni"
               className="w-full bg-gray-800/50 border border-gray-700 px-3 py-2 rounded-md font-medium text-sm text-center text-gray-300"
             />
             <div className="flex gap-4">
                 <input 
                   type="text" 
                   value={block.data.buttonText || ''} 
                   onChange={(e) => updateBlockData(block.id, { buttonText: e.target.value })} 
                   placeholder="Buton Yazısı"
                   className="w-1/2 bg-gray-800/50 border border-gray-700 px-3 py-2 rounded-md font-bold text-sm text-white"
                 />
                 <input 
                   type="text" 
                   value={block.data.buttonAction || ''} 
                   onChange={(e) => updateBlockData(block.id, { buttonAction: e.target.value })} 
                   placeholder="Yönlendirilecek Link (/koleksiyonum)"
                   className="w-1/2 bg-gray-800/50 border border-gray-700 px-3 py-2 rounded-md font-bold text-sm text-white"
                 />
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Blocks List */}
      <div className="space-y-6">
        {blocks.map((block, index) => (
          <div key={block.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             
             {/* Header */}
             <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2">
                <div className="flex items-center gap-3">
                   <div className="flex flex-col gap-0.5">
                      <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-black disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                      <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="text-gray-400 hover:text-black disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase text-gray-900 tracking-widest">{block.type.replace('_', ' ')} BLOK</span>
                   </div>
                </div>
                <button type="button" onClick={() => removeBlock(block.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
             </div>

             {/* Editor Area */}
             <div className="p-6">
               {renderBlockEditor(block)}
             </div>

          </div>
        ))}

        {blocks.length === 0 && (
          <div className="text-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
             <p className="text-sm font-bold text-gray-400">Henüz hiçbir içerik bloğu eklenmedi.</p>
          </div>
        )}
      </div>

      {/* Add Block ActionBar */}
      <div className="flex items-center gap-2 border-t border-gray-200 pt-6">
         <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 mr-2">yeni Blok Ekle:</span>
         <button type="button" onClick={() => addBlock('TEXT_IMAGE')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-[11px] font-bold"><Plus className="w-3 h-3"/> Text + GÖrsel</button>
         <button type="button" onClick={() => addBlock('FULL_TEXT')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-[11px] font-bold"><Plus className="w-3 h-3"/> Genİş Metİn</button>
         <button type="button" onClick={() => addBlock('IMAGE_BANNER')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-[11px] font-bold"><Plus className="w-3 h-3"/> Görsel Banner</button>
         <button type="button" onClick={() => addBlock('QUOTE')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-[11px] font-bold"><Plus className="w-3 h-3"/> Alıntı / Yorum</button>
         <button type="button" onClick={() => addBlock('CTA')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-black text-[11px] font-bold ml-auto"><Plus className="w-3 h-3"/> CTA Ekle</button>
      </div>

    </div>
  );
}
