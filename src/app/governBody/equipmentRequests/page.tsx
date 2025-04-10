'use client';

import { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import RequestTable from '@/components/governBody/equipment-requests/RequestTable';
import StatusFilter from '@/components/governBody/equipment-requests/StatusFilter';
import DateRangePicker from '@/components/governBody/equipment-requests/DateRangePicker';

const mockRequests = [
  {
    id: '1',
    school: 'St. Mary High School',
    item: 'Basketball Equipment Set',
    quantity: 10,
    date: '2024-03-15',
    status: 'approved',
    priority: 'high',
  },
  {
    id: '2',
    school: 'Lincoln Academy',
    item: 'Soccer Balls',
    quantity: 20,
    date: '2024-03-14',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: '3',
    school: 'Washington High',
    item: 'Tennis Rackets',
    quantity: 15,
    date: '2024-03-13',
    status: 'rejected',
    priority: 'low',
  },
];

export default function EquipmentRequests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  const filteredRequests = mockRequests.filter((request) => {
    const matchesSearch = request.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.item.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(request.status);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Equipment Requests</h1>
        <button className="bg-[#1E0FBF] text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors">
  New Request
</button>

      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search schools or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-card pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <StatusFilter
          selectedStatus={selectedStatus}
          onChange={setSelectedStatus}
        />
        <DateRangePicker
          dateRange={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div className="rounded-lg border bg-card">
        <RequestTable requests={filteredRequests} />
      </div>
    </div>
  );
}