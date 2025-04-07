import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface School {
  _id: string;
  name: string;
  location: {
    district: string;
    province: string;
  };
  students?: number;
  isVerified: boolean;
  status: string;
  contact?: {
    email: string;
    phone?: string;
  };
}

const SchoolsContent: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/school');
        setSchools(response.data.schools);
        setError(null);
      } catch (err) {
        console.error('Error fetching schools:', err);
        setError('Failed to load schools. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [refreshTrigger]);

  const handleVerify = async (id: string) => {
    try {
      await axios.patch(`/api/school?id=${id}`, {
        isVerified: true,
        status: 'active'
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error verifying school:', err);
      setError('Failed to verify school. Please try again.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.patch(`/api/school?id=${id}`, {
        status: 'rejected'
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error rejecting school:', err);
      setError('Failed to reject school. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/school?id=${id}`);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting school:', err);
        setError('Failed to delete school. Please try again.');
      }
    }
  };

  const verifiedSchools = schools.filter(school => 
    school.isVerified && 
    (searchTerm === '' || school.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const unverifiedSchools = schools.filter(school => 
    !school.isVerified && 
    (searchTerm === '' || school.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">School Manager</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-transparent"
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
        
        <button className="px-4 py-2 bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add School
        </button>
      </div>
      
      {unverifiedSchools.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Verification</h2>
          <div className="overflow-x-auto mb-8">
            {loading ? (
              <div className="text-center py-4">Loading pending schools...</div>
            ) : (
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-yellow-50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {unverifiedSchools.map((school) => (
                    <tr key={school._id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{school.name}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {school.location.district}, {school.location.province}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {school.contact?.email}
                        {school.contact?.phone && <div>{school.contact.phone}</div>}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        <button 
                          onClick={() => handleVerify(school._id)}
                          className="mr-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Verify
                        </button>
                        <button 
                          onClick={() => handleReject(school._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
      
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Verified Schools</h2>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-4">Loading schools...</div>
        ) : verifiedSchools.length > 0 ? (
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {verifiedSchools.map((school) => (
                <tr key={school._id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{school.name}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {school.location.district}, {school.location.province}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">{school.students || '-'}</td>
                  <td className="py-4 px-4 text-sm">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {school.status === 'active' ? 'Active' : school.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#1e0fbf] font-medium">
                    <button className="mr-2">Edit</button>
                    <button 
                      className="text-red-600"
                      onClick={() => handleDelete(school._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 border rounded-lg">
            No verified schools found
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolsContent;