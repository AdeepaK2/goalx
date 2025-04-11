import React, { useState, useEffect } from "react";
import { FiBox } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";

interface DonorData {
    id: string;
    donorId: string;
    name: string;
    email: string;
    donorType: string;
}

interface DonationItem {
    id: number;
    name: string;
    status: string;
    requestDate: string;
}

interface DonationsProps {
    donorData: DonorData;
}

const Donations: React.FC<DonationsProps> = ({ donorData }) => {
    const [itemsRequestedData, setItemsRequestedData] = useState<DonationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonationItems = async () => {
            try {
                const response = await fetch(`/api/donations?donorId=${donorData.id}`);
                if (response.ok) {
                    const data = await response.json();
                    // Expecting data.items to be an array of donation items
                    setItemsRequestedData(data.items || []);
                } else {
                    setItemsRequestedData([]);
                }
            } catch (err) {
                console.error("Error fetching donation items:", err);
                setItemsRequestedData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDonationItems();
    }, [donorData.id]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <p>Loading donations...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
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
                        {itemsRequestedData.length > 0 ? (
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
                        ) : (
                            <p className="text-center text-gray-500">No donation items found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Donations;