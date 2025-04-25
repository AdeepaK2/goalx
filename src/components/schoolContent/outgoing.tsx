import React, { useState, useEffect } from "react";
import { FiSend, FiCheckCircle, FiAlertTriangle, FiArrowLeft, FiFilter, FiBox, FiCalendar } from "react-icons/fi";
import { formatDistance } from 'date-fns';
import axios from "axios";

// Types for our data
interface Equipment {
  _id: string;
  name: string;
  equipmentId: string;
}

interface TransactionItem {
  equipment: Equipment;
  quantity: number;
  condition: string;
  notes?: string;
}

interface Recipient {
  _id: string;
  name: string;
  schoolId: string;
}

interface Provider {
  _id: string;
  name?: string;
}

interface RentalDetails {
  startDate: string;
  returnDueDate: string;
  returnedDate?: string;
}

interface Transaction {
  _id: string;
  transactionId: string;
  recipient: Recipient;
  provider: Provider;
  transactionType: 'rental' | 'permanent';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'returned';
  items: TransactionItem[];
  rentalDetails?: RentalDetails;
  createdAt: string;
}

const Outgoing = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentSchool, setCurrentSchool] = useState<{id: string} | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // First fetch the current school info
    const fetchSchoolInfo = async () => {
      try {
        const response = await axios.get('/api/auth/school/me');
        
        if (!response.data?.school || !response.data?.school.id) {
          throw new Error('Failed to fetch school info');
        }
        
        setCurrentSchool({id: response.data.school.id});
        return response.data.school.id;
      } catch (err) {
        console.error('Error fetching school info:', err);
        setError("Failed to fetch your school information");
        setLoading(false);
        return null;
      }
    };

    // Then fetch outgoing transactions
    const fetchOutgoingTransactions = async (schoolId: string) => {
      try {
        setLoading(true);
        console.log("Fetching transactions for school ID:", schoolId);
        
        // Fetch transactions where this school is the provider
        const response = await axios.get("/api/equipment/transaction", {
          params: {
            provider: schoolId,
            providerType: "school"
          }
        });
        
        console.log("API response:", response.data);
        
        if (response.data && Array.isArray(response.data.transactions)) {
          // Further filter to ensure we only show transactions where this school is the provider
          const schoolTransactions = response.data.transactions.filter(
            (tx: Transaction) => tx.provider && tx.provider._id === schoolId
          );
          
          console.log(`Filtered ${response.data.transactions.length} transactions to ${schoolTransactions.length} for this school`);
          
          setTransactions(schoolTransactions);
          setFilteredTransactions(schoolTransactions);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching outgoing transactions:", err);
        setError("Failed to load outgoing equipment data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const initialize = async () => {
      const schoolId = await fetchSchoolInfo();
      if (schoolId) {
        fetchOutgoingTransactions(schoolId);
      }
    };

    initialize();
  }, []);

  // Apply status filter
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredTransactions(transactions);
    } else if (statusFilter === "active") {
      // Show approved and not returned transactions
      setFilteredTransactions(
        transactions.filter(t => 
          t.status === "approved" && 
          (t.transactionType !== "rental" || !t.rentalDetails?.returnedDate)
        )
      );
    } else if (statusFilter === "completed") {
      // Show completed or returned transactions
      setFilteredTransactions(
        transactions.filter(t => 
          t.status === "completed" || 
          t.status === "returned" || 
          (t.status === "approved" && t.rentalDetails?.returnedDate)
        )
      );
    } else {
      // Filter by specific status
      setFilteredTransactions(
        transactions.filter(t => t.status === statusFilter)
      );
    }
  }, [statusFilter, transactions]);

  // Calculate if a rental item is overdue
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  // Format relative date (e.g., "2 days ago" or "in 3 days")
  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  // Get CSS classes for status badge
  const getStatusClass = (status: string, dueDate?: string) => {
    if (status === 'returned') return "bg-green-100 text-green-800";
    if (status === 'approved' && dueDate && isOverdue(dueDate)) return "bg-red-100 text-red-800";
    if (status === 'approved') return "bg-blue-100 text-blue-800";
    if (status === 'pending') return "bg-yellow-100 text-yellow-800";
    if (status === 'rejected') return "bg-red-100 text-red-800";
    if (status === 'completed') return "bg-green-100 text-green-800";
    if (status === 'cancelled') return "bg-gray-100 text-gray-800";
    return "bg-blue-100 text-blue-800";
  };

  // Get status text
  const getStatusText = (status: string, dueDate?: string, transactionType?: string) => {
    if (status === 'returned') return "Returned";
    if (status === 'approved' && transactionType === 'rental' && dueDate && isOverdue(dueDate)) return "Overdue";
    if (status === 'approved' && transactionType === 'permanent') return "Transferred";
    if (status === 'approved') return "Active";
    if (status === 'completed') return "Completed";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Format date to local date string
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Count approved/given transactions
  const approvedCount = transactions.filter(t => 
    t.status === "approved" || t.status === "completed" || t.status === "returned"
  ).length;

  // Count total items given
  const totalItemsGiven = transactions
    .filter(t => t.status === "approved" || t.status === "completed" || t.status === "returned")
    .reduce((total, t) => total + t.items.reduce((sum, item) => sum + item.quantity, 0), 0);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Outgoing Equipment
          </h1>
          <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
            Track equipment your school has provided to other schools.
            Monitor returns and manage equipment sharing effectively.
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <FiSend className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Transactions
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {transactions.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <FiCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Equipment Provided
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {approvedCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <FiBox className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Items Given
                    </dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {totalItemsGiven}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-5 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
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
                  <FiSend className="mr-2 text-[#1e0fbf]" /> Outgoing Equipment
                </>
              )}
            </h2>
            
            {!selectedTransaction && (
              <div className="flex items-center">
                <label htmlFor="status-filter" className="mr-2 text-sm text-gray-500">
                  <FiFilter className="inline mr-1" /> Status:
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="all">All</option>
                  <option value="active">Currently Shared</option>
                  <option value="completed">Completed</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="returned">Returned</option>
                </select>
                <span className="ml-4 text-sm text-gray-500">
                  {loading ? 'Loading...' : `${filteredTransactions.length} transactions`}
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading outgoing equipment data...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50">
              <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-2 text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : selectedTransaction ? (
            // Transaction detail view
            <div className="p-5">
              <div className="mb-5 pb-5 border-b">
                <h3 className="text-xl font-medium text-gray-900">{selectedTransaction.transactionId}</h3>
                <p className="text-gray-500">Recipient: {selectedTransaction.recipient.name}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${getStatusClass(selectedTransaction.status, selectedTransaction.rentalDetails?.returnDueDate)}`}>
                    {getStatusText(selectedTransaction.status, selectedTransaction.rentalDetails?.returnDueDate, selectedTransaction.transactionType)}
                  </span>
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    {selectedTransaction.transactionType === 'rental' ? 'Rental' : 'Permanent Transfer'}
                  </span>
                  
                  {selectedTransaction.rentalDetails && (
                    <>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                        <FiCalendar className="mr-1" /> Start: {formatDate(selectedTransaction.rentalDetails.startDate)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
                        selectedTransaction.status === 'approved' && 
                        !selectedTransaction.rentalDetails.returnedDate && 
                        isOverdue(selectedTransaction.rentalDetails.returnDueDate) 
                          ? "bg-red-100 text-red-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        <FiCalendar className="mr-1" /> Due: {formatDate(selectedTransaction.rentalDetails.returnDueDate)}
                      </span>
                      {selectedTransaction.rentalDetails.returnedDate && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                          <FiCalendar className="mr-1" /> Returned: {formatDate(selectedTransaction.rentalDetails.returnedDate)}
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
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No outgoing equipment transactions found.</p>
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
                    {filteredTransactions.map(transaction => (
                      <tr 
                        key={transaction._id} 
                        className={`hover:bg-gray-50 ${
                          transaction.status === "approved" || 
                          transaction.status === "completed" || 
                          transaction.status === "returned" 
                            ? "bg-blue-50" 
                            : ""
                        }`}
                      >
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
                            {getStatusText(transaction.status, transaction.rentalDetails?.returnDueDate, transaction.transactionType)}
                          </span>
                          {(transaction.status === "approved" || transaction.status === "completed" || transaction.status === "returned") && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              Given
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.transactionType === 'rental' && transaction.rentalDetails ? (
                            <>
                              {formatDate(transaction.rentalDetails.returnDueDate)}
                              <br/>
                              <span className={
                                transaction.status === 'approved' && 
                                !transaction.rentalDetails.returnedDate &&
                                isOverdue(transaction.rentalDetails.returnDueDate) ? 
                                "text-red-600" : "text-gray-400"
                              }>
                                {formatRelativeDate(transaction.rentalDetails.returnDueDate)}
                              </span>
                            </>
                          ) : (
                            formatDate(transaction.createdAt)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.items.reduce((sum, item) => sum + item.quantity, 0)} items
                          <br/>
                          <span className="text-xs text-gray-400">
                            {transaction.items.length} {transaction.items.length === 1 ? 'type' : 'types'}
                          </span>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Outgoing;