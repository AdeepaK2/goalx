import React, { useState } from 'react'
import { FiBox, FiPlus, FiX } from "react-icons/fi";

const itemsRequestedData = [
  {
    id: 1,
    name: "Basketball Set",
    status: "Processing",
    requestDate: "2025-04-01",
  },
  {
    id: 2,
    name: "Athletic Cones (x20)",
    status: "Pending Approval",
    requestDate: "2025-04-03",
  },
  {
    id: 3,
    name: "First Aid Kit",
    status: "Approved",
    requestDate: "2025-03-25",
  },
  {
    id: 4,
    name: "Stopwatches (x5)",
    status: "Denied",
    requestDate: "2025-03-20",
  },
];

const Requests = () => {
  // State for modal visibility and form data
  const [showModal, setShowModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: "",
    quantity: "",
    reason: "",
    specialization: "",
  });
  
  // Handler function for the button click
  const handleMakeRequest = () => {
    setShowModal(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequestForm({
      ...requestForm,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", requestForm);
    // Here you would typically send this data to your API
    // Reset form and close modal
    setRequestForm({ name: "", quantity: "", reason: "", specialization: "" });
    setShowModal(false);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setRequestForm({ name: "", quantity: "", reason: "", specialization: "" });
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
                    Sharing is caring! Request any equipment you need for your school and
                    we will do our best to fulfill your request.
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
                      <div className="space-y-4">
                        {itemsRequestedData.map((item) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 p-3 rounded-md flex justify-between"
                          >
                            <span className="text-gray-700">{item.name}</span>
                            <span className="text-[#6e11b0] text-sm">
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div> {/* Closing tag for grid */}
              </div>
      
      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-0">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Request Equipment</h3>
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
                <label htmlFor="name" className="block text-sm font-medium text-[#1e0fbf]">
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
                <label htmlFor="specialization" className="block text-sm font-medium text-[#1e0fbf]">
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
                <label htmlFor="quantity" className="block text-sm font-medium text-[#1e0fbf]">
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
                <label htmlFor="reason" className="block text-sm font-medium text-[#1e0fbf]">
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
                className="px-4 py-2 bg-[#1e0fbf] text-white text-sm font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out"
              >
                Submit Request
              </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Requests
