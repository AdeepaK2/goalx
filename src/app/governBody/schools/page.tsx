'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type School = {
  schoolId: string;
  sid: number;
  name: string;
  location: {
    district: string;
    province: string;
  };
};

type SortField = 'name' | 'location';
type SortOrder = 'asc' | 'desc';

export default function SchoolList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [totalSchools, setTotalSchools] = useState(0);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchSchools() {
      setLoading(true);
      try {
        const res = await fetch(`/api/school?page=${currentPage}&limit=${itemsPerPage}&name=${searchQuery}`);
        const data = await res.json();
        setSchools(data.schools);
        setTotalSchools(data.pagination.total);
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSchools();
  }, [searchQuery, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedSchools = [...schools].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    if (sortField === 'name') {
      aValue = a.name;
      bValue = b.name;
    } else if (sortField === 'location') {
      aValue = `${a.location.district}, ${a.location.province}`;
      bValue = `${b.location.district}, ${b.location.province}`;
    }
    const modifier = sortOrder === 'asc' ? 1 : -1;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier;
    }
    return (aValue - bValue) * modifier;
  });

  const totalPages = Math.ceil(totalSchools / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">School List</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border bg-card pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {loading
            ? 'Loading...'
            : `Showing ${schools.length ? (currentPage - 1) * itemsPerPage + 1 : 0} to ${Math.min(
                currentPage * itemsPerPage,
                totalSchools
              )} of ${totalSchools} schools`}
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-[#1E0FBF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-3 text-left cursor-pointer group" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      School Name
                      
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('location')}>
                    <div className="flex items-center">
                      Location
                      <span className="ml-2">
                        {sortField === 'location' &&
                          (sortOrder === 'asc' ? (
                            <ChevronUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          ))}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSchools.map((school) => (
                  <tr key={school.schoolId} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/schools/${school.schoolId}`} className="text-primary hover:underline">
                        {school.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {school.location.district}, {school.location.province}
                    </td>
                    <td className="px-6 py-4">
                      {/*contact Email for school */}
                        <a
                        href={`mailto:${school.schoolId}@schooldomain.com`}
                        className="text-primary transition-all duration-300 hover:text-primary/80 hover:underline hover:font-semibold"
                        >
                        Contact
                        </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
