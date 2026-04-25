'use client';

import { Link } from '@/i18n/routing';

interface FilterTab {
  id: string;
  label: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  basePath: string; // örn: "/seriler"
}

export default function FilterTabs({ tabs, activeTab, basePath }: FilterTabsProps) {
  return (
    <div className="w-full border-y border-gray-200 py-3 mb-10 overflow-x-auto bg-white">
      <ul className="flex items-center justify-center gap-10 min-w-max mx-auto px-4 font-bold text-[14px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <li key={tab.id}>
              <Link 
                href={(tab.id === 'all' ? basePath : `${basePath}?cat=${tab.id}`) as any}
                className={`transition-colors py-2 block ${isActive ? 'text-[#D22B2B]' : 'text-gray-600 hover:text-black'}`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
