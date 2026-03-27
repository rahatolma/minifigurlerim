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
    <Link href={`/figurler/${id}`} className="block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
      <div className="relative w-full aspect-[4/5] bg-[#fafafa] flex items-center justify-center p-4">
        <Image src={imageUrl} alt={name} fill className="object-contain p-4 mix-blend-multiply hover:scale-110 transition-transform duration-500" />
      </div>
      
      <div className="px-6 py-6 text-center border-t border-gray-100 bg-white">
        <h3 className="font-bold text-[18px] text-[#D22B2B] mb-2">{name}</h3>
        <p className="font-bold text-[13px] text-black mb-5 tracking-tight">{seriesName}</p>
        
        <div className="w-full h-px bg-gray-100 mb-5"></div>
        
        <div className="flex flex-col items-center gap-1.5 text-[13px] font-bold">
          <span className="text-green-700">Views: {views}</span>
          <span className="text-green-700">Daily Views: {dailyViews}</span>
          <span className="text-red-500">{minRead > 0 ? `${minRead} min read` : '0 min read'}</span>
          <span className={comments > 0 ? "text-red-500" : "text-green-700"}>{comments > 0 ? `${comments} Comments` : '0 Comments'}</span>
        </div>
      </div>
    </Link>
  );
}
