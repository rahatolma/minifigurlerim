import Image from 'next/image';
import Link from 'next/link';
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
    <Link href={`/haberler/${slug}`} className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
      <div className="relative w-full aspect-[4/3] bg-[#fafafa] flex items-center justify-center p-6 border-b border-gray-50 flex-none overflow-hidden group">
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
        
        <div className="w-full h-px bg-gray-100 mb-5"></div>
        
        <div className="flex flex-col items-center gap-1.5 text-[12px] font-bold">
          <span className="text-green-700">{views || 0} {t('TotalViews')}</span>
          <span className="text-green-700">{dailyViews || 0} {t('DailyViews')}</span>
          <span className="text-red-500">{minRead > 0 ? `${minRead} ${t('MinRead')}` : `0 ${t('MinRead')}`}</span>
          <span className={comments > 0 ? "text-red-500" : "text-green-700"}>{comments > 0 ? `${comments} ${t('Comments')}` : `0 ${t('Comments')}`}</span>
        </div>
      </div>
    </Link>
  );
}
