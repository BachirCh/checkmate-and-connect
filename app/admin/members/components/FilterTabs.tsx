'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type StatusFilter = 'pending' | 'approved' | 'rejected';

export default function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = (searchParams.get('status') as StatusFilter) || 'pending';

  const handleFilterChange = (status: StatusFilter) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', status);
    router.push(`?${params.toString()}`);
  };

  const tabs: { label: string; value: StatusFilter }[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <div className="border-b border-gray-800">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={`pb-4 px-1 font-medium transition-colors ${
              currentStatus === tab.value
                ? 'border-b-2 border-white text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
