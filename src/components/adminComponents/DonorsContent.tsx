import React from 'react';

const DonorsContent: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Donor Manager</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search donors..."
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
          Add Donor
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Donations</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Donation</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="hover:bg-gray-50">
              <td className="py-4 px-4 text-sm font-medium text-gray-900">Rajesh Kumar</td>
              <td className="py-4 px-4 text-sm text-gray-500">rajesh@example.com</td>
              <td className="py-4 px-4 text-sm text-gray-500">₹50,000</td>
              <td className="py-4 px-4 text-sm text-gray-500">March 15, 2025</td>
              <td className="py-4 px-4 text-sm text-[#1e0fbf] font-medium">
                <button className="mr-2">View</button>
                <button className="text-red-600">Delete</button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-4 px-4 text-sm font-medium text-gray-900">Priya Sharma</td>
              <td className="py-4 px-4 text-sm text-gray-500">priya@example.com</td>
              <td className="py-4 px-4 text-sm text-gray-500">₹75,000</td>
              <td className="py-4 px-4 text-sm text-gray-500">April 2, 2025</td>
              <td className="py-4 px-4 text-sm text-[#1e0fbf] font-medium">
                <button className="mr-2">View</button>
                <button className="text-red-600">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonorsContent;