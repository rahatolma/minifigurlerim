import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface NewsCardProps {
  slug: string;
  title: string;
  imageUrl: string;
  views: number;
  dailyViews: number;
  minRead: number;
  comments: number;
}

export default function NewsCard({ title, imageUrl, views, dailyViews, minRead, comments, slug }: NewsCardProps) {
  const t = useTranslations('NewsCard');

  return (
    <Link href={`/haberler/${slug}` as any} className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
      <div className="relative w-full aspect-video bg-[#fafafa] flex items-center justify-center p-6 border-b border-gray-50 flex-none overflow-hidden group">
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      
      <div className="px-6 py-6 text-center bg-white flex flex-col flex-1">
        <h3 className="font-bold text-[16px] text-[#111] mb-5 leading-snug flex-1 flex items-center justify-center line-clamp-2">
          {title}
        </h3>
        
      </div>
    </Link>
  );
}
