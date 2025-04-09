import React from 'react'
import { FiBox } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";

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


const requests = () => {
  return (
          <div>
              {/* Hero Section - Keeping the gradient as it already uses the correct colors */}
              <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
                  <div className="max-w-5xl mx-auto">
                      <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
                          Welcome to GoalX
                      </h1>
                      <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
                          We value your continued support to school sports.
                      </p>
                          
                  </div>
              </div>
  
              {/* Dashboard Cards Container */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 space-y-6">
                  
  
                  {/* Items Request Card */}
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                      <div className="p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                              <FiBox className="mr-2 text-[#6e11b0]" /> Items Requested
                          </h2>
                          
                      </div>
                      <div className="p-5">
                          <div className="space-y-4">
                              {itemsRequestedData.map((item) => (
                                  <div
                                      key={item.id}
                                      className="bg-gray-50 p-3 rounded-md flex items-center justify-between"
                                  >
                                      <span className="text-gray-700">{item.name}</span>
                                      <div className="flex items-center">                                    
                                          <button className="bg-[#6e11b0] hover:bg-[#5a0e91] text-white py-1 px-3 rounded-md text-sm font-medium">
                                              Donate
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                    
                      </div>
                  </div>
              </div>
              
          </div>
      );
}

export default requests