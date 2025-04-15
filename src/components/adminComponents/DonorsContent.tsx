import React, { useState } from 'react';
import useSWR from 'swr';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DonorEdit from '@/components/adminComponents/DonorEdit';
import DonorDelete from '@/components/adminComponents/DonorDelete';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Helper function to get proper image URL
const getProfileImageUrl = (profilePicUrl: string | undefined) => {
  if (!profilePicUrl) return null;
  
  // If it's already a complete URL (starts with http or https), use it directly
  if (profilePicUrl.startsWith('http')) {
    return profilePicUrl;
  }
  
  // Otherwise construct the download API URL
  return `/api/file/download?file=${encodeURIComponent(profilePicUrl)}`;
};

// Types
interface Donor {
  _id: string;
  donorId: string;
  displayName: string;
  email: string;
  donorType: 'INDIVIDUAL' | 'COMPANY';
  verified: boolean;
  profilePicUrl?: string;
  createdAt: string;
}

interface DonationStat {
  donorId: string;
  displayName: string;
  totalAmount: number;
  donationCount: number;
  lastDonation?: {
    date: string;
    amount: number;
  };
}

interface DonorTypeData {
  name: string;
  value: number;
}

interface MonthlyDonation {
  month: string;
  amount: number;
}

const DonorsContent: React.FC = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [deletingDonor, setDeletingDonor] = useState<Donor | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch donors with SWR
  const { data: donorData, error: donorError, isValidating: donorsLoading, mutate: refreshDonors } = useSWR(
    `/api/donor?page=${page}&limit=${limit}${debouncedSearchTerm ? `&name=${debouncedSearchTerm}` : ''}`,
    fetcher,
    { revalidateOnFocus: true }
  );

  // Fetch donation statistics for top donors
  const { data: donationStatsData, error: statsError, isValidating: statsLoading } = useSWR(
    '/api/donation/stats?groupBy=donor&limit=5&sort=totalAmount',
    fetcher
  );

  // Fetch monthly donation data
  const { data: monthlyData, error: monthlyError } = useSWR(
    '/api/donation/monthly',
    fetcher
  );

  // Handle errors
  const error = donorError || statsError || monthlyError;

  // Calculate donor type data for chart
  const donorTypeData: DonorTypeData[] = React.useMemo(() => {
    if (!donorData?.donors) return [
      { name: 'Individual', value: 0 },
      { name: 'Company', value: 0 }
    ];

    const individuals = donorData.donors.filter((d: Donor) => d.donorType === 'INDIVIDUAL').length;
    const companies = donorData.donors.filter((d: Donor) => d.donorType === 'COMPANY').length;
    
    return [
      { name: 'Individual', value: individuals },
      { name: 'Company', value: companies }
    ];
  }, [donorData]);

  // Calculate monthly donation data
  const monthlyDonationData: MonthlyDonation[] = React.useMemo(() => {
    return monthlyData?.monthlyDonations || [];
  }, [monthlyData]);

  // Calculate top donors from the stats
  const topDonors: DonationStat[] = React.useMemo(() => {
    if (donationStatsData?.donorStats) {
      return donationStatsData.donorStats;
    }
    
    // Fallback if no data yet
    return [];
  }, [donationStatsData]);

  const handleEdit = (donor: Donor) => {
    setEditingDonor(donor);
  };

  const handleSaveEdit = (updatedDonor: Donor) => {
    refreshDonors();
    setEditingDonor(null);
  };

  const handleDelete = (donor: Donor) => {
    setDeletingDonor(donor);
  };

  const handleConfirmDelete = (donorId: string) => {
    // Just refresh the donors data after deletion
    // The actual API call is handled in the DonorDelete component
    refreshDonors();
    setDeletingDonor(null);
  };

  const handleImageError = (donorId: string) => {
    setImageErrors(prev => ({ ...prev, [donorId]: true }));
  };

  // Pagination helpers
  const totalPages = donorData?.pagination?.pages || 1;
  const goToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setPage(pageNum);
  };

  // Pagination range to show (e.g., 1...4,5,6...10)
  const getPaginationRange = () => {
    const range = [];
    const maxButtons = 5; // Max buttons to show
    
    if (totalPages <= maxButtons) {
      // Show all pages if total pages are less than max buttons
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Always show first and last page
      range.push(1);
      
      // Calculate middle range
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(page + 1, totalPages - 1);
      
      // Adjust if we're close to the beginning
      if (page <= 3) {
        endPage = 4;
      }
      
      // Adjust if we're close to the end
      if (page >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis at the beginning if needed
      if (startPage > 2) {
        range.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        range.push(i);
      }
      
      // Add ellipsis at the end if needed
      if (endPage < totalPages - 1) {
        range.push('...');
      }
      
      // Add last page if not already added
      if (totalPages > 1) {
        range.push(totalPages);
      }
    }
    
    return range;
  };

  const COLORS = ['#1e0fbf', '#6e11b0'];

  // Find donation stats for a specific donor
  const getDonorStats = (donorId: string) => {
    return topDonors.find(stat => stat.donorId === donorId);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Donor Manager</h1>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <p className="text-sm text-red-700 mt-1">{error.message || "Please try again later."}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Analytics Dashboard Section */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Donors Card */}
        <div className="col-span-1 lg:col-span-2 bg-gray-50 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Donors</h2>
          {statsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e0fbf]"></div>
            </div>
          ) : topDonors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Donations</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Donation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topDonors.map((donor) => (
                    <tr key={donor.donorId} className="hover:bg-gray-50">
                      <td className="py-2 px-4 text-sm font-medium text-gray-900">{donor.displayName}</td>
                      <td className="py-2 px-4 text-sm text-gray-900">Rs{donor.totalAmount.toLocaleString()}</td>
                      <td className="py-2 px-4 text-sm text-gray-500">{donor.donationCount}</td>
                      <td className="py-2 px-4 text-sm text-gray-500">
                        {donor.lastDonation ? new Date(donor.lastDonation.date).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No donation data available</div>
          )}
        </div>

        {/* Donor Type Breakdown Card */}
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Donor Type Breakdown</h2>
          {donorsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e0fbf]"></div>
            </div>
          ) : donorTypeData[0].value > 0 || donorTypeData[1].value > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donorTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {donorTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} donors`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No donor data available</div>
          )}
        </div>
      </div>

      {/* Monthly Donations Chart */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Donations</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyDonationData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `Rs${value/1000}k`} />
              <Tooltip formatter={(value) => [`Rs${value.toLocaleString()}`, 'Amount']} />
              <Legend />
              <Bar dataKey="amount" name="Donation Amount" fill="#1e0fbf" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search donors..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      {/* Donor List Table */}
      <div className="overflow-x-auto">
        {donorsLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e0fbf]"></div>
          </div>
        ) : (
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Donations</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Donation</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {donorData?.donors?.map((donor: Donor) => {
                const stats = getDonorStats(donor.donorId);
                const showPlaceholder = !donor.profilePicUrl || imageErrors[donor._id];
                const imageUrl = getProfileImageUrl(donor.profilePicUrl);
                
                return (
                  <tr key={donor._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {!showPlaceholder ? (
                          <img 
                            src={imageUrl || ''}
                            alt={donor.displayName}
                            className="w-8 h-8 rounded-full mr-3 object-cover"
                            onError={() => handleImageError(donor._id)}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                            <span className="text-sm text-gray-600">
                              {donor.displayName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span>{donor.displayName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">{donor.email}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        donor.donorType === 'INDIVIDUAL' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {donor.donorType === 'INDIVIDUAL' ? 'Individual' : 'Company'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {stats ? `Rs${stats.totalAmount.toLocaleString()}` : '₹0'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {stats?.lastDonation 
                        ? new Date(stats.lastDonation.date).toLocaleDateString() 
                        : 'Never'
                      }
                    </td>
                    <td className="py-4 px-4 text-sm font-medium">
                      <button 
                        className="text-[#1e0fbf] mr-2 hover:underline"
                        onClick={() => handleEdit(donor)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(donor)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {(!donorData?.donors || donorData.donors.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {debouncedSearchTerm 
                      ? `No donors found matching "${debouncedSearchTerm}"` 
                      : 'No donors found'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination */}
      {donorData?.pagination && donorData.pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-1 mt-6">
          <button 
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1 || donorsLoading}
          >
            Previous
          </button>
          
          {getPaginationRange().map((pageNum, i) => (
            <button 
              key={i} 
              className={`px-3 py-1 rounded-md ${
                pageNum === page 
                  ? 'bg-[#1e0fbf] text-white' 
                  : 'bg-gray-100 text-gray-700'
              } ${pageNum === '...' ? 'cursor-default' : ''}`}
              onClick={() => typeof pageNum === 'number' && goToPage(pageNum)}
              disabled={pageNum === '...' || donorsLoading}
            >
              {pageNum}
            </button>
          ))}
          
          <button 
            className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages || donorsLoading}
          >
            Next
          </button>
        </div>
      )}

      {editingDonor && (
        <DonorEdit 
          donor={editingDonor}
          onSave={handleSaveEdit}
          onCancel={() => setEditingDonor(null)}
        />
      )}
      
      {deletingDonor && (
        <DonorDelete
          donor={deletingDonor}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingDonor(null)}
        />
      )}
    </div>
  );
};

export default DonorsContent;