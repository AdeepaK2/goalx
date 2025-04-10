import React, { useState, useEffect } from "react";
import { FiBox, FiPlus, FiX, FiLoader, FiCalendar, FiTrash2, FiAlertCircle } from "react-icons/fi";

// Define types for API data
interface RequestItem {
  _id: string;
  requestId: string;
  eventName: string;
  status: string;
  requestDate: string;
  items: Array<{
    equipment: {
      name: string;
    };
    quantityRequested: number;
  }>;
}

interface Equipment {
  _id: string;
  name: string;
  equipmentId: string;
}

interface FormEquipmentItem {
  equipmentId: string;
  quantity: number;
  notes: string;
}

const Requests = () => {
  // State for requests data
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<{id?: string}>({});
  const [equipmentOptions, setEquipmentOptions] = useState<Equipment[]>([]);
  
  // State for modal visibility and form data
  const [showModal, setShowModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    eventName: "",
    eventDescription: "",
    eventStartDate: "",
    eventEndDate: "",
    items: [{ equipmentId: "", quantity: 1, notes: "" }] as FormEquipmentItem[]
  });

  // Fetch data on component mount
  useEffect(() => {
    // Fetch school info and requests
    const fetchData = async () => {
      try {
        // Get current school info first
        const schoolResponse = await fetch('/api/auth/school/me');
        if (!schoolResponse.ok) throw new Error('Failed to fetch school info');
        const schoolData = await schoolResponse.json();
        const schoolId = schoolData.school?.id;
        setSchoolInfo({ id: schoolId });
        
        if (!schoolId) throw new Error('School ID not found');
        
        // Fetch equipment requests for this school
        const requestsResponse = await fetch(`/api/equipment/request?school=${schoolId}`);
        if (!requestsResponse.ok) throw new Error('Failed to fetch requests');
        const requestsData = await requestsResponse.json();
        
        setRequests(requestsData.equipmentRequests || []);
        
        // Fetch available equipment options
        const equipmentResponse = await fetch('/api/equipment');
        if (!equipmentResponse.ok) throw new Error('Failed to fetch equipment');
        const equipmentData = await equipmentResponse.json();
        
        setEquipmentOptions(equipmentData.equipment || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle adding another equipment item to the form
  const handleAddEquipmentItem = () => {
    setRequestForm({
      ...requestForm,
      items: [...requestForm.items, { equipmentId: "", quantity: 1, notes: "" }]
    });
  };

  // Handle removing an equipment item from the form
  const handleRemoveEquipmentItem = (index: number) => {
    const updatedItems = [...requestForm.items];
    updatedItems.splice(index, 1);
    setRequestForm({
      ...requestForm,
      items: updatedItems
    });
  };

  // Handle changes to individual equipment item fields
  const handleEquipmentItemChange = (
    index: number,
    field: 'equipmentId' | 'quantity' | 'notes',
    value: string | number
  ) => {
    const updatedItems = [...requestForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setRequestForm({
      ...requestForm,
      items: updatedItems
    });
  };

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
    
    // Validate form data
    if (requestForm.items.some(item => !item.equipmentId || item.quantity < 1)) {
      alert('Please select an equipment and enter a valid quantity for all items');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format request data according to API requirements
      const requestData = {
        school: schoolInfo.id,
        eventName: requestForm.eventName,
        eventDescription: requestForm.eventDescription,
        eventStartDate: requestForm.eventStartDate,
        eventEndDate: requestForm.eventEndDate || undefined,
        items: requestForm.items.map(item => ({
          equipment: item.equipmentId,
          quantityRequested: item.quantity,
          notes: item.notes || undefined
        }))
      };
      
      // Submit request to API
      const response = await fetch('/api/equipment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }
      
      // Refresh request data
      if (schoolInfo.id) {
        const refreshResponse = await fetch(`/api/equipment/request?school=${schoolInfo.id}`);
        const refreshData = await refreshResponse.json();
        setRequests(refreshData.equipmentRequests || []);
      }
      
      // Reset form and close modal
      setRequestForm({
        eventName: "",
        eventDescription: "",
        eventStartDate: "",
        eventEndDate: "",
        items: [{ equipmentId: "", quantity: 1, notes: "" }]
      });
      setShowModal(false);
      
    } catch (err) {
      console.error('Error submitting request:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRequestForm({
      eventName: "",
      eventDescription: "",
      eventStartDate: "",
      eventEndDate: "",
      items: [{ equipmentId: "", quantity: 1, notes: "" }]
    });
  };

  // Loading state component
  const LoadingState = () => (
    <div className="flex justify-center items-center p-8">
      <FiLoader className="animate-spin text-[#6e11b0] mr-2" size={20} />
      <span>Loading data...</span>
    </div>
  );

  // Error state component
  const ErrorState = ({ message }: { message: string }) => (
    <div className="p-4 border border-red-200 rounded bg-red-50 text-red-700 text-center">
      <FiAlertCircle className="inline-block mr-2" />
      Error: {message || "Unknown error"}
    </div>
  );

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-12">
        <div className="grid grid-cols-1 gap-6">
          {/* Items Requested Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiBox className="mr-2 text-[#6e11b0]" /> Equipment Requests
              </h2>
              <button
                onClick={handleMakeRequest}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out disabled:opacity-50"
              >
                <FiPlus className="mr-1 h-4 w-4" /> Make Request
              </button>
            </div>
            <div className="p-5">
              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} />
              ) : (
                <div>
                  {requests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No equipment requests found. Create your first request!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((request) => (
                        <div
                          key={request._id}
                          className="bg-gray-50 p-4 rounded-md"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">{request.eventName}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            Request ID: {request.requestId}
                          </div>
                          <div className="text-sm text-gray-600">
                            Items: {request.items.map(item => 
                              `${item.equipment?.name} (${item.quantityRequested})`
                            ).join(', ')}
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            Requested on: {new Date(request.requestDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 md:mx-0">
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
              <div className="space-y-6">
                {/* Event Details Section */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-md font-medium text-[#1e0fbf] mb-3">Event Details</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="eventName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Event Name *
                      </label>
                      <input
                        type="text"
                        id="eventName"
                        name="eventName"
                        value={requestForm.eventName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="eventDescription"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Event Description *
                      </label>
                      <textarea
                        id="eventDescription"
                        name="eventDescription"
                        rows={3}
                        value={requestForm.eventDescription}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="eventStartDate"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Start Date *
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="eventStartDate"
                            name="eventStartDate"
                            value={requestForm.eventStartDate}
                            onChange={handleInputChange}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="eventEndDate"
                          className="block text-sm font-medium text-gray-700"
                        >
                          End Date (Optional)
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="eventEndDate"
                            name="eventEndDate"
                            value={requestForm.eventEndDate}
                            onChange={handleInputChange}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            min={requestForm.eventStartDate || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Items Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-[#1e0fbf]">Equipment Items</h4>
                    <button
                      type="button"
                      onClick={handleAddEquipmentItem}
                      className="flex items-center px-2 py-1 text-xs bg-[#1e0fbf] text-white rounded hover:bg-[#6e11b0] focus:outline-none"
                    >
                      <FiPlus className="mr-1" size={12} /> Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {requestForm.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md relative">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEquipmentItem(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label
                              htmlFor={`equipment-${index}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              Equipment *
                            </label>
                            <select
                              id={`equipment-${index}`}
                              value={item.equipmentId}
                              onChange={(e) => handleEquipmentItemChange(index, 'equipmentId', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            >
                              <option value="">Select Equipment</option>
                              {equipmentOptions.map((equipment) => (
                                <option key={equipment._id} value={equipment._id}>
                                  {equipment.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor={`quantity-${index}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              Quantity *
                            </label>
                            <input
                              type="number"
                              id={`quantity-${index}`}
                              value={item.quantity}
                              onChange={(e) => handleEquipmentItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                              min="1"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label
                            htmlFor={`notes-${index}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Notes (Optional)
                          </label>
                          <input
                            type="text"
                            id={`notes-${index}`}
                            value={item.notes}
                            onChange={(e) => handleEquipmentItemChange(index, 'notes', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out flex items-center disabled:opacity-50"
                >
                  {loading && <FiLoader className="animate-spin mr-2" size={16} />}
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
