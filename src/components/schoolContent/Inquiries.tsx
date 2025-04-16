"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import EquipmentRequestHelpModal from "../modals/EquipmentRequestHelpModal";

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

const Inquiries: React.FC = () => {
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Function to open the modal with a specific request
  const openHelpModal = (requestId: string) => {
    setSelectedRequestId(requestId);
    setModalOpen(true);
  };

  // Function to fetch school information
  const fetchSchoolInfo = async () => {
    try {
      const response = await axios.get("/api/school/current");
      const schoolData = response.data.school;
      setCurrentSchool(schoolData);
      return schoolData;
    } catch (err: any) {
      console.error("Failed to fetch school info:", err);
      setError(`Failed to load school information: ${err.message || 'Unknown error'}`);
      return null;
    }
  };

  // Fetch equipment requests from nearby schools
  const fetchRequests = async (school: School) => {
    if (!school?.location?.district) {
      console.error('Cannot fetch equipment requests: School district is undefined');
      setError("School district information is missing");
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching equipment requests...');
      
      // Fetch equipment requests specifically for the same district
      const response = await axios.get("/api/equipment/request", {
        params: {
          status: "pending",
          district: school.location.district, // Add district parameter
          limit: 50
        }
      });

      console.log('Equipment requests response:', response.data);
      
      if (response.data && Array.isArray(response.data.equipmentRequests)) {
        // Filter out requests from the current school
        const districtRequests = response.data.equipmentRequests.filter(
          (req: EquipmentRequest) => {
            // Skip if missing data
            if (!req.school || !req.school._id) {
              console.warn('Skipping request with incomplete school data:', req._id);
              return false;
            }
            
            // Only include requests NOT from the current school
            return req.school._id !== school._id;
          }
        );
        
        console.log(`Found ${districtRequests.length} requests from schools in the same district`);
        setRequests(districtRequests);
      } else {
        console.error('Invalid equipment requests response format:', response.data);
        setError("Invalid response format from server");
      }
    } catch (err: any) {
      console.error("Failed to fetch equipment requests:", err);
      setError(`Failed to load equipment requests: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpSuccess = () => {
    setModalOpen(false);
    // Reload the requests after successful help
    if (currentSchool) fetchRequests(currentSchool);
  };

  useEffect(() => {
    // Execute fetch operations
    const loadData = async () => {
      const schoolData = await fetchSchoolInfo();
      if (schoolData) {
        fetchRequests(schoolData);
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
        Equipment Requests in Your Area
      </h2>
      
      {requests.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">
            No pending equipment requests from schools in your district at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div 
              key={request._id} 
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {request.eventName}
                  </h3>
                  <p className="text-gray-600">
                    School: {request.school.name} ({request.school.schoolId})
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Requested on: {formatDate(request.createdAt)}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 font-medium mb-2">Event Details:</p>
                <p className="text-gray-600">{request.eventDescription}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    Event Date: {formatDate(request.eventStartDate)}
                    {request.eventEndDate && ` - ${formatDate(request.eventEndDate)}`}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-700 font-medium mb-2">Requested Equipment:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Equipment
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {request.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                            {item.equipment.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                            {item.quantityRequested}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => openHelpModal(request._id)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium"
          >
            Help with this Request
          </button>
        </div>
      </div>
          ))}
        </div>
      )}
      
      {/* Modal for helping with equipment */}
      {selectedRequestId && (
        <EquipmentRequestHelpModal
          requestId={selectedRequestId}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleHelpSuccess}
        />
      )}
    </div>
  );
};

export default Inquiries;