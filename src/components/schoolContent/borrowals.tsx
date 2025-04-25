import React, { useState, useEffect } from "react";
import { FiClock, FiCheckCircle, FiAlertTriangle, FiArrowLeft, FiPhone, FiMail, FiX } from "react-icons/fi";
import { formatDistance } from 'date-fns';

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

interface Provider {
  _id: string;
  name: string;
  schoolId?: string;
  governBodyId?: string;
  email?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
}

interface RentalDetails {
  startDate: string;
  returnDueDate: string;
  returnedDate?: string;
}

interface Transaction {
  _id: string;
  transactionId: string;
  provider: Provider;
  providerType: 'school' | 'GovernBody';
  transactionType: 'rental' | 'permanent';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'returned';
  items: TransactionItem[];
  rentalDetails?: RentalDetails;
  createdAt: string;
}

interface ProviderContact {
  name: string;
  email?: string;
  phone?: string;
  type: string;
}

const Borrowals = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactDetails, setContactDetails] = useState<ProviderContact | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Mock school ID - In a real app, get this from user context/auth
  const schoolId = "65f903534a0dc23bba9945a3"; // Example ID - replace with actual logic

  useEffect(() => {
    const fetchBorrowals = async () => {
      try {
        setLoading(true);
        // Fetch ALL transactions where this school is the recipient (removed status filter)
        const response = await fetch(`/api/equipment/transaction?recipient=${schoolId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch borrowals");
        }
        
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Error fetching borrowals:", err);
        setError("Failed to load borrowed equipment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowals();
  }, [schoolId]);

  const handleReturnEquipment = async (transaction: Transaction) => {
    if (!window.confirm("Are you sure you want to mark this as returned?")) {
      return;
    }
    
    try {
      setReturnLoading(true);
      
      const response = await fetch(`/api/equipment/transaction?id=${transaction.transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'returned',
          rentalDetails: {
            returnedDate: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }
      
      // Update local state
      setTransactions(prev => 
        prev.map(t => t._id === transaction._id ? {...t, status: 'returned'} : t)
      );

      // Show confirmation
      alert("Equipment successfully marked as returned!");
      setSelectedTransaction(null);
      
    } catch (err) {
      console.error("Error returning equipment:", err);
      alert("Failed to mark equipment as returned. Please try again.");
    } finally {
      setReturnLoading(false);
    }
  };

  const fetchProviderContact = async (transaction: Transaction) => {
    setLoadingContact(true);
    setContactError(null);
    
    try {
      let endpoint = '';
      let entityId = transaction.provider._id;
      
      // Determine which API to call based on provider type
      if (transaction.providerType === 'school') {
        endpoint = `/api/school?id=${entityId}`;
      } else {
        endpoint = `/api/govern?id=${entityId}`;
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contact information`);
      }
      
      const data = await response.json();
      
      // Extract contact details based on provider type
      let contactInfo: ProviderContact = {
        name: transaction.provider.name,
        type: transaction.providerType === 'school' ? 'School' : 'Governing Body'
      };
      
      if (transaction.providerType === 'school') {
        const school = data.school || data; // Handle different API response formats
        contactInfo.email = school.contact?.email;
        contactInfo.phone = school.contact?.phone;
      } else {
        const governBody = data.governBody || data;
        contactInfo.email = governBody.email;
        contactInfo.phone = governBody.contact?.phone;
      }
      
      setContactDetails(contactInfo);
      setShowContactModal(true);
      
    } catch (err) {
      console.error("Error fetching provider contact:", err);
      setContactError("Could not retrieve contact information. Please try again.");
    } finally {
      setLoadingContact(false);
    }
  };

  // Calculate if an item is overdue
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
    if (status === 'pending') return "bg-yellow-100 text-yellow-800";
    if (status === 'rejected') return "bg-red-100 text-red-800";
    if (status === 'cancelled') return "bg-gray-100 text-gray-800";
    if (status === 'approved' && dueDate && isOverdue(dueDate)) return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  // Get status text
  const getStatusText = (status: string, dueDate?: string) => {
    if (status === 'returned') return "Returned";
    if (status === 'pending') return "Pending";
    if (status === 'rejected') return "Rejected";
    if (status === 'cancelled') return "Cancelled";
    if (status === 'completed') return "Completed";
    if (status === 'approved' && dueDate && isOverdue(dueDate)) return "Overdue";
    return "Active";
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Equipment Borrowals
          </h1>
          <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
            Track equipment borrowed by your school. Ensure timely
            returns to maintain good relationships with our partners.
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-12">
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
                  <FiClock className="mr-2 text-[#1e0fbf]" /> Borrowed Equipment
                </>
              )}
            </h2>
            <div>
              <span className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${transactions.length} total transactions`}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading borrowed equipment data...</p>
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
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{selectedTransaction.transactionId}</h3>
                    <p className="text-gray-500">From: {selectedTransaction.provider.name}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${getStatusClass(selectedTransaction.status, selectedTransaction.rentalDetails?.returnDueDate)}`}>
                        {getStatusText(selectedTransaction.status, selectedTransaction.rentalDetails?.returnDueDate)}
                      </span>
                      
                      {selectedTransaction.rentalDetails && (
                        <>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                            Start: {new Date(selectedTransaction.rentalDetails.startDate).toLocaleDateString()}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                            Due: {new Date(selectedTransaction.rentalDetails.returnDueDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => fetchProviderContact(selectedTransaction)}
                    disabled={loadingContact}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none transition"
                  >
                    {loadingContact ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-gray-800 border-t-transparent animate-spin"></span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <FiPhone className="mr-1.5" /> Contact Provider
                      </>
                    )}
                  </button>
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

              {selectedTransaction.status === 'approved' && selectedTransaction.transactionType === 'rental' && (
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => handleReturnEquipment(selectedTransaction)}
                    disabled={returnLoading}
                    className="inline-flex items-center px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition"
                  >
                    {returnLoading ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="mr-1.5" /> Mark as Returned
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No borrowed equipment found.</p>
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
                        Provider
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
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
                          {transaction.provider.name}
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
                          {transaction.rentalDetails ? (
                            <>
                              {new Date(transaction.rentalDetails.returnDueDate).toLocaleDateString()}
                              <br/>
                              <span className={isOverdue(transaction.rentalDetails.returnDueDate) ? "text-red-600" : "text-gray-400"}>
                                {formatRelativeDate(transaction.rentalDetails.returnDueDate)}
                              </span>
                            </>
                          ) : (
                            "N/A"
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
                          {transaction.status === 'approved' && transaction.transactionType === 'rental' && (
                            <button
                              onClick={() => handleReturnEquipment(transaction)}
                              disabled={returnLoading}
                              className="ml-3 text-green-600 hover:text-green-900"
                            >
                              Return
                            </button>
                          )}
                          <button
                            onClick={() => fetchProviderContact(transaction)}
                            disabled={loadingContact}
                            className="ml-3 text-blue-600 hover:text-blue-900"
                          >
                            Contact
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

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-medium text-gray-900 mb-4 pr-6">
              Provider Contact Information
            </h3>
            
            {contactError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-center">
                {contactError}
              </div>
            ) : !contactDetails ? (
              <div className="flex justify-center items-center p-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-indigo-500 border-t-transparent"></div>
                <p className="ml-2 text-gray-600">Loading contact details...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-medium text-[#1e0fbf]">{contactDetails.name}</h4>
                  <p className="text-sm text-gray-500">{contactDetails.type}</p>
                </div>
                
                <div className="space-y-3">
                  {contactDetails.email && (
                    <div className="flex items-center">
                      <FiMail className="text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a href={`mailto:${contactDetails.email}`} className="text-blue-600 hover:underline">
                          {contactDetails.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {contactDetails.phone && (
                    <div className="flex items-center">
                      <FiPhone className="text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a href={`tel:${contactDetails.phone}`} className="text-blue-600 hover:underline">
                          {contactDetails.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {!contactDetails.email && !contactDetails.phone && (
                    <p className="text-center text-gray-500 italic">
                      No contact information available
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Borrowals;
