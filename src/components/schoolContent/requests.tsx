import React, { useState, useEffect } from "react";
import { FiBox, FiPlus, FiX, FiLoader, FiTrash2, FiPhone, FiMail, FiInfo } from "react-icons/fi";

interface EquipmentRequest {
  _id: string;
  requestId: string;
  eventName: string;
  status: string;
  requestDate: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventDescription: string;
  items: Array<{
    equipment: {
      _id: string;
      name: string;
      equipmentId: string;
    };
    quantityRequested: number;
    quantityApproved?: number;
  }>;
  processedBy?: {
    _id: string;
    name?: string;
    fullName?: string;
    email?: string;
    type: 'school' | 'governBody' | 'admin';
    entityId?: string;
  };
  approvedItems?: Array<{
    equipment: {
      _id: string;
      name: string;
      equipmentId: string;
    };
    quantity: number;
    condition: string;
    transactionId?: string;
  }>;
}

interface SchoolInfo {
  id?: string;
  name?: string;
  email?: string;
}

interface Equipment {
  _id: string;
  name: string;
  equipmentId: string;
  description?: string;
  quantity?: number;
  sport?: {
    _id: string;
    sportName: string;
  };
}

interface Sport {
  _id: string;
  sportId: string;
  sportName: string;
  description: string;
  categories: string[];
}

const Requests = () => {
  const [showModal, setShowModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    eventName: "",
    eventDescription: "",
    eventStartDate: "",
    eventEndDate: "",
  });

  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [fetchingSports, setFetchingSports] = useState(false);
  const [sportError, setSportError] = useState<string | null>(null);

  const [requestItems, setRequestItems] = useState<{
    equipmentId: string;
    equipmentName: string;
    quantity: number;
  }[]>([]);
  
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [fetchingEquipment, setFetchingEquipment] = useState(false);
  
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [currentApprover, setCurrentApprover] = useState<{
    name: string;
    email?: string;
    phone?: string;
    type: string;
    website?: string;
    address?: string;
  } | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
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
        
        const requestsResponse = await fetch(`/api/equipment/request?school=${schoolId}&include=processedBy,approvedItems`);
        if (!requestsResponse.ok) {
          throw new Error('Failed to fetch equipment requests');
        }
        
        const requestsData = await requestsResponse.json();
        
        const formattedRequests = requestsData.equipmentRequests?.map((request: any) => ({
          _id: request._id,
          requestId: request.requestId,
          eventName: request.eventName,
          status: request.status,
          requestDate: new Date(request.createdAt).toISOString().split('T')[0],
          eventStartDate: request.eventStartDate ? new Date(request.eventStartDate).toISOString().split('T')[0] : undefined,
          eventEndDate: request.eventEndDate ? new Date(request.eventEndDate).toISOString().split('T')[0] : undefined,
          eventDescription: request.eventDescription,
          items: request.items || [],
          processedBy: request.processedBy ? {
            _id: request.processedBy._id,
            name: request.processedBy.name || request.processedBy.fullName,
            email: request.processedBy.email,
            type: request.processedBy.governBodyId ? 'governBody' : 
                  request.processedBy.schoolId ? 'school' : 'admin',
            entityId: request.processedBy.governBodyId || request.processedBy.schoolId || request.processedBy._id
          } : undefined,
          approvedItems: Array.isArray(request.approvedItems) ? request.approvedItems.map((item: any) => ({
            equipment: item.equipment,
            quantity: item.quantity,
            condition: item.condition,
            transactionId: item.transactionId
          })) : []
        })) || [];
        
        setEquipmentRequests(formattedRequests);
        
        fetchSports();
      } catch (err: any) {
        console.error('Error fetching equipment requests:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const fetchSports = async () => {
    try {
      setFetchingSports(true);
      setSportError(null);
      
      const response = await fetch('/api/sport');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sports');
      }
      
      const data = await response.json();
      
      if (data.sports && Array.isArray(data.sports) && data.sports.length > 0) {
        setSports(data.sports);
        
        await fetchAvailableEquipment();
      } else {
        setSportError('No sports found');
      }
    } catch (err: any) {
      console.error('Error fetching sports:', err);
      setSportError(err.message || 'An error occurred while fetching sports');
    } finally {
      setFetchingSports(false);
    }
  };
  
  const fetchAvailableEquipment = async () => {
    try {
      setFetchingEquipment(true);
      
      const response = await fetch('/api/equipment?limit=100');
      
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }
      
      const data = await response.json();
      
      if (data.equipment && Array.isArray(data.equipment) && data.equipment.length > 0) {
        setAvailableEquipment(data.equipment);
        setFilteredEquipment(data.equipment);
      } else {
        console.warn('No equipment found in database');
        setAvailableEquipment([]);
        setFilteredEquipment([]);
      }
      
    } catch (err) {
      console.error('Error fetching available equipment:', err);
      setAvailableEquipment([]);
      setFilteredEquipment([]);
    } finally {
      setFetchingEquipment(false);
    }
  };
  
  useEffect(() => {
    if (selectedSport) {
      const filtered = availableEquipment.filter(
        equipment => equipment.sport?._id === selectedSport
      );
      setFilteredEquipment(filtered);
    } else {
      setFilteredEquipment(availableEquipment);
    }
  }, [selectedSport, availableEquipment]);

  const handleMakeRequest = () => {
    setShowModal(true);
    if (sports.length === 0) {
      fetchSports();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setRequestForm({
      ...requestForm,
      [name]: value,
    });
  };
  
  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSport(e.target.value);
  };
  
  const handleAddEquipmentItem = () => {
    setRequestItems([
      ...requestItems,
      {
        equipmentId: "",
        equipmentName: "",
        quantity: 1
      }
    ]);
  };
  
  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...requestItems];
    
    if (field === 'equipmentId' && typeof value === 'string') {
      const selectedEquipment = filteredEquipment.find(eq => eq._id === value);
      newItems[index] = {
        ...newItems[index],
        equipmentId: value,
        equipmentName: selectedEquipment?.name || ""
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }
    
    setRequestItems(newItems);
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = [...requestItems];
    newItems.splice(index, 1);
    setRequestItems(newItems);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    
    try {
      if (!schoolInfo.id) {
        throw new Error('School information not available');
      }
      
      if (requestItems.length === 0) {
        throw new Error('At least one equipment item is required');
      }
      
      const invalidItems = requestItems.filter(item => 
        !item.equipmentId || item.quantity < 1
      );
      
      if (invalidItems.length > 0) {
        throw new Error('All equipment items must have a selection and a valid quantity');
      }
      
      const requestData = {
        school: schoolInfo.id,
        eventName: requestForm.eventName,
        eventDescription: requestForm.eventDescription,
        eventStartDate: requestForm.eventStartDate || undefined,
        eventEndDate: requestForm.eventEndDate || undefined,
        items: requestItems.map(item => ({
          equipment: item.equipmentId,
          quantityRequested: item.quantity
        }))
      };
      
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
      
      const newRequest = await response.json();
      
      const formattedNewRequest = {
        _id: newRequest._id,
        requestId: newRequest.requestId,
        eventName: newRequest.eventName,
        status: newRequest.status,
        requestDate: new Date(newRequest.createdAt).toISOString().split('T')[0],
        eventStartDate: newRequest.eventStartDate ? new Date(newRequest.eventStartDate).toISOString().split('T')[0] : undefined,
        eventEndDate: newRequest.eventEndDate ? new Date(newRequest.eventEndDate).toISOString().split('T')[0] : undefined,
        eventDescription: newRequest.eventDescription,
        items: newRequest.items || []
      };
      
      setEquipmentRequests(prev => [formattedNewRequest, ...prev]);
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      
      setRequestForm({ 
        eventName: "", 
        eventDescription: "", 
        eventStartDate: "", 
        eventEndDate: "" 
      });
      setRequestItems([]);
      setSelectedSport("");
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
    setRequestForm({ 
      eventName: "", 
      eventDescription: "", 
      eventStartDate: "", 
      eventEndDate: "" 
    });
    setRequestItems([]);
    setSelectedSport("");
    setSubmitError(null);
  };

  const fetchContactDetails = async (request: EquipmentRequest) => {
    // Reset state
    setLoadingContact(true);
    setContactError(null);
    
    try {
      let entityId: string | undefined;
      let entityType: string | undefined;
      let transactionId: string | undefined;
      
      // First check if the approval is linked to a transaction
      if (request.approvedItems && request.approvedItems.length > 0) {
        // Get the transaction ID from the first approved item (if available)
        transactionId = request.approvedItems[0].transactionId;
        
        if (transactionId) {
          // Check if it's a governing body transaction (starts with 'GRT' or 'GTF')
          if (transactionId.startsWith('GRT') || transactionId.startsWith('GTF')) {
            // Fetch from govern transaction API
            const transResponse = await fetch(`/api/equipment/transaction/govern?id=${transactionId}`);
            
            if (!transResponse.ok) {
              throw new Error('Failed to fetch transaction information');
            }
            
            const transaction = await transResponse.json();
            
            if (transaction && transaction.governBody) {
              entityId = typeof transaction.governBody === 'string' 
                ? transaction.governBody 
                : transaction.governBody._id;
              entityType = 'governBody';
            }
          } else if (transactionId.startsWith('RNT') || transactionId.startsWith('TRF')) {
            // Fetch from general transaction API
            const transResponse = await fetch(`/api/equipment/transaction?id=${transactionId}`);
            
            if (!transResponse.ok) {
              throw new Error('Failed to fetch transaction information');
            }
            
            const transaction = await transResponse.json();
            
            if (transaction && transaction.provider) {
              entityId = typeof transaction.provider === 'string' 
                ? transaction.provider 
                : transaction.provider._id;
              entityType = transaction.providerType === 'school' ? 'school' : 'governBody';
            }
          }
        }
      }
      
      // If we couldn't get entity info from transaction, use the processedBy field
      if (!entityId && request.processedBy) {
        entityId = request.processedBy.entityId;
        entityType = request.processedBy.type;
      }
      
      if (!entityId || !entityType) {
        throw new Error('No contact information available');
      }
      
      // Use the appropriate API based on entity type
      let endpoint = '';
      if (entityType === 'school') {
        endpoint = `/api/school?id=${entityId}`;
      } else if (entityType === 'governBody') {
        endpoint = `/api/govern?id=${entityId}`;
      } else {
        throw new Error('Unknown entity type');
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact information');
      }
      
      const data = await response.json();
      
      // Format contact data based on entity type
      if (entityType === 'school') {
        setCurrentApprover({
          name: data.name,
          email: data.contact?.email,
          phone: data.contact?.phone,
          type: 'School',
          address: [data.location?.district, data.location?.province].filter(Boolean).join(', ')
        });
      } else {
        setCurrentApprover({
          name: data.name,
          email: data.email,
          phone: data.contact?.phone,
          type: 'Governing Body',
          website: data.contact?.website
        });
      }
      
      setContactModalVisible(true);
    } catch (error: any) {
      console.error('Error fetching contact details:', error);
      setContactError(error.message || 'Failed to fetch contact information');
    } finally {
      setLoadingContact(false);
    }
  };

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 gap-6">
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
                          {request.eventStartDate && (
                            <p className="mb-1">
                              Event Date: {formatDate(request.eventStartDate)} 
                              {request.eventEndDate && ` to ${formatDate(request.eventEndDate)}`}
                            </p>
                          )}
                          <p>Requested on: {formatDate(request.requestDate)}</p>
                          
                          {request.status === 'approved' && (
                            <div className="mt-2 py-1 px-2 bg-blue-50 rounded-md">
                              {request.approvedItems && request.approvedItems.length > 0 ? (
                                <div className="text-sm">
                                  <p>
                                    <span className="font-medium">Approved items:</span> {request.approvedItems.length}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span>
                                      {request.processedBy?.name && (
                                        <>Approved by: {request.processedBy.name}</>
                                      )}
                                    </span>
                                    <button 
                                      onClick={() => fetchContactDetails(request)} 
                                      className="text-blue-500 hover:text-blue-700 flex items-center text-xs border border-blue-200 py-1 px-2 rounded"
                                      disabled={loadingContact}
                                    >
                                      {loadingContact ? (
                                        <FiLoader className="animate-spin mr-1" size={12} />
                                      ) : (
                                        <FiPhone className="mr-1" size={12} />
                                      )}
                                      Contact Provider
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="flex items-center justify-between">
                                  <span>
                                    Approved by: {request.processedBy?.name || 'Unknown'} 
                                    {request.processedBy?.type === 'governBody' ? ' (Governing Body)' : 
                                    request.processedBy?.type === 'school' ? ' (School)' : ''}
                                  </span>
                                  
                                  <button 
                                    onClick={() => fetchContactDetails(request)} 
                                    className="ml-2 text-blue-500 hover:text-blue-700 flex items-center text-xs border border-blue-200 py-0.5 px-1.5 rounded"
                                    disabled={loadingContact}
                                  >
                                    {loadingContact ? (
                                      <FiLoader className="animate-spin mr-1" size={12} />
                                    ) : (
                                      <FiPhone className="mr-1" size={12} />
                                    )}
                                    Contact
                                  </button>
                                </p>
                              )}
                            </div>
                          )}
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

      {showModal && (
        <div className="fixed inset-0 backdrop-blur bg-opacity-50 bg-black overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 md:mx-auto my-8">
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

            <form onSubmit={handleSubmitRequest} className="px-6 py-4">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="eventName"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Event Name
                  </label>
                  <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    placeholder="e.g. Annual Sports Meet"
                    value={requestForm.eventName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="eventStartDate"
                      className="block text-sm font-medium text-[#1e0fbf]"
                    >
                      Event Start Date
                    </label>
                    <input
                      type="date"
                      id="eventStartDate"
                      name="eventStartDate"
                      value={requestForm.eventStartDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label
                      htmlFor="eventEndDate"
                      className="block text-sm font-medium text-[#1e0fbf]"
                    >
                      Event End Date
                    </label>
                    <input
                      type="date"
                      id="eventEndDate"
                      name="eventEndDate"
                      value={requestForm.eventEndDate}
                      onChange={handleInputChange}
                      min={requestForm.eventStartDate || new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="eventDescription"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Event Description
                  </label>
                  <textarea
                    id="eventDescription"
                    name="eventDescription"
                    rows={3}
                    placeholder="Describe the event and why you need this equipment"
                    value={requestForm.eventDescription}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label
                    htmlFor="sport"
                    className="block text-sm font-medium text-[#1e0fbf]"
                  >
                    Select Sport
                  </label>
                  <select
                    id="sport"
                    value={selectedSport}
                    onChange={handleSportChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Sports</option>
                    {fetchingSports ? (
                      <option disabled>Loading sports...</option>
                    ) : (
                      sports.map((sport) => (
                        <option key={sport._id} value={sport._id}>
                          {sport.sportName}
                        </option>
                      ))
                    )}
                  </select>
                  {sportError && (
                    <p className="mt-1 text-sm text-red-600">{sportError}</p>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-[#1e0fbf]">
                      Equipment Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddEquipmentItem}
                      className="inline-flex items-center text-sm text-[#1e0fbf] hover:text-[#6e11b0]"
                    >
                      <FiPlus className="mr-1" /> Add Item
                    </button>
                  </div>
                  
                  {requestItems.length === 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
                      No equipment items added yet. Click "Add Item" to add equipment to your request.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requestItems.map((item, index) => (
                        <div key={index} className="flex items-start space-x-2 bg-gray-50 p-3 rounded-md">
                          <div className="flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-500">
                                  Equipment
                                </label>
                                <select
                                  value={item.equipmentId}
                                  onChange={(e) => handleItemChange(index, 'equipmentId', e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-gray-800 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  required
                                >
                                  <option value="">Select Equipment</option>
                                  {fetchingEquipment ? (
                                    <option disabled>Loading equipment...</option>
                                  ) : filteredEquipment.length === 0 ? (
                                    <option disabled>No equipment available</option>
                                  ) : (
                                    filteredEquipment.map(eq => (
                                      <option key={eq._id} value={eq._id}>
                                        {eq.name} {eq.sport?.sportName ? `(${eq.sport.sportName})` : ''}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-gray-800 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="mt-6 text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {submitError}
                  </div>
                )}
              </div>

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
                  disabled={submitLoading || requestItems.length === 0}
                  className="px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out flex items-center disabled:bg-opacity-70 disabled:cursor-not-allowed"
                >
                  {submitLoading && <FiLoader className="animate-spin mr-2" size={16} />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {contactModalVisible && (
        <div className="fixed inset-0 backdrop-blur bg-opacity-50 bg-black overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto my-8">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Equipment Provider Contact
              </h3>
              <button
                onClick={() => setContactModalVisible(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4">
              {contactError ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-center">
                  {contactError}
                </div>
              ) : currentApprover ? (
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h4 className="font-medium text-[#1e0fbf]">{currentApprover.name}</h4>
                    <p className="text-sm text-gray-500">{currentApprover.type}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {currentApprover.email && (
                      <div className="flex items-center">
                        <FiMail className="text-gray-500 mr-2" />
                        <a href={`mailto:${currentApprover.email}`} className="text-blue-600 hover:underline">
                          {currentApprover.email}
                        </a>
                      </div>
                    )}
                    
                    {currentApprover.phone && (
                      <div className="flex items-center">
                        <FiPhone className="text-gray-500 mr-2" />
                        <a href={`tel:${currentApprover.phone}`} className="text-blue-600 hover:underline">
                          {currentApprover.phone}
                        </a>
                      </div>
                    )}
                    
                    {currentApprover.website && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <a href={currentApprover.website.startsWith('http') ? currentApprover.website : `https://${currentApprover.website}`} 
                           className="text-blue-600 hover:underline" 
                           target="_blank"
                           rel="noopener noreferrer">
                          {currentApprover.website}
                        </a>
                      </div>
                    )}
                    
                    {currentApprover.address && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-700">{currentApprover.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 text-sm text-gray-500 italic text-center">
                    This is the contact information for the {currentApprover.type} that provided your approved equipment.
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center p-8">
                  <FiLoader className="animate-spin text-[#6e11b0] mr-2" size={20} />
                  <span>Loading contact information...</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <button
                type="button"
                onClick={() => setContactModalVisible(false)}
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

export default Requests;
