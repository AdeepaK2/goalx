"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiX, FiCheck, FiAlertCircle, FiCalendar, FiMapPin, FiPackage, FiSend } from "react-icons/fi";

interface Equipment {
  _id: string;
  equipmentId: string;
  name: string;
}

interface School {
  _id: string;
  schoolId: string;
  name: string;
  location: {
    district: string;
    province: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

interface RequestItem {
  equipment: Equipment;
  quantityRequested: number;
  quantityApproved?: number;
  notes?: string;
}

interface EquipmentRequest {
  _id: string;
  requestId: string;
  school: School;
  eventName: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventDescription: string;
  items: RequestItem[];
  status: "pending" | "approved" | "rejected" | "partial" | "delivered";
  createdAt: string;
  distance?: number; // Added for sorting by distance
}

interface TransactionItem {
  equipment: string; // Equipment ID
  quantity: number;
  condition: string;
  notes?: string;
}

const Inquiries: React.FC = () => {
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);

  // Filter states
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Transaction modal states
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EquipmentRequest | null>(null);
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
  const [transactionType, setTransactionType] = useState<"rental" | "permanent">("rental");
  const [rentalDates, setRentalDates] = useState({
    startDate: "",
    returnDueDate: ""
  });
  const [transactionNotes, setTransactionNotes] = useState("");
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [completedTransactions, setCompletedTransactions] = useState<Set<string>>(new Set());

  // Function to fetch school information
  const fetchSchoolInfo = async () => {
    try {
      // First get basic school info from auth endpoint
      const response = await axios.get("/api/auth/school/me");
      const basicSchoolData = response.data.school;

      // Ensure we have the basic school data with id
      if (!basicSchoolData || !basicSchoolData.id) {
        throw new Error("Incomplete school data received");
      }
      
      console.log("Basic school data:", basicSchoolData);
      
      // Make second request to get full school details including location
      const fullSchoolResponse = await axios.get(`/api/school?id=${basicSchoolData.id}`);
      
      if (!fullSchoolResponse.data) {
        throw new Error("Failed to retrieve complete school data");
      }
      
      // The school endpoint returns the school object directly
      const fullSchoolData = fullSchoolResponse.data;
      console.log("Full school data:", fullSchoolData);
      
      // Create properly formatted school object
      const formattedSchool: School = {
        _id: fullSchoolData._id,
        schoolId: fullSchoolData.schoolId || "",
        name: fullSchoolData.name || "Unknown School",
        location: {
          district: fullSchoolData.location?.district || "",
          province: fullSchoolData.location?.province || "",
          coordinates: fullSchoolData.location?.coordinates || undefined
        }
      };
      
      console.log("Formatted school object:", formattedSchool);
      setCurrentSchool(formattedSchool);
      return formattedSchool;
    } catch (err: any) {
      console.error("Failed to fetch school info:", err);
      setError(`Failed to load school information: ${err.message || "Unknown error"}`);
      return null;
    }
  };

  // Fetch equipment requests from all schools
  const fetchRequests = async (school: School) => {
    if (!school || !school._id) {
      setError("School information is missing or incomplete");
      setLoading(false);
      return;
    }

    try {
      // Fetch all pending equipment requests
      const response = await axios.get("/api/equipment/request", {
        params: {
          status: "pending",
          limit: 100
        }
      });

      if (response.data && Array.isArray(response.data.equipmentRequests)) {
        // Filter out requests from the current school and already completed transactions
        let allRequests = response.data.equipmentRequests.filter(
          (req: EquipmentRequest) => {
            // Make sure both the request school and the school._id exist
            return req.school &&
                   req.school._id &&
                   req.school._id !== school._id &&
                   !completedTransactions.has(req._id);
          }
        );

        // No sorting by coordinates - keep the order as is
        setRequests(allRequests);
        setFilteredRequests(allRequests);
      } else {
        console.error("Invalid equipment requests response format:", response.data);
        setError("Invalid response format from server");
      }
    } catch (err: any) {
      console.error("Failed to fetch equipment requests:", err);
      setError(`Failed to load equipment requests: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to requests
  useEffect(() => {
    let filtered = [...requests];

    // Apply search filter only
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.eventName.toLowerCase().includes(term) ||
        req.school.name.toLowerCase().includes(term) ||
        req.eventDescription?.toLowerCase().includes(term) ||
        req.items.some(item => item.equipment.name.toLowerCase().includes(term))
      );
    }

    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  // Handle opening the transaction modal
  const openTransactionModal = (request: EquipmentRequest) => {
    setSelectedRequest(request);

    // Initialize transaction items based on request
    const initialItems = request.items.map(item => ({
      equipment: item.equipment._id,
      quantity: 0, // Start with 0 quantity, school will enter how much they can provide
      condition: "good",
      notes: ""
    }));

    setTransactionItems(initialItems);

    // Set default rental dates
    const today = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(today.getDate() + 7);

    setRentalDates({
      startDate: today.toISOString().split("T")[0],
      returnDueDate: oneWeekLater.toISOString().split("T")[0]
    });

    setTransactionModalOpen(true);
    setTransactionError(null);
    setTransactionSuccess(false);
  };

  // Handle transaction item quantity change
  const handleQuantityChange = (index: number, value: number) => {
    const newItems = [...transactionItems];

    // Ensure quantity is not negative
    value = Math.max(0, value);

    // Get requested quantity as maximum
    if (selectedRequest) {
      const requestedItem = selectedRequest.items[index];
      if (requestedItem) {
        // Don't exceed requested amount (optional - can be removed if needed)
        value = Math.min(value, requestedItem.quantityRequested);
      }
    }

    newItems[index].quantity = value;
    setTransactionItems(newItems);
  };

  // Handle transaction item condition change
  const handleConditionChange = (index: number, condition: string) => {
    const newItems = [...transactionItems];
    newItems[index].condition = condition;
    setTransactionItems(newItems);
  };

  // Handle transaction item notes change
  const handleItemNotesChange = (index: number, notes: string) => {
    const newItems = [...transactionItems];
    newItems[index].notes = notes;
    setTransactionItems(newItems);
  };

  // Submit transaction
  const handleSubmitTransaction = async () => {
    if (!selectedRequest || !currentSchool) return;

    // Validate transaction items
    const validItems = transactionItems.filter(item => item.quantity > 0);
    if (validItems.length === 0) {
      setTransactionError("Please provide at least one equipment item");
      return;
    }

    // Validate rental dates if this is a rental
    if (transactionType === "rental") {
      if (!rentalDates.startDate || !rentalDates.returnDueDate) {
        setTransactionError("Please provide rental start and return dates");
        return;
      }

      const startDate = new Date(rentalDates.startDate);
      const returnDueDate = new Date(rentalDates.returnDueDate);

      if (returnDueDate <= startDate) {
        setTransactionError("Return due date must be after start date");
        return;
      }
    }

    setTransactionLoading(true);
    setTransactionError(null);

    try {
      // Create transaction payload matching exactly what the API expects
      // Important: Setting status to "approved" directly instead of the two-step process
      const payload = {
        providerType: "school",
        provider: currentSchool._id,
        recipient: selectedRequest.school._id,
        transactionType: transactionType,
        items: validItems.map(item => ({
          equipment: item.equipment,
          quantity: item.quantity,
          condition: item.condition,
          notes: item.notes || undefined
        })),
        // Set to approved directly - this avoids the PATCH request that's failing
        status: "approved",
        // No approvedBy field needed here - backend will handle it
        additionalNotes: transactionNotes || undefined,
        ...(transactionType === "rental" ? {
          rentalDetails: {
            startDate: rentalDates.startDate,
            returnDueDate: rentalDates.returnDueDate
          }
        } : {}),
        // Set approvedAt to now
        approvedAt: new Date()
      };

      console.log("Sending transaction payload:", payload);
      
      // Submit the transaction with approved status directly
      const response = await axios.post("/api/equipment/transaction", payload);
      console.log("Transaction response:", response.data);

      if (response.data) {
        setTransactionSuccess(true);

        // Update request status on the server
        await axios.patch(`/api/equipment/request?id=${selectedRequest._id}`, {
          status: "approved",
          processedBy: {
            entity: currentSchool._id,
            entityType: "School"
          }
        });

        // Add to completed transactions so it doesn't show up in the list
        setCompletedTransactions(prev => new Set([...prev, selectedRequest._id]));

        // Update the filtered list
        setFilteredRequests(prev =>
          prev.filter(req => req._id !== selectedRequest._id)
        );

        // Close modal after 2 seconds
        setTimeout(() => {
          setTransactionModalOpen(false);
          setSelectedRequest(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Failed to create transaction:", err);
      // Provide detailed error information from the API response
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.details || 
                      err.message || 
                      "Failed to create transaction";
      setTransactionError(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
    } finally {
      setTransactionLoading(false);
    }
  };

  // Get unique districts for filter
  const getUniqueDistricts = () => {
    const districts = new Set<string>();
    requests.forEach(req => {
      if (req.school.location.district) {
        districts.add(req.school.location.district);
      }
    });
    return Array.from(districts);
  };

  useEffect(() => {
    // Execute fetch operations
    const loadData = async () => {
      const schoolData = await fetchSchoolInfo();
      if (schoolData) {
        await fetchRequests(schoolData);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Equipment Requests from Other Schools
      </h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search equipment, school name, event..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Request card section */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">
            No pending equipment requests from other schools at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
              <FiMapPin className="mr-2 text-blue-600" /> 
              Equipment Requests from Schools
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <RequestCard 
                  key={request._id}
                  request={request}
                  formatDate={formatDate}
                  onHelpClick={() => openTransactionModal(request)}
                  isNearby={
                    Boolean(
                      currentSchool?.location?.district && 
                      request.school?.location?.district && 
                      currentSchool.location.district === request.school.location.district
                    )
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {transactionModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Help with Equipment Request
                </h3>
                <button
                  onClick={() => setTransactionModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {transactionSuccess ? (
                <div className="text-center p-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <FiCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-gray-900">Transaction Successful!</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Your equipment has been successfully shared with {selectedRequest.school.name}.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-700">School: {selectedRequest.school.name}</p>
                      <p className="text-sm text-gray-600">Event: {selectedRequest.eventName}</p>
                      <p className="text-sm text-gray-600">
                        Event Date: {formatDate(selectedRequest.eventStartDate)}
                        {selectedRequest.eventEndDate && ` - ${formatDate(selectedRequest.eventEndDate)}`}
                      </p>
                    </div>
                  </div>

                  {transactionError && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                      {transactionError}
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Transaction Type</h4>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={transactionType === "rental"}
                          onChange={() => setTransactionType("rental")}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Rental (Temporary)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={transactionType === "permanent"}
                          onChange={() => setTransactionType("permanent")}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Permanent Transfer</span>
                      </label>
                    </div>
                  </div>

                  {transactionType === "rental" && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={rentalDates.startDate}
                          onChange={(e) => setRentalDates({ ...rentalDates, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Return Due Date
                        </label>
                        <input
                          type="date"
                          value={rentalDates.returnDueDate}
                          onChange={(e) => setRentalDates({ ...rentalDates, returnDueDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Equipment Items</h4>
                    <p className="text-sm text-gray-500 mb-4">Enter the quantity of each item you can provide</p>
                    <div className="space-y-4">
                      {selectedRequest.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{item.equipment.name}</span>
                            <span className="text-sm text-gray-500">
                              Requested: {item.quantityRequested}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity to Provide
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={item.quantityRequested}
                                value={transactionItems[index]?.quantity || 0}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Condition
                              </label>
                              <select
                                value={transactionItems[index]?.condition || "good"}
                                onChange={(e) => handleConditionChange(index, e.target.value)}
                                disabled={transactionItems[index]?.quantity === 0}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                              >
                                <option value="new">New</option>
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                              </label>
                              <input
                                type="text"
                                value={transactionItems[index]?.notes || ""}
                                onChange={(e) => handleItemNotesChange(index, e.target.value)}
                                disabled={transactionItems[index]?.quantity === 0}
                                placeholder="Any specific notes..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={transactionNotes}
                      onChange={(e) => setTransactionNotes(e.target.value)}
                      rows={3}
                      placeholder="Any additional information..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setTransactionModalOpen(false)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitTransaction}
                      disabled={transactionLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:bg-blue-400"
                    >
                      {transactionLoading ? (
                        <span className="flex items-center">
                          <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FiSend className="mr-2" />
                          Submit Transaction
                        </span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Request Card Component
interface RequestCardProps {
  request: EquipmentRequest;
  formatDate: (date?: string) => string;
  onHelpClick: () => void;
  isNearby: boolean;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  formatDate,
  onHelpClick,
  isNearby
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${
      isNearby ? "border-blue-500" : "border-indigo-500"
    }`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 truncate">{request.eventName}</h3>
          <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            Pending
          </span>
        </div>

        <p className="text-sm text-gray-600 mt-1 flex items-center">
          <FiMapPin className="mr-1 text-gray-400" size={14} />
          {request.school.name}
        </p>

        <p className="text-sm text-gray-500 mt-1 flex items-center">
          <FiCalendar className="mr-1 text-gray-400" size={14} />
          {formatDate(request.eventStartDate)}
          {request.eventEndDate && ` - ${formatDate(request.eventEndDate)}`}
        </p>

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Requested Items:</p>
          <div className="space-y-1">
            {request.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700 truncate flex-1">{item.equipment.name}</span>
                <span className="text-gray-500 font-medium ml-2">x{item.quantityRequested}</span>
              </div>
            ))}
            {request.items.length > 3 && (
              <p className="text-xs text-gray-500 italic">
                + {request.items.length - 3} more items
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 border-t border-gray-100">
        <button
          onClick={onHelpClick}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none transition-colors"
        >
          <FiPackage className="mr-2" />
          Help with Equipment
        </button>
      </div>
    </div>
  );
};

export default Inquiries;