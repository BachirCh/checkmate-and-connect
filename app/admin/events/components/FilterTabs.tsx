'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function FilterTabs() {
  const searchParams = useSearchParams();
  const currentStatus = (searchParams.get('status') as StatusFilter) || 'all';

  const tabs: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <div className="border-b border-gray-800">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/events?status=${tab.value}`}
            className={`pb-4 px-1 font-medium transition-colors ${
              currentStatus === tab.value
                ? 'border-b-2 border-white text-white'
                : 'text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-500'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
