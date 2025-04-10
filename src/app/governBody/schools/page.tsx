'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Generate more mock data
const mockSchools = Array.from({ length: 100 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `School ${i + 1}`,
  location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'][Math.floor(Math.random() * 5)],
  phone: `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
  email: `contact@school${i + 1}.edu`,
  activeStudents: Math.floor(Math.random() * 2000 + 500),
  activeSports: Math.floor(Math.random() * 12 + 3),
  achievements: Math.floor(Math.random() * 30 + 5),
}));

type SortField = 'name' | 'location' | 'activeStudents' | 'activeSports' | 'achievements';
type SortOrder = 'asc' | 'desc';

export default function SchoolList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredSchools = mockSchools
    .filter((school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      return ((aValue as number) - (bValue as number)) * modifier;
    });

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchools = filteredSchools.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="h-4 w-4 text-muted-foreground/50" />;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-primary" /> : 
      <ChevronDown className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">School List</h1>
        <button className="bg-[#1E0FBF] text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors">
  Add School
</button>

      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-card pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSchools.length)} of {filteredSchools.length} schools
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th 
                  className="px-6 py-3 text-left cursor-pointer group"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    School Name
                    <span className="ml-2"><SortIcon field="name" /></span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center">
                    Location
                    <span className="ml-2"><SortIcon field="location" /></span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort('activeStudents')}
                >
                  <div className="flex items-center">
                    Students
                    <span className="ml-2"><SortIcon field="activeStudents" /></span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort('activeSports')}
                >
                  <div className="flex items-center">
                    Sports
                    <span className="ml-2"><SortIcon field="activeSports" /></span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort('achievements')}
                >
                  <div className="flex items-center">
                    Achievements
                    <span className="ml-2"><SortIcon field="achievements" /></span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSchools.map((school) => (
                <tr key={school.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/schools/${school.id}`} className="text-primary hover:underline">
                      {school.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{school.location}</td>
                  <td className="px-6 py-4">{school.activeStudents.toLocaleString()}</td>
                  <td className="px-6 py-4">{school.activeSports}</td>
                  <td className="px-6 py-4">{school.achievements}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/schools/${school.id}`}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-1 rounded-lg border enabled:hover:bg-muted transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-1 rounded-lg border enabled:hover:bg-muted transition-colors disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}