'use client';

import React, { useState } from 'react';
import { 
  AnyContentBlock, 
  ContentBlockType,
  TextImageBlock,
  FullTextBlock,
  ImageBannerBlock,
  QuoteBlock,
  CTABlock,
  SeriesShowcaseBlock
} from '@/types/content-blocks';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { uploadImageClient } from '@/services/client_dal';
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
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
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
    } else if (type === 'SERIES_SHOWCASE') {
      newBlock = { 
        ...newBlockBase, 
        type, 
        data: { 
          title: 'Seri 1 - Başlangıcın Efsanesi', 
          subtitle: '16 Karakter • Koleksiyon serilerinin başlangıcı',
          longStory: '', 
          imageTopLeft: '', 
          imageTopRight: '',
          imageBottomLeft: '', 
          imageBottomRight: '',
          box1Title: 'ÖNE ÇIKAN FİGÜRLER', box1Content: '',
          box2Title: 'BİZİM İÇİN BU SERİ', box2Content: '',
          box3Title: 'KISACASI', box3Content: '',
          quoteTitle: 'Koleksiyoner Yorumu', quoteContent: ''
        } 
      } as SeriesShowcaseBlock;
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

      const { publicUrl } = await uploadImageClient('minifigure-images', filePath, file);
      
      
      updateBlockData(blockId, { [dataKey]: publicUrl });
      toast.success('Görsel başarıyla yüklendi.');
    } catch (error: any) {
console.error(error);
      toast.error('Resim Yükleme Hatası: ' + error.message);
    } finally {
      setUploadingBlockId(null);
    }
  };

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
      case 'SERIES_SHOWCASE':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 text-[#D22B2B] p-4 rounded-xl border border-red-100 text-xs font-medium">
              💡 <strong>Seri Vitrini Bloğu:</strong> Bu blok sayfanın en üstünden ortasına kadar giden tüm ana hatları kapsar. (3'lü görsel, koleksiyon şeridi ve alt kutular dahil.)
            </div>
            <div className="space-y-4 border border-gray-200 p-4 rounded-xl bg-gray-50/50">
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Vitrin Başlığı</label>
                 <input 
                   type="text" 
                   value={block.data.title || ''} 
                   onChange={(e) => updateBlockData(block.id, { title: e.target.value })} 
                   placeholder="Örn: Seri 1 - Efsanenin Başlangıcı"
                   className="w-full bg-white border border-gray-200 px-3 py-2 rounded-md font-bold text-lg mb-3"
                 />
                 <label className="block text-xs font-bold text-gray-500 mb-1">Alt Başlık (Subtitle)</label>
                 <input 
                   type="text" 
                   value={block.data.subtitle || ''} 
                   onChange={(e) => updateBlockData(block.id, { subtitle: e.target.value })} 
                   placeholder="Örn: 16 karakter • Koleksiyon serilerinin başlangıcı"
                   className="w-full bg-white border border-gray-200 px-3 py-2 rounded-md font-medium text-sm text-gray-600"
                 />
               </div>
               
               <div className="pt-2 border-t border-gray-200">
                 <label className="block text-xs font-bold text-gray-500 mb-2">Ansiklopedi Metni (Ana Vitrin Yazısı)</label>
                 <RichTextEditor 
                   value={block.data.longStory} 
                   onChange={(val) => updateBlockData(block.id, { longStory: val })} 
                   placeholder="Fotoğrafların yanındaki detaylı ana yazıyı buraya giriniz..."
                 />
               </div>
               
               <div className="pt-4 border-t border-gray-200">
                 <label className="block text-sm font-black text-gray-900 mb-4">📸 4'LÜ GÖRSEL GRID'İ</label>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-gray-500 mb-2">1. Sol Üst Görsel</label>
                     {renderImageUploader(block, 'imageTopLeft', block.data.imageTopLeft || '')}
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-gray-500 mb-2">2. Sağ Üst Görsel</label>
                     {renderImageUploader(block, 'imageTopRight', block.data.imageTopRight || '')}
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-gray-500 mb-2">3. Sol Alt Görsel</label>
                     {renderImageUploader(block, 'imageBottomLeft', block.data.imageBottomLeft || '')}
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-gray-500 mb-2">4. Sağ Alt Görsel</label>
                     {renderImageUploader(block, 'imageBottomRight', block.data.imageBottomRight || '')}
                   </div>
                 </div>
               </div>

               <div className="pt-6 mt-4 border-t border-gray-200">
                 <label className="block text-sm font-black text-gray-900 mb-4">🎯 ALT VURGU KOLONLARI (3'LÜ KUTU)</label>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded bg-white items-start">
                    <div>
                        <input type="text" value={block.data.box1Title || ''} onChange={e => updateBlockData(block.id, { box1Title: e.target.value })} placeholder="1. Kutu Başlığı (Öne Çıkanlar)" className="w-full font-bold border-b pb-2 outline-none mb-2 text-xs" />
                        <textarea rows={12} value={block.data.box1Content || ''} onChange={e => updateBlockData(block.id, { box1Content: e.target.value })} placeholder="Kutu İçeriği..." className="w-full text-xs outline-none resize-vertical text-gray-600 bg-transparent min-h-[150px]" />
                    </div>
                    <div>
                        <input type="text" value={block.data.box2Title || ''} onChange={e => updateBlockData(block.id, { box2Title: e.target.value })} placeholder="2. Kutu Başlığı (Bizim İçin Bu Seri)" className="w-full font-bold border-b pb-2 outline-none mb-2 text-xs" />
                        <textarea rows={12} value={block.data.box2Content || ''} onChange={e => updateBlockData(block.id, { box2Content: e.target.value })} placeholder="Kutu İçeriği..." className="w-full text-xs outline-none resize-vertical text-gray-600 bg-transparent min-h-[150px]" />
                    </div>
                    <div>
                        <input type="text" value={block.data.box3Title || ''} onChange={e => updateBlockData(block.id, { box3Title: e.target.value })} placeholder="3. Kutu Başlığı (Kısacası)" className="w-full font-bold border-b pb-2 outline-none mb-2 text-xs" />
                        <textarea rows={12} value={block.data.box3Content || ''} onChange={e => updateBlockData(block.id, { box3Content: e.target.value })} placeholder="Kutu İçeriği..." className="w-full text-xs outline-none resize-vertical text-gray-600 bg-transparent min-h-[150px]" />
                    </div>
                 </div>
               </div>

               <div className="pt-6 mt-4 border-t border-gray-200">
                 <label className="block text-sm font-black text-gray-900 mb-4">💬 KOLEKSİYONER YORUMU (En Alt Kısım)</label>
                 <div className="bg-white p-4 border border-gray-200 rounded-xl space-y-3">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Yorum Başlığı</label>
                     <input 
                       type="text" 
                       value={block.data.quoteTitle || ''} 
                       onChange={(e) => updateBlockData(block.id, { quoteTitle: e.target.value })} 
                       placeholder="Örn: Koleksiyoner Yorumu Veya Özlü Söz"
                       className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-md font-bold text-sm"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Yorum / Alıntı Metni</label>
                     <RichTextEditor 
                       value={block.data.quoteContent || ''} 
                       onChange={(val) => updateBlockData(block.id, { quoteContent: val })} 
                       placeholder="Bu seriyle ilgili vurucu bir koleksiyoner notu ekleyin..."
                     />
                   </div>
                 </div>
               </div>

            </div>
          </div>
        );
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
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-2">Yatay Görsel</label>
                 {renderImageUploader(block, 'imageUrl', block.data.imageUrl)}
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-2">Dikey Görsel (İsteğe Bağlı Çiftli Görünüm İçin)</label>
                 {renderImageUploader(block, 'imageVerticalUrl', block.data.imageVerticalUrl || '')}
               </div>
             </div>
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
      <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-6">
         <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 mr-2">YENİ BLOK EKLE:</span>
         <button type="button" onClick={() => addBlock('SERIES_SHOWCASE')} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#D22B2B] to-[#b02222] text-white rounded shadow-md hover:shadow-lg text-[11px] font-black tracking-widest uppercase transition-all"><Plus className="w-3 h-3"/> Serİ Vİtrİnİ</button>
         <button type="button" onClick={() => addBlock('TEXT_IMAGE')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-[11px] font-bold"><Plus className="w-3 h-3"/> Text + GÖrsel</button>
         <button type="button" onClick={() => addBlock('FULL_TEXT')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-[11px] font-bold"><Plus className="w-3 h-3"/> Genİş Metİn</button>
         <button type="button" onClick={() => addBlock('IMAGE_BANNER')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-[11px] font-bold"><Plus className="w-3 h-3"/> Görsel Banner</button>
         <button type="button" onClick={() => addBlock('QUOTE')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-[11px] font-bold"><Plus className="w-3 h-3"/> Alıntı / Yorum</button>
         <button type="button" onClick={() => addBlock('CTA')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-black text-[11px] font-bold ml-auto mt-2 sm:mt-0"><Plus className="w-3 h-3"/> CTA Ekle</button>
      </div>

    </div>
  );
}
