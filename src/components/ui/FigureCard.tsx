import Image from 'next/image';
import Link from 'next/link';

interface FigureCardProps {
  id: string;
  name: string;
  seriesName: string;
  imageUrl: string;
  views: number;
  dailyViews: number;
  minRead: number;
  comments: number;
}

export default function FigureCard({ id, name, seriesName, imageUrl, views, dailyViews, minRead, comments }: FigureCardProps) {
  return (
    <Link href={`/figurler/${id}`} className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
      <div className="relative w-full aspect-square bg-[#fafafa] flex items-center justify-center p-6 border-b border-gray-50 flex-none">
        <Image src={imageUrl} alt={name} fill className="object-contain p-8 mix-blend-multiply hover:scale-110 transition-transform duration-500" />
      </div>
      
      <div className="px-6 py-6 text-center border-t border-gray-100 bg-white flex flex-col flex-1">
        <h3 className="font-bold text-[18px] text-[#D22B2B] mb-2 flex-1">{name}</h3>
        <p className="font-bold text-[13px] text-black mb-5 tracking-tight">{seriesName}</p>
        
        <div className="w-full h-px bg-gray-100 mb-5"></div>
        
        <div className="flex flex-col items-center gap-1.5 text-[13px] font-bold">
          <span className="text-green-700">{views} Toplam Görüntüleme</span>
          <span className="text-green-700">{dailyViews} Günlük Görüntüleme</span>
          <span className="text-red-500">{minRead > 0 ? `${minRead} Dk Okuma` : '0 Dk Okuma'}</span>
          <span className={comments > 0 ? "text-red-500" : "text-green-700"}>{comments > 0 ? `${comments} Yorum` : '0 Yorum'}</span>
        </div>
      </div>
    </Link>
  );
}
