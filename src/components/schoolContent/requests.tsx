import React, { useState, useEffect } from "react";
import { FiBox, FiPlus, FiX, FiLoader } from "react-icons/fi";

interface EquipmentRequest {
  _id: string;
  requestId: string;
  eventName: string;
  status: string;
  requestDate: string;
  items: Array<{
    equipment: {
      _id: string;
      name: string;
      equipmentId: string;
    };
    quantityRequested: number;
  }>;
}

interface SchoolInfo {
  id?: string;
  name?: string;
  email?: string;
}

const Requests = () => {
  // State for modal visibility and form data
  const [showModal, setShowModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: "",
    quantity: "",
    reason: "",
    specialization: "",
  });
  
  // Add state for equipment requests data
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch equipment requests on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First, get current school info
        const schoolResponse = await fetch('/api/auth/school/me');
        if (!schoolResponse.ok) {
          throw new Error('Failed to fetch school information');
        }
        
        const schoolData = await schoolResponse.json();
        const schoolId = schoolData.school?.id;
        setSchoolInfo(schoolData.school || {});
        
        if (!schoolId) {
          throw new Error('No school ID found');
        }
        
        // Then, fetch equipment requests for this school
        const requestsResponse = await fetch(`/api/equipment/request?school=${schoolId}`);
        if (!requestsResponse.ok) {
          throw new Error('Failed to fetch equipment requests');
        }
        
        const requestsData = await requestsResponse.json();
        
        // Format the request data
        const formattedRequests = requestsData.equipmentRequests?.map((request: any) => ({
          _id: request._id,
          requestId: request.requestId,
          eventName: request.eventName,
          status: request.status,
          requestDate: new Date(request.createdAt).toISOString().split('T')[0],
          items: request.items || []
        })) || [];
        
        setEquipmentRequests(formattedRequests);
      } catch (err: any) {
        console.error('Error fetching equipment requests:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handler function for the button click
  const handleMakeRequest = () => {
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setRequestForm({
      ...requestForm,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    
    try {
      if (!schoolInfo.id) {
        throw new Error('School information not available');
      }
      
      // Format the request data for the API
      const requestData = {
        school: schoolInfo.id,
        eventName: `Equipment Request: ${requestForm.name}`,
        eventDescription: requestForm.reason,
        items: [
          {
            // Note: In a real implementation, you would want to select from available equipment
            // This is a simplification - would need to be connected to actual equipment IDs
            equipment: requestForm.specialization, // Using specialization field as an equipment ID temporarily
            quantityRequested: parseInt(requestForm.quantity)
          }
        ]
      };
      
      // Submit the request to the API
      const response = await fetch('/api/equipment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }
      
      // On success, add the new request to the state
      const newRequest = await response.json();
      
      // Format the new request to match our state structure
      const formattedNewRequest = {
        _id: newRequest._id,
        requestId: newRequest.requestId,
        eventName: newRequest.eventName,
        status: newRequest.status,
        requestDate: new Date(newRequest.createdAt).toISOString().split('T')[0],
        items: newRequest.items || []
      };
      
      // Update the state with the new request
      setEquipmentRequests(prev => [formattedNewRequest, ...prev]);
      
      // Show success message and reset form
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      
      // Reset form and close modal
      setRequestForm({ name: "", quantity: "", reason: "", specialization: "" });
      setShowModal(false);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setSubmitError(error.message || 'Failed to submit request');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRequestForm({ name: "", quantity: "", reason: "", specialization: "" });
    setSubmitError(null);
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'pending':
        return 'text-[#6e11b0]';
      case 'partial':
        return 'text-yellow-600';
      case 'delivered':
        return 'text-blue-600';
      default:
        return 'text-[#6e11b0]';
    }
  };

  return (
    <div>
      {/* Hero Section - Keeping the gradient as it already uses the correct colors */}
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Request Equipment for your School
          </h1>
          <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
            Sharing is caring! Request any equipment you need for your school
            and we will do our best to fulfill your request.
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 gap-6">
          {/* Items Requested Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiBox className="mr-2 text-[#6e11b0]" /> Items Requested
              </h2>
              <button
                onClick={handleMakeRequest}
                className="flex items-center px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out"
              >
                <FiPlus className="mr-1 h-4 w-4" /> Make Request
              </button>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <FiLoader className="animate-spin text-[#6e11b0] mr-2" size={20} />
                  <span>Loading requests...</span>
                </div>
              ) : error ? (
                <div className="p-4 border border-red-200 rounded bg-red-50 text-red-700 text-center">
                  {error}
                </div>
              ) : (
                <div className="space-y-4">
                  {equipmentRequests.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No equipment requests found. Click "Make Request" to request equipment.
                    </div>
                  ) : (
                    equipmentRequests.map((request) => (
                      <div
                        key={request._id}
                        className="bg-gray-50 p-4 rounded-md"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-800 font-medium">{request.eventName}</span>
                          <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p className="mb-1">Request ID: {request.requestId}</p>
                          <p className="mb-1">
                            Items: {request.items.map(item => 
                              `${item.equipment?.name || 'Equipment'} (${item.quantityRequested})`
                            ).join(', ')}
                          </p>
                          <p>Requested on: {request.requestDate}</p>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {submitSuccess && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-center">
                      Request submitted successfully!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-0">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Request Equipment
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitRequest} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Equipment Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={requestForm.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-[#6e11b0] focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="specialization"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Equipment Specialization
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={requestForm.specialization}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 text-[#6e11b0] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={requestForm.quantity}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-[#6e11b0] focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Reason for Request
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    value={requestForm.reason}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-[#6e11b0] focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {submitError}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out flex items-center"
                >
                  {submitLoading && <FiLoader className="animate-spin mr-2" size={16} />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
