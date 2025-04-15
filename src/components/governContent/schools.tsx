import React, { useState, useEffect } from 'react';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiSearch, 
  FiArrowUp, 
  FiArrowDown 
} from 'react-icons/fi';

// School interface based on the schema
interface School {
  _id: string;
  schoolId: string;
  sid: number;
  name: string;
  location: {
    district: string;
    province: string;
    zonal?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  contact?: {
    email?: string;
    phone?: string;
  };
  principalName?: string;
  verified: boolean;
  adminVerified?: boolean;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const SchoolsDirectory: React.FC = () => {
  // State management
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  
  // Sorting state
  const [sortField, setSortField] = useState<'name' | 'district' | 'province'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Fetch schools from API with filters and pagination
  const fetchSchools = async () => {
    try {
      setLoading(true);
      
      let url = `/api/school?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (searchTerm) url += `&name=${encodeURIComponent(searchTerm)}`;
      if (selectedDistrict) url += `&district=${encodeURIComponent(selectedDistrict)}`;
      if (selectedProvince) url += `&province=${encodeURIComponent(selectedProvince)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }
      
      const data = await response.json();
      
      setSchools(data.schools);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch schools when dependencies change
  useEffect(() => {
    fetchSchools();
  }, [pagination.page, pagination.limit, selectedDistrict, selectedProvince]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchSchools();
  };

  // Handle pagination change
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  // Sort schools locally
  const sortedSchools = [...schools].sort((a, b) => {
    let fieldA, fieldB;
    
    switch(sortField) {
      case 'name':
        fieldA = a.name.toLowerCase();
        fieldB = b.name.toLowerCase();
        break;
      case 'district':
        fieldA = a.location.district.toLowerCase();
        fieldB = b.location.district.toLowerCase();
        break;
      case 'province':
        fieldA = a.location.province.toLowerCase();
        fieldB = b.location.province.toLowerCase();
        break;
      default:
        fieldA = a.name.toLowerCase();
        fieldB = b.name.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return fieldA > fieldB ? 1 : -1;
    } else {
      return fieldA < fieldB ? 1 : -1;
    }
  });

  // Handle contact actions
  const handleContact = (type: 'phone' | 'email', contact?: string) => {
    if (!contact) return;
    
    if (type === 'phone') {
      window.location.href = `tel:${contact}`;
    } else {
      window.location.href = `mailto:${contact}`;
    }
  };

  // Toggle sort direction
  const toggleSort = (field: 'name' | 'district' | 'province') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Schools Directory</h1>
      
      {/* Search and Filter Section */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <FiSearch className="text-gray-400" />
              </span>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search Schools"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* ...rest of search/filter controls... */}
          
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </form>
      
      {/* Schools list */}
      {!loading && schools.length === 0 ? (
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold">No schools found</h2>
          <p className="text-gray-500">
            Try adjusting your search filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSchools.map((school) => (
            <div 
              key={school._id}
              className="h-full flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex-grow p-4">
                <h2 className="text-lg font-semibold mb-1 truncate">
                  {school.name}
                </h2>
                
                <p className="text-xs text-gray-500 mb-2">
                  ID: {school.schoolId} (SID: {school.sid})
                </p>
                
                <div className="mb-4 mt-2">
                  <div className="flex items-center mb-1">
                    <FiMapPin className="mr-2 text-gray-500" />
                    <span className="text-sm">
                      {school.location.district}, {school.location.province}
                    </span>
                  </div>
                  {school.location.zonal && (
                    <p className="text-sm text-gray-500">
                      Zonal: {school.location.zonal}
                    </p>
                  )}
                </div>
                
                {school.principalName && (
                  <p className="text-sm mb-2">
                    Principal: {school.principalName}
                  </p>
                )}
                
                <hr className="my-3" />
                
                <h3 className="text-sm font-semibold mb-2">
                  Contact Options
                </h3>
                
                <div className="flex gap-2 mt-2">
                  {school.contact?.phone && (
                    <button 
                      onClick={() => handleContact('phone', school.contact?.phone)}
                      className="flex-grow flex items-center justify-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <FiPhone className="mr-1" />
                      Call
                    </button>
                  )}
                  
                  {school.contact?.email && (
                    <button 
                      onClick={() => handleContact('email', school.contact?.email)}
                      className="flex-grow flex items-center justify-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <FiMail className="mr-1" />
                      Email
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination controls */}
      {/* Replace with a Tailwind pagination component */}
    </div>
  );
};

export default SchoolsDirectory;