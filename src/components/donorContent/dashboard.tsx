import React from "react";
import { FaPlus } from "react-icons/fa";
import { FiPlus, FiAward, FiBox, FiCheckCircle } from "react-icons/fi";

// Define props type
interface DashboardProps {
    setActiveTab: (tab: string) => void;
}

// Add setActiveTab to the component props
const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
    // Sample data for requested items
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

    


    const donorDetails = [
        {totalAmt: "10.4k",}
    ];

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
                        <p className="text-white text-3xl mt-4 text-center max-w-2xl mx-auto">
                                You have donated <span className="text-5xl">${donorDetails[0].totalAmt}</span> worth of equipment to Sri Lankan School Sports!
                        </p>
                </div>
            </div>

            {/* Dashboard Cards Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 space-y-6">
                {/* Items Donated Card */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FiBox className="mr-2 text-[#6e11b0]" /> Items Donated
                        </h2>
                        <button>
                        <span className="group bg-[#1e0fbf] hover:bg-[#6e11b0] bg-opacity-20 text-white py-1 px-3 rounded-full text-sm font-medium inline-flex items-center ease-in-out duration-200 cursor-pointer">
                            <FaPlus className="mr-1 transition-transform duration-200 ease-in-out group-hover:rotate-90" /> Make Custom Donations
                        </span>
                        </button>
                    </div>
                    <div className="p-5">
                        <div className="space-y-4">
                            {itemsRequestedData.slice(0, 2).map((item) => (
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
                        <button
                            onClick={() => setActiveTab("donations")}
                            className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-[#6e11b0] text-sm font-medium rounded-md text-[#6e11b0] bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6e11b0]"
                        >
                            View all Donations
                        </button>
                    </div>
                </div>

                {/* Items Request Card */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FiBox className="mr-2 text-[#6e11b0]" /> Items Requested
                        </h2>
                        
                    </div>
                    <div className="p-5">
                        <div className="space-y-4">
                            {itemsRequestedData.slice(0, 2).map((item) => (
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
                        <button
                            onClick={() => setActiveTab("requests")}
                            className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-[#6e11b0] text-sm font-medium rounded-md text-[#6e11b0] bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6e11b0]"
                        >
                            View all Requests
                        </button>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default Dashboard;
