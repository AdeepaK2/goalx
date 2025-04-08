import React from "react";
import { FiCheckCircle, FiMinus } from "react-icons/fi";

const itemsBorrowedData = [
  {
    id: 1,
    name: "Soccer Balls (x5)",
    dueDate: "2025-04-15",
    borrowedDate: "2025-04-01",
  },
  {
    id: 2,
    name: "Volleyball Net",
    dueDate: "2025-04-20",
    borrowedDate: "2025-04-05",
  },
  {
    id: 3,
    name: "Badminton Rackets (x10)",
    dueDate: "2025-04-22",
    borrowedDate: "2025-04-08",
  },
  {
    id: 4,
    name: "Tennis Balls (x30)",
    dueDate: "2025-04-25",
    borrowedDate: "2025-04-10",
  },
];

const Borrowals = () => {
  // Handler function for the return button click
  const handleReturnEquipment = (itemId: number) => {
    console.log(`Return equipment button clicked for item ID: ${itemId}`);
    // Implement logic to handle the return of the specific equipment item
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Equipment Borrowals of your School
          </h1>
          <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
            Keep track of the equipment borrowed by your school. Ensure timely
            returns to maintain a good relationship with our partners.
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 gap-6">
          {/* Items Borrowed Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiCheckCircle className="mr-2 text-[#1e0fbf]" /> Items Borrowed
              </h2>
              {/* Removed the single button from here */}
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {itemsBorrowedData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 p-3 rounded-md flex justify-between items-center space-x-4" // Added space-x-4 for spacing
                  >
                    <span className="text-gray-700 flex-1 min-w-0">
                      {item.name}
                    </span>
                    <span className="text-[#6e11b0] text-sm text-right w-28 flex-shrink-0">
                      Received {item.borrowedDate.substring(5)}
                    </span>
                    <span className="text-[#1e0fbf] text-sm text-right w-28 flex-shrink-0">
                      Due {item.dueDate.substring(5)}
                    </span>
                    <button
                      onClick={() => handleReturnEquipment(item.id)} // Pass item.id to handler
                      className="flex items-center px-3 py-1 bg-[#1e0fbf] text-white text-xs font-medium rounded-md hover:bg-[#6e11b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] transition duration-150 ease-in-out flex-shrink-0" // Adjusted padding and text size
                    >
                      <FiMinus className="mr-1 h-3 w-3" /> Return{" "}
                      {/* Adjusted icon size */}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Borrowals;
