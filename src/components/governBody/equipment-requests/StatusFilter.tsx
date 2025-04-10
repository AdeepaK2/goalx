'use client';

import { Filter } from 'lucide-react';

interface StatusFilterProps {
  selectedStatus: string[];
  onChange: (status: string[]) => void;
}

const statuses = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

export default function StatusFilter({ selectedStatus, onChange }: StatusFilterProps) {
  const toggleStatus = (status: string) => {
    if (selectedStatus.includes(status)) {
      onChange(selectedStatus.filter((s) => s !== status));
    } else {
      onChange([...selectedStatus, status]);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      {statuses.map((status) => (
        <button
          key={status.value}
          onClick={() => toggleStatus(status.value)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selectedStatus.includes(status.value)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}