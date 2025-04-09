import React, { useState, useEffect } from 'react';
import GoverningBodyEdit from './GoverningBodyEdit';
import GoverningBodyDelete from './GoverningBodyDelete';
import { toast } from 'react-hot-toast';

interface GoverningBody {
  _id: string;
  governBodyId: string;
  name: string;
  type?: string;
  email: string;
  abbreviation?: string;
  specializedSport?: string;
  contact?: {
    phone?: string;
    website?: string;
  };
  active: boolean;
  schoolsManaged?: number;
}

interface Transaction {
  _id: string;
  transactionId: string;
  provider: any;
  recipient: any;
  status: string;
  transactionType: string;
  createdAt: string;
}

const GoverningBodiesContent: React.FC = () => {
  const [govBodies, setGovBodies] = useState<GoverningBody[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [selectedBody, setSelectedBody] = useState<GoverningBody | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Add state for edit and delete functionality
  const [editingBody, setEditingBody] = useState<GoverningBody | null>(null);
  const [deletingBody, setDeletingBody] = useState<GoverningBody | null>(null);

  useEffect(() => {
    fetchGoverningBodies();
    fetchRecentTransactions();
  }, []);

  const fetchGoverningBodies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/govern');
      if (!response.ok) {
        throw new Error('Failed to fetch governing bodies');
      }
      const data = await response.json();
      setGovBodies(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch('/api/equipment/transaction?limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch recent transactions');
      }
      const data = await response.json();
      setRecentTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
    }
  };

  const handleContactClick = (body: GoverningBody) => {
    setSelectedBody(body);
    setContactModalOpen(true);
  };

  const closeContactModal = () => {
    setContactModalOpen(false);
    setSelectedBody(null);
  };
  
  // Handle edit click
  const handleEditClick = (body: GoverningBody) => {
    setEditingBody(body);
  };
  
  // Handle delete click
  const handleDeleteClick = (body: GoverningBody) => {
    setDeletingBody(body);
  };
  
  // Handle save edit
  const handleSaveEdit = (updatedBody: GoverningBody) => {
    // Update the local state with the edited body
    setGovBodies(prevBodies => 
      prevBodies.map(body => 
        body._id === updatedBody._id ? updatedBody : body
      )
    );
    setEditingBody(null);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = (governBodyId: string) => {
    // Remove the deleted body from local state
    setGovBodies(prevBodies => 
      prevBodies.filter(body => body.governBodyId !== governBodyId)
    );
    setDeletingBody(null);
  };

  const filteredBodies = govBodies.filter(body => 
    body.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    body.governBodyId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Governing Body Manager</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search governing bodies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          Add Governing Body
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e0fbf]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 py-4 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abbreviation</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialized Sport</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBodies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">No governing bodies found</td>
                </tr>
              ) : (
                filteredBodies.map((body) => (
                  <tr key={body._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{body.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{body.governBodyId}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{body.abbreviation || "-"}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{body.specializedSport || "-"}</td>
                    <td className="py-4 px-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        body.active === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {body.active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium">
                      <button 
                        className="mr-2 text-[#1e0fbf] hover:underline"
                        onClick={() => handleContactClick(body)}
                      >
                        Contact
                      </button>
                      <button 
                        className="mr-2 text-[#1e0fbf] hover:underline"
                        onClick={() => handleEditClick(body)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:underline"
                        onClick={() => handleDeleteClick(body)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Transactions Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">No recent transactions</td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-500">{transaction.transactionId}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.provider?.name || "Unknown Provider"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.recipient?.name || "Unknown Recipient"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {transaction.transactionType === 'rental' ? 'Rental' : 'Permanent'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          transaction.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Modal */}
      {contactModalOpen && selectedBody && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Contact {selectedBody.name}</h3>
              <button 
                onClick={closeContactModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base">{selectedBody.email}</p>
              </div>
              
              {selectedBody.contact?.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-base">{selectedBody.contact.phone}</p>
                </div>
              )}
              
              {selectedBody.contact?.website && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <a 
                    href={selectedBody.contact.website.startsWith('http') ? selectedBody.contact.website : `https://${selectedBody.contact.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#1e0fbf] hover:underline"
                  >
                    {selectedBody.contact.website}
                  </a>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeContactModal}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}
      {editingBody && (
        <GoverningBodyEdit 
          governBody={editingBody}
          onSave={handleSaveEdit}
          onCancel={() => setEditingBody(null)}
        />
      )}
      
      {/* Delete Modal */}
      {deletingBody && (
        <GoverningBodyDelete
          governBody={deletingBody}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingBody(null)}
        />
      )}
    </div>
  );
};

export default GoverningBodiesContent;