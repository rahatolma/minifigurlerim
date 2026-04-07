import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables dynamically to get OPENAI_API_KEY
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const openaiApiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error("❌ Hata: OPENAI_API_KEY bulunamadı. Lütfen .env.local dosyasını kontrol edin.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: openaiApiKey });

// Paths
const TR_FILE = path.join(__dirname, '../messages/tr.json');
const EN_FILE = path.join(__dirname, '../messages/en.json');

function flattenObject(ob: any): any {
  let toReturn: any = {};
  for (let i in ob) {
    if (!ob.hasOwnProperty(i)) continue;
    if ((typeof ob[i]) == 'object' && ob[i] !== null) {
      let flatObject = flattenObject(ob[i]);
      for (let x in flatObject) {
         if (!flatObject.hasOwnProperty(x)) continue;
         toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

function unflattenObject(ob: any): any {
  let result: any = {};
  for (const i in ob) {
      const keys = i.split('.');
      keys.reduce((acc: any, key: string, index: number) => {
          if (index === keys.length - 1) {
              acc[key] = ob[i];
          } else {
              acc[key] = acc[key] || {};
          }
          return acc[key];
      }, result);
  }
  return result;
}

async function run() {
  console.log("🔍 Sözlük Analizi Başlatılıyor...");
  
  const trData = JSON.parse(fs.readFileSync(TR_FILE, 'utf8'));
  let enData: any = {};
  
  if (fs.existsSync(EN_FILE)) {
      enData = JSON.parse(fs.readFileSync(EN_FILE, 'utf8'));
  }

  const flatTr = flattenObject(trData);
  const flatEn = flattenObject(enData);

  const missingKeys: Record<string, string> = {};
  for (const key in flatTr) {
      if (!flatEn.hasOwnProperty(key) || flatEn[key] === "") {
          missingKeys[key] = flatTr[key];
      }
  }

  const keysToTranslate = Object.keys(missingKeys);
  if (keysToTranslate.length === 0) {
      console.log("✅ Tüm metinler zaten çevrilmiş durumda! Eksik bulunamadı.");
      return;
  }

  console.log(`⏳ ${keysToTranslate.length} adet yeni/çevrilmemiş alt yapı metni bulundu. (OpenAI yapay zekasına bağlanılıyor...)`);

  // Max batch size is usually bounded by token limits, but for JSON dictionaries 50-100 keys is safe.
  // We will do it in one pass if it's less than 50.
  const textsToTranslate = Object.values(missingKeys);

  try {
      const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'Sen birinci sınıf, uzman bir çevirmensin. Verilecek olan bu arayüz/site metinlerini, HTML/yapısal formatı hiç bozmadan, e-ticaret ve koleksiyoner(LEGO) jargonuyla uyumlu premium bir İngilizceye çevir. Dizi içindeki her bir stringi, araya "---SEP---" işareti koyarak yanıtla. Sadece çevirileri dön, ekstra hiçbir bilgi yazma.' 
            },
            {
              role: 'user',
              content: `Aşağıdaki ${textsToTranslate.length} adet metni çevir:\n\n${textsToTranslate.join('\n\n---SEP---\n\n')}`
            }
          ]
      });

      const rawResponse = completion.choices[0]?.message?.content || '';
      const translatedTexts = rawResponse.split('---SEP---').map(t => t.trim().replace(/^"|"$/g, ''));

      if (translatedTexts.length !== textsToTranslate.length) {
          console.error(`❌ Hata: OpenAI ${textsToTranslate.length} kelime gönderildi fakat ${translatedTexts.length} kelime döndürdü. Lütfen tekrar deneyin.`);
          return;
      }

      keysToTranslate.forEach((key, index) => {
          flatEn[key] = translatedTexts[index];
      });

      const finalEnData = unflattenObject(flatEn);
      
      fs.writeFileSync(EN_FILE, JSON.stringify(finalEnData, null, 2), 'utf8');
      
      console.log(`🎉 Şov Bitti! ${keysToTranslate.length} metin anında İngilizceye çevrilip "messages/en.json" dosyasına başarıyla kaydedildi.`);
      
  } catch (error: any) {
      console.error("❌ Çeviri Hatası:", error.message);
  }
}

run();
