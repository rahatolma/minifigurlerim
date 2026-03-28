import Image from 'next/image';
import Link from 'next/link';

interface SeriesCardProps {
  id: string;
  title: string;
  imageUrl: string;
  views: number;
  dailyViews: number;
  minRead: number;
  comments: number;
}

export default function SeriesCard({ title, imageUrl, views, dailyViews, minRead, comments, id }: SeriesCardProps) {
  return (
    <Link href={`/seriler/${id}`} className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
      <div className="relative w-full aspect-square bg-[#fafafa] flex items-center justify-center p-6 border-b border-gray-50 flex-none">
        <Image src={imageUrl} alt={title} fill className="object-contain p-8 mix-blend-multiply hover:scale-110 transition-transform duration-500" />
      </div>
      
      <div className="px-6 py-6 text-center border-t border-gray-100 bg-white flex flex-col flex-1">
        <h3 className="font-bold text-[18px] text-[#D22B2B] mb-2 flex-1 flex items-center justify-center">
          {title}
        </h3>
        {/* Görsel uyum için FigureCard'daki seriesName ile aynı yüksekliği kaplayan görünmez alan */}
        <p className="font-bold text-[13px] text-transparent mb-5 tracking-tight select-none cursor-default" aria-hidden="true">&nbsp;</p>
        
        <div className="w-full h-px bg-gray-100 mb-5"></div>
        
        <div className="flex flex-col items-center gap-1.5 text-[13px] font-bold">
          <span className="text-green-700">{views || 0} Toplam Görüntüleme</span>
          <span className="text-green-700">{dailyViews || 0} Günlük Görüntüleme</span>
          <span className="text-red-500">{minRead > 0 ? `${minRead} Dk Okuma` : '0 Dk Okuma'}</span>
          <span className={comments > 0 ? "text-red-500" : "text-green-700"}>{comments > 0 ? `${comments} Yorum` : '0 Yorum'}</span>
        </div>
      </div>
    </Link>
  );
}
