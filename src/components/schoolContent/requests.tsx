import React from 'react'
import { FiBox, FiPlus } from "react-icons/fi";


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
  // Handler function for the button click
  const handleMakeRequest = () => {
    console.log("Make request button clicked");
    // Implement logic to open a form or modal for equipment requests
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
                      <button className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-[#6e11b0] text-sm font-medium rounded-md text-[#6e11b0] bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6e11b0]">
                        <FiPlus className="mr-2" /> Make a new request
                      </button>
                    </div>
                  </div>
                </div> {/* Closing tag for grid */}
              </div>
    </div>
  )
}

export default Requests