"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

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
  };
}

interface RequestItem {
  _id: string;
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
}

interface HelpItem {
  equipment: string;
  quantity: number;
  condition: string;
  notes: string;
}

const EquipmentRequestDetails = () => {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<EquipmentRequest | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [transactionType, setTransactionType] = useState<"rental" | "permanent">("rental");
  const [helpItems, setHelpItems] = useState<HelpItem[]>([]);
  const [startDate, setStartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current school
        const schoolResponse = await axios.get('/api/auth/school/me');
        if (!schoolResponse.data?.school?.id) {
          throw new Error('Failed to fetch your school information');
        }
        const fullSchoolResponse = await axios.get(`/api/school?id=${schoolResponse.data.school.id}`);
        setCurrentSchool(fullSchoolResponse.data);
        
        // Fetch equipment request details
        const requestResponse = await axios.get(`/api/equipment/request?id=${requestId}`);
        const requestData = requestResponse.data;
        setRequest(requestData);
        
        // Initialize help items based on requested items
        if (requestData && Array.isArray(requestData.items)) {
          setHelpItems(requestData.items.map((item: RequestItem) => ({
            equipment: item.equipment._id,
            quantity: 0, // Default to 0
            condition: "good", // Default condition
            notes: ""
          })));
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load request details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestId]);

  const updateHelpItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...helpItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: Math.max(0, quantity) // Ensure quantity is not negative
    };
    setHelpItems(updatedItems);
  };

  const updateHelpItemCondition = (index: number, condition: string) => {
    const updatedItems = [...helpItems];
    updatedItems[index] = {
      ...updatedItems[index],
      condition
    };
    setHelpItems(updatedItems);
  };

  const updateHelpItemNotes = (index: number, notes: string) => {
    const updatedItems = [...helpItems];
    updatedItems[index] = {
      ...updatedItems[index],
      notes
    };
    setHelpItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (transactionType === "rental" && (!startDate || !returnDate)) {
      toast.error("Start date and return date are required for rentals");
      return;
    }
    
    // Validate at least one item has a quantity
    const hasItems = helpItems.some(item => item.quantity > 0);
    if (!hasItems) {
      toast.error("Please specify at least one item and quantity to provide");
      return;
    }

    // For rental, ensure valid dates
    if (transactionType === "rental") {
      const start = new Date(startDate);
      const end = new Date(returnDate);
      if (end <= start) {
        toast.error("Return date must be after start date");
        return;
      }
    }

    try {
      setSubmitting(true);
      
      // Create transaction payload
      const transactionData = {
        providerType: "school",
        provider: currentSchool?._id,
        recipient: request?.school._id,
        transactionType,
        items: helpItems.filter(item => item.quantity > 0).map(item => ({
          equipment: item.equipment,
          quantity: item.quantity,
          condition: item.condition,
          notes: item.notes
        })),
        rentalDetails: transactionType === "rental" ? {
          startDate,
          returnDueDate: returnDate
        } : undefined,
        additionalNotes
      };
      
      // Submit transaction
      const response = await axios.post("/api/equipment/transaction", transactionData);
      
      toast.success("Your help offer has been submitted successfully!");
      router.push("/schools/dashboard");
    } catch (err: any) {
      console.error("Error creating transaction:", err);
      toast.error(err.response?.data?.error || "Failed to submit help offer");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-700">
          Equipment request not found
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{request.eventName}</h1>
        <p className="text-gray-600 mt-2">
          Request from {request.school.name} ({request.school.schoolId})
        </p>
      </div>

      {/* Request Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Details</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Event Description:</p>
          <p className="text-gray-800">{request.eventDescription}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Event Date:</p>
            <p className="text-gray-800">
              {formatDate(request.eventStartDate)} 
              {request.eventEndDate && ` - ${formatDate(request.eventEndDate)}`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Request Date:</p>
            <p className="text-gray-800">{formatDate(request.createdAt)}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Requested Equipment</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {request.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 text-sm text-gray-900">
                      {item.equipment.name} ({item.equipment.equipmentId})
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-900">
                      {item.quantityRequested}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-500">
                      {item.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Help Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Offer Help</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Transaction Type */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Transaction Type
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="transactionType"
                  value="rental"
                  checked={transactionType === "rental"}
                  onChange={() => setTransactionType("rental")}
                />
                <span className="ml-2 text-gray-700">Rental</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="transactionType"
                  value="permanent"
                  checked={transactionType === "permanent"}
                  onChange={() => setTransactionType("permanent")}
                />
                <span className="ml-2 text-gray-700">Permanent Transfer</span>
              </label>
            </div>
          </div>

          {/* Rental Dates (conditional) */}
          {transactionType === "rental" && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Return Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Equipment Items */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Equipment to Provide</h3>
            <div className="space-y-4">
              {request.items.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {item.equipment.name} ({item.equipment.equipmentId})
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested: {item.quantityRequested}
                      </p>
                    </div>
                    
                    <div className="w-full md:w-24">
                      <label className="block text-gray-700 text-xs font-medium mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantityRequested}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={helpItems[index]?.quantity || 0}
                        onChange={(e) => updateHelpItemQuantity(index, parseInt(e.target.value, 10) || 0)}
                      />
                    </div>
                    
                    <div className="w-full md:w-36">
                      <label className="block text-gray-700 text-xs font-medium mb-1">
                        Condition
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={helpItems[index]?.condition || "good"}
                        onChange={(e) => updateHelpItemCondition(index, e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>
                  
                  {helpItems[index]?.quantity > 0 && (
                    <div className="mt-3">
                      <label className="block text-gray-700 text-xs font-medium mb-1">
                        Notes (optional)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={helpItems[index]?.notes || ""}
                        onChange={(e) => updateHelpItemNotes(index, e.target.value)}
                        placeholder="Additional details about the equipment"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Additional Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional information or terms for this equipment"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Help Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentRequestDetails;