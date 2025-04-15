import React, { useState, useEffect } from 'react';
import { FiPackage, FiFilter, FiSearch, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { format, isAfter, isBefore } from 'date-fns';
import { Pagination } from '@mui/material';
import Link from 'next/link';

interface TransactionItem {
  equipment: {
    _id: string;
    name: string;
    equipmentId: string;
  };
  quantity: number;
  condition: string;
  notes?: string;
}

interface Transaction {
  _id: string;
  transactionId: string;
  providerType: 'school' | 'GovernBody';
  provider: {
    _id: string;
    name: string;
  };
  recipient: {
    _id: string;
    name: string;
    schoolId: string;
  };
  transactionType: 'rental' | 'permanent';
  items: TransactionItem[];
  rentalDetails?: {
    startDate: string;
    returnDueDate: string;
    returnedDate?: string;
    rentalFee?: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'returned';
  createdAt: string;
  updatedAt: string;
}

interface TransactionProps {
  governBodyId?: string;
  donorData?: any;
}

const EquipmentTransaction: React.FC<TransactionProps> = ({ governBodyId, donorData }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [govBodyId, setGovBodyId] = useState<string | null>(null);
  const [mongoId, setMongoId] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    transactionType: '',
    searchTerm: ''
  });

  useEffect(() => {
    if (governBodyId) {
      setGovBodyId(governBodyId);
      fetchGovernBodyMongoId();
    } else if (donorData?.donorId) {
      setGovBodyId(donorData.donorId);
      fetchGovernBodyMongoId();
    }
  }, [governBodyId, donorData]);

  const fetchGovernBodyMongoId = async () => {
    try {
      const id = governBodyId || donorData?.donorId;
      if (!id) return;
      
      const response = await fetch(`/api/govern?id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch governing body data');
      }
      
      const govData = await response.json();
      if (govData && govData._id) {
        setMongoId(govData._id);
        fetchTransactions(govData._id);
      }
    } catch (err) {
      console.error("Error fetching governing body:", err);
      setError('Failed to load governing body information');
      setLoading(false);
    }
  };

  const fetchTransactions = async (providerId: string) => {
    try {
      setLoading(true);
      
      let url = `/api/equipment/transaction?provider=${providerId}&providerType=GovernBody&page=${pagination.page}&limit=${pagination.limit}`;
      
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.transactionType) url += `&transactionType=${filters.transactionType}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching transactions: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
      setPagination({
        ...pagination,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 1
      });
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mongoId) {
      fetchTransactions(mongoId);
    }
  }, [pagination.page, filters, mongoId]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get appropriate status display and style
  const getStatusClass = (status: string, dueDate?: string) => {
    if (status === 'returned' || status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'rejected' || status === 'cancelled') return 'bg-red-100 text-red-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'approved') {
      // For rentals, check if past due date
      if (dueDate && isAfter(new Date(), new Date(dueDate))) {
        return 'bg-red-100 text-red-800';
      }
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, dueDate?: string) => {
    if (status === 'approved' && dueDate && isAfter(new Date(), new Date(dueDate))) {
      return 'Overdue';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Calculate total items across transactions
  const totalItems = transactions.reduce((sum, transaction) => {
    return sum + transaction.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  if (error) {
    return (
      <div className="py-8 px-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Transactions</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => mongoId && fetchTransactions(mongoId)} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Equipment Transactions
          </h1>
          <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
            Manage equipment transfers and rentals to schools across Sri Lanka.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-800">Total Transactions</h2>
            <p className="text-3xl font-bold mt-2">{pagination.total}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-800">Total Equipment Items</h2>
            <p className="text-3xl font-bold mt-2">{totalItems}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-800">Recipient Schools</h2>
            <p className="text-3xl font-bold mt-2">
              {new Set(transactions.map(t => t.recipient._id)).size}
            </p>
          </div>
        </div>

        {/* Transactions Table/List Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 bg-indigo-50 border-b border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              {selectedTransaction ? (
                <>
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="mr-2 p-1 rounded-full hover:bg-indigo-100"
                  >
                    <FiArrowLeft />
                  </button>
                  Transaction Details
                </>
              ) : (
                <>
                  <FiPackage className="mr-2 text-[#1e0fbf]" /> Equipment Transactions
                </>
              )}
            </h2>
            
            {!selectedTransaction && (
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center">
                  <FiFilter className="text-gray-500 mr-2" />
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-md py-1 pl-2 pr-8 text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="returned">Returned</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <select
                    name="transactionType"
                    value={filters.transactionType}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-md py-1 pl-2 pr-8 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="rental">Rental</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Content based on state */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e0fbf]"></div>
            </div>
          ) : selectedTransaction ? (
            // Transaction detail view
            <div className="p-5">
              <div className="mb-5 pb-5 border-b">
                <h3 className="text-xl font-medium text-gray-900">{selectedTransaction.transactionId}</h3>
                <p className="text-gray-500">Recipient: {selectedTransaction.recipient.name}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${getStatusClass(selectedTransaction.status, selectedTransaction.rentalDetails?.returnDueDate)}`}>
                    {getStatusText(selectedTransaction.status, selectedTransaction.rentalDetails?.returnDueDate)}
                  </span>
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    {selectedTransaction.transactionType === 'rental' ? 'Rental' : 'Permanent Transfer'}
                  </span>
                  
                  {selectedTransaction.rentalDetails && (
                    <>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                        Start: {formatDate(selectedTransaction.rentalDetails.startDate)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                        Due: {formatDate(selectedTransaction.rentalDetails.returnDueDate)}
                      </span>
                      {selectedTransaction.rentalDetails.returnedDate && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                          Returned: {formatDate(selectedTransaction.rentalDetails.returnedDate)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <h4 className="font-medium text-gray-900 mb-3">Equipment Items</h4>
              <div className="space-y-3 mb-6">
                {selectedTransaction.items.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.equipment.name}</span>
                      <span className="text-gray-600">Quantity: {item.quantity}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">Condition: {item.condition}</span>
                      <span className="text-gray-500">ID: {item.equipment.equipmentId}</span>
                    </div>
                    {item.notes && (
                      <p className="mt-2 text-sm text-gray-500">Notes: {item.notes}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-500">
                  Created: {formatDate(selectedTransaction.createdAt)}
                </span>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                >
                  Back to List
                </button>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No equipment transactions found.</p>
              <p className="text-gray-500 mt-2">
                When you provide equipment to schools, your transactions will appear here.
              </p>
            </div>
          ) : (
            // List view
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map(transaction => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.transactionId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.recipient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.transactionType === 'rental' ? 'Rental' : 'Permanent'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                            getStatusClass(transaction.status, transaction.rentalDetails?.returnDueDate)
                          }`}>
                            {getStatusText(transaction.status, transaction.rentalDetails?.returnDueDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.transactionType === 'rental' && transaction.rentalDetails ? (
                            <>
                              {formatDate(transaction.rentalDetails.returnDueDate)}
                              <br/>
                              <span className={
                                transaction.status === 'approved' && 
                                transaction.rentalDetails.returnDueDate && 
                                isAfter(new Date(), new Date(transaction.rentalDetails.returnDueDate)) ? 
                                "text-red-600" : "text-gray-400"
                              }>
                                {transaction.status === 'approved' ? 'Due Date' : ''}
                              </span>
                            </>
                          ) : (
                            formatDate(transaction.createdAt)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.items.length} {transaction.items.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center pt-5">
                  <Pagination 
                    count={pagination.pages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentTransaction;