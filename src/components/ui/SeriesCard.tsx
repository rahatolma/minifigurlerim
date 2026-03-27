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
    <Link href={`/seriler/${id}`} className="block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
      <div className="relative w-full aspect-[4/3] bg-white p-6 flex flex-col items-center justify-center border-b border-gray-50">
        <Image src={imageUrl} alt={title} fill className="object-contain p-6 hover:scale-105 transition-transform duration-500" />
      </div>
      
      <div className="px-6 py-6 text-center flex flex-col h-full bg-white">
        <h3 className="font-bold text-[16px] leading-snug mb-5 min-h-[46px] flex items-center justify-center text-gray-900">
          {title}
        </h3>
        
        <div className="w-full h-px bg-gray-100 mb-5"></div>
        
        <div className="mt-auto flex flex-col items-center gap-1.5 text-[13px] font-bold">
          <span className="text-green-700">Views: {views}</span>
          <span className="text-green-700">Daily Views: {dailyViews}</span>
          <span className="text-red-500">{minRead > 0 ? `${minRead} min read` : '0 min read'}</span>
          <span className={comments > 0 ? "text-red-500" : "text-green-700"}>{comments > 0 ? `${comments} Comments` : '0 Comments'}</span>
        </div>
      </div>
    </Link>
  );
}
