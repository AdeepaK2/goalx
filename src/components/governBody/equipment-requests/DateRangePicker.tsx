'use client';

import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  onChange: (range: { from: Date | null; to: Date | null }) => void;
}

export default function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center space-x-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <input
        type="date"
        value={dateRange.from?.toISOString().split('T')[0] || ''}
        onChange={(e) =>
          onChange({
            ...dateRange,
            from: e.target.value ? new Date(e.target.value) : null,
          })
        }
        className="rounded-lg border bg-card px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <span className="text-muted-foreground">to</span>
      <input
        type="date"
        value={dateRange.to?.toISOString().split('T')[0] || ''}
        onChange={(e) =>
          onChange({
            ...dateRange,
            to: e.target.value ? new Date(e.target.value) : null,
          })
        }
        className="rounded-lg border bg-card px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}