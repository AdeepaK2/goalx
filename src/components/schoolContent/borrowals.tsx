'use client';

import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiInfo, FiLoader } from 'react-icons/fi';

// Transaction status colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  returned: 'bg-purple-100 text-purple-800'
};

// Transaction type for type checking
interface Transaction {
  _id: string;
  transactionId: string;
  provider: {
    _id: string;
    name: string;
    email?: string;
  };
  providerType: 'school' | 'GovernBody';
  transactionType: 'rental' | 'permanent';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'returned';
  items: Array<{
    equipment: {
      _id: string;
      name: string;
      equipmentId: string;
    };
    quantity: number;
    condition: string;
  }>;
  rentalDetails?: {
    startDate: string;
    returnDueDate: string;
    returnedDate?: string;
  };
  createdAt: string;
}

// Add a new interface for cached provider data that includes email
interface CachedProvider {
  _id: string;
  name: string;
  email?: string;
}

// Format date in a readable form
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const Borrowals: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolsCache, setSchoolsCache] = useState<{[key: string]: CachedProvider}>({});
  const [governBodyCache, setGovernBodyCache] = useState<{[key: string]: CachedProvider}>({});

  // Fetch current school info first
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const response = await fetch('/api/auth/school/me');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch school information');
        }
        
        setSchoolId(data.school.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to authenticate');
        setToastMessage({
          message: 'Could not identify your school. Please try logging in again.',
          type: 'error'
        });
        setTimeout(() => setToastMessage(null), 5000);
      }
    };
    
    fetchSchoolInfo();
  }, []);

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      let url = `/api/equipment/transaction?recipient=${schoolId}&page=${page}&limit=${limit}`;
      
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      if (transactionTypeFilter) {
        url += `&transactionType=${transactionTypeFilter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
      
      // Process transactions to fetch provider info including email
      const validTransactions = await Promise.all((data.transactions || []).map(async (transaction: Transaction) => {
        // If provider is not properly populated
        if (!transaction.provider || typeof transaction.provider !== 'object') {
          // Make sure providerId is a string, not null or undefined
          const providerId = transaction.provider ? String(transaction.provider) : null;
          
          // Skip fetching if providerId is null
          if (!providerId) {
            return {
              ...transaction,
              provider: { 
                _id: 'unknown', 
                name: 'Unknown Provider' 
              }
            };
          }
          
          // Handle school provider
          if (transaction.providerType === 'school') {
            // Check if we already have this school in cache
            if (schoolsCache[providerId]) {
              return {
                ...transaction,
                provider: schoolsCache[providerId]
              };
            }
            
            // Fetch the school info
            try {
              const schoolResponse = await fetch(`/api/school?id=${providerId}`);
              
              if (!schoolResponse.ok) {
                console.error(`Failed to fetch school (ID: ${providerId}):`, schoolResponse.status);
                return {
                  ...transaction,
                  provider: { _id: providerId, name: `School (ID: ${providerId})` }
                };
              }
              
              const schoolData = await schoolResponse.json();
              
              if (schoolData) {
                // Extract email from school data
                const email = schoolData.contact?.email;
                
                // Create provider object
                const providerObj = { 
                  _id: providerId, 
                  name: schoolData.name || `School (ID: ${providerId})`,
                  email: email 
                };
                
                // Update our schools cache
                setSchoolsCache(prev => ({
                  ...prev,
                  [providerId]: providerObj
                }));
                
                // Return the transaction with populated provider
                return {
                  ...transaction,
                  provider: providerObj
                };
              }
            } catch (err) {
              console.error('Error fetching school details:', err);
            }
          } 
          // Handle government body provider
          else if (transaction.providerType === 'GovernBody') {
            // Check if we already have this gov body in cache
            if (governBodyCache[providerId]) {
              return {
                ...transaction,
                provider: governBodyCache[providerId]
              };
            }
            
            // Fetch the governing body info
            try {
              const govResponse = await fetch(`/api/govern?id=${providerId}`);
              const govData = await govResponse.json();
              
              if (govResponse.ok && govData) {
                // Update our gov bodies cache
                setGovernBodyCache(prev => ({
                  ...prev,
                  [providerId]: { 
                    _id: providerId, 
                    name: govData.name,
                    email: govData.email 
                  }
                }));
                
                // Return the transaction with populated provider
                return {
                  ...transaction,
                  provider: { 
                    _id: providerId, 
                    name: govData.name,
                    email: govData.email 
                  }
                };
              }
            } catch (err) {
              console.error('Error fetching governing body details:', err);
            }
          }
        }
        
        return transaction;
      }));
      
      setTransactions(validTransactions);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setToastMessage({
        message: err instanceof Error ? err.message : 'Failed to load transactions',
        type: 'error'
      });
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to open email client
  const handleContactProvider = (email?: string, providerName?: string) => {
    if (!email) {
      setToastMessage({
        message: 'Email address not available for this provider',
        type: 'error'
      });
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }
    
    window.location.href = `mailto:${email}?subject=Regarding Equipment Transaction&body=Hello ${providerName || 'Provider'},`;
  };

  // Effect to fetch transactions when schoolId, filters or page changes
  useEffect(() => {
    if (schoolId) {
      fetchTransactions();
    }
  }, [schoolId, page, statusFilter, transactionTypeFilter]);

  // Handle filter changes
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTransactionTypeFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Equipment Borrowals
          </h1>
          <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
            Track all equipment that has been provided to your school
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Toast notification */}
            {toastMessage && (
              <div className={`p-3 ${toastMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'} border rounded mb-4`}>
                {toastMessage.message}
              </div>
            )}
            
            {/* Filters */}
            <div className="p-5 bg-purple-50 border-b border-purple-100 flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={statusFilter}
                  onChange={handleStatusChange}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select 
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={transactionTypeFilter}
                  onChange={handleTypeChange}
                >
                  <option value="">All Types</option>
                  <option value="rental">Rental</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
            </div>
            
            {/* Transactions Content */}
            <div className="p-5">
              {loading && transactions.length === 0 ? (
                <div className="flex justify-center items-center p-8">
                  <FiLoader className="animate-spin text-[#6e11b0] mr-2" size={20} />
                  <span>Loading transactions...</span>
                </div>
              ) : error && transactions.length === 0 ? (
                <div className="p-4 border border-red-200 rounded bg-red-50 text-red-700 text-center">
                  {error}
                  <button 
                    onClick={fetchTransactions}
                    className="mt-2 px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-md hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              ) : transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        {transactionTypeFilter !== 'permanent' && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Due</th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.transactionId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              {transaction.provider && typeof transaction.provider === 'object' ? 
                                <div className="flex items-center gap-2">
                                  <span>{transaction.provider.name}</span>
                                  <button
                                    onClick={() => handleContactProvider(
                                      (transaction.provider as CachedProvider).email,
                                      transaction.provider.name
                                    )}
                                    className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                                    title="Contact provider"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                      <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                  </button>
                                </div>
                                : 
                                <span className="italic text-gray-400">Unknown provider</span>
                              }
                              <div className="group relative ml-1">
                                <FiInfo size={14} className="text-gray-400" />
                                <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 text-xs bg-white rounded-md shadow-lg border border-gray-100">
                                  {transaction.providerType === 'school' ? 'School' : 'Government Body'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.items.slice(0, 2).map((item, idx) => (
                              <p key={idx} className="text-sm">
                                {item.quantity}x {item.equipment && typeof item.equipment === 'object' ? 
                                  item.equipment.name : 
                                  <span className="italic">Unknown item</span>
                                }
                              </p>
                            ))}
                            {transaction.items.length > 2 && (
                              <p className="text-xs text-gray-400">
                                +{transaction.items.length - 2} more
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.transactionType === 'rental' ? 'Rental' : 'Permanent'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[transaction.status]}`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </td>
                          {transactionTypeFilter !== 'permanent' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.transactionType === 'rental' && transaction.rentalDetails?.returnDueDate ? (
                                formatDate(transaction.rentalDetails.returnDueDate)
                              ) : (
                                '-'
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex justify-center items-center h-56 bg-gray-50 rounded-md text-gray-500">
                  No transactions found
                </div>
              )}
              
              {/* Pagination */}
              {transactions.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                  <p className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft className="mr-1" />
                      Prev
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Borrowals;