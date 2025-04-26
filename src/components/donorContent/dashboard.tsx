import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { FiPlus, FiAward, FiBox, FiCheckCircle, FiCalendar } from "react-icons/fi";
import Image from "next/image";
import { format } from "date-fns";

// Update props type to accept donorData (or null)
interface DashboardProps {
    setActiveTab: (tab: string) => void;
    donorData: {
        id: string;
        donorId: string;
        name: string;
        email: string;
        donorType: string;
    } | null;
}

// Types for API responses
interface Donation {
    _id: string;
    donationId: string;
    donationType: "MONETARY" | "EQUIPMENT" | "OTHER";
    recipient: {
        _id: string;
        name: string;
        schoolId: string;
    };
    monetaryDetails?: {
        amount: number;
        currency: string;
    };
    itemDetails?: {
        itemName: string;
        quantity: number;
    }[];
    status: string;
    createdAt: string;
}

interface Achievement {
    _id: string;
    achievementId: string;
    title: string;
    year: number;
    level: string;
    play: {
        school: {
            name: string;
            schoolId: string;
        };
        sport: {
            sportName: string;
        };
    };
    position?: string;
    createdAt: string;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, donorData }) => {
    const [loading, setLoading] = useState(true);
    const [donorLoading, setDonorLoading] = useState(true);
    const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
    const [schoolAchievements, setSchoolAchievements] = useState<Achievement[]>([]);
    const [error, setError] = useState("");
    const [donorInfo, setDonorInfo] = useState({ totalDonated: "0" });

    const fetchDonorInfo = async () => {
        if (!donorData?.id) {
            setDonorLoading(false);
            return;
        }
        try {
            setDonorLoading(true);
            
            // First get donor info
            const response = await fetch(`/api/donor?id=${donorData.id}`);
            if (!response.ok) throw new Error("Failed to fetch donor information");
            const data = await response.json();
            
            // Then fetch all donations to calculate total
            const donationsResponse = await fetch(`/api/donation?donor=${donorData.id}&limit=100`);
            let totalAmount = 0;
            let hasMonetaryDonations = false;
            
            if (donationsResponse.ok) {
                const donationsData = await donationsResponse.json();
                if (donationsData && donationsData.donations && donationsData.donations.length > 0) {
                    hasMonetaryDonations = true;
                    // Calculate total from monetary donations
                    totalAmount = donationsData.donations.reduce((sum: number, donation: Donation) => {
                        if (donation.donationType === "MONETARY" && donation.monetaryDetails?.amount) {
                            return sum + donation.monetaryDetails.amount;
                        }
                        return sum;
                    }, 0);
                }
            }
            
            setDonorInfo({
                totalDonated: hasMonetaryDonations ? totalAmount.toLocaleString() : "0"
            });
        } catch (err) {
            console.error("Error fetching donor information:", err);
            setDonorInfo({ totalDonated: "0" });
        } finally {
            setDonorLoading(false);
        }
    };

    const fetchSchoolAchievements = async (schoolIds: string[]) => {
        try {
            const playsResponse = await fetch(`/api/play?schools=${schoolIds.join(",")}`);
            if (!playsResponse.ok) {
                setLoading(false);
                return;
            }
            const playsData = await playsResponse.json();
            if (!playsData || !playsData.plays || playsData.plays.length === 0) {
                setLoading(false);
                return;
            }
            const playIds = playsData.plays.map((play: any) => play._id);

            const achievementsPromises = playIds.map(async (playId: string) => {
                const response = await fetch(`/api/achievement?play=${playId}&limit=3`);
                if (response.ok) {
                    const achData = await response.json();
                    return achData.achievements || [];
                }
                return [];
            });
            const achievementsArr = await Promise.all(achievementsPromises);
            const achievements = achievementsArr.flat();
            const sortedAchievements = achievements
                .sort((a: Achievement, b: Achievement) => b.year - a.year)
                .slice(0, 5);
            setSchoolAchievements(sortedAchievements);
        } catch (err) {
            console.error("Error fetching school achievements:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentDonations = async () => {
        try {
            if (!donorData?.id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            const response = await fetch(`/api/donation?donor=${donorData.id}&limit=5`);
            if (!response.ok) throw new Error("Failed to fetch recent donations");
            const data = await response.json();
            if (data && data.donations) {
                setRecentDonations(data.donations);
                if (data.donations.length > 0) {
                    const schoolIds: string[] = data.donations
                        .map((donation: Donation) => donation.recipient?._id)
                        .filter((id: string | undefined | null): id is string => Boolean(id));
                    if (schoolIds.length > 0) {
                        await fetchSchoolAchievements(schoolIds);
                        return; // fetchSchoolAchievements will setLoading(false)
                    }
                }
            }
        } catch (err) {
            console.error("Error fetching recent donations:", err);
            setError("Failed to load recent donations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (donorData) {
            Promise.all([fetchDonorInfo(), fetchRecentDonations()]);
        } else {
            setLoading(false);
            setDonorLoading(false);
        }
    }, [donorData]);

    const formatDonationValue = (donation: Donation) => {
        if (donation.donationType === "MONETARY" && donation.monetaryDetails) {
            return `${donation.monetaryDetails.currency} ${donation.monetaryDetails.amount.toLocaleString()}`;
        } else if (donation.itemDetails && donation.itemDetails.length > 0) {
            return `${donation.itemDetails.length} items`;
        }
        return "N/A";
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
                        Welcome to GoalX
                    </h1>
                    <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
                        We value your continued support to school sports.
                    </p>
                    <p className="text-white text-3xl mt-4 text-center max-w-2xl mx-auto">
                        {donorLoading ? (
                            <span className="inline-block w-32 h-10 bg-white/30 animate-pulse rounded"></span>
                        ) : donorInfo.totalDonated !== "0" ? (
                            <>
                                You have donated{" "}
                                <span className="text-5xl">Rs {donorInfo.totalDonated}</span> worth of equipment to Sri Lankan School Sports!
                            </>
                        ) : (
                            <>
                                Make your first donation today and help Sri Lankan schools achieve sporting excellence!
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Recent Donations Section */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="bg-indigo-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                            <FiBox className="mr-2" /> Your Recent Donations
                        </h2>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-center py-4">{error}</div>
                        ) : recentDonations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recentDonations.map((donation) => (
                                            <tr key={donation._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(donation.createdAt), "MMM d, yyyy")}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{donation.recipient.name}</div>
                                                    <div className="text-xs text-gray-500">{donation.recipient.schoolId}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        donation.donationType === "MONETARY"
                                                            ? "bg-green-100 text-green-800"
                                                            : donation.donationType === "EQUIPMENT"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                        {donation.donationType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDonationValue(donation)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        donation.status === "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : donation.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : donation.status === "processing"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}>
                                                        {donation.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">You haven't made any donations yet.</p>
                                <button
                                    onClick={() => setActiveTab("donations")}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <FiPlus className="mr-2" /> Make Your First Donation
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* School Achievements Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-purple-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                            <FiAward className="mr-2" /> Recent Achievements from Schools You Support
                        </h2>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
                            </div>
                        ) : schoolAchievements.length > 0 ? (
                            <div className="space-y-6">
                                {schoolAchievements.map((achievement) => (
                                    <div key={achievement._id} className="flex border-l-4 border-purple-500 pl-4 py-2">
                                        <div className="flex-shrink-0 mr-4">
                                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                                <FiAward className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{achievement.title}</h3>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span className="text-sm text-gray-500">
                                                    {achievement.play.school.name} • {achievement.play.sport.sportName}
                                                </span>
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    {achievement.level} Level
                                                </span>
                                                {achievement.position && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        {achievement.position}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 text-sm text-gray-500 flex items-center">
                                                <FiCalendar className="mr-1" /> {achievement.year}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentDonations.length > 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No recent achievements from the schools you've supported.</p>
                                <p className="text-gray-500 mt-2">Check back later for updates or contact the schools directly.</p>
                                <button
                                    onClick={() => setActiveTab("contact")}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Contact Schools
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 space-y-4">
                                <p className="text-gray-500">Once you make donations, you'll see achievements from the schools you support.</p>
                                <p className="text-gray-500">Your contributions help make these achievements possible!</p>
                                <button
                                    onClick={() => setActiveTab("requests")}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    <FiAward className="mr-2" /> Explore School Achievements
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Info If No Activity */}
                {!loading && recentDonations.length === 0 && (
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FiCheckCircle className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-lg font-medium text-blue-900">Ready to make an impact?</h3>
                                <p className="mt-1 text-sm text-blue-700">
                                    Your donations directly fund sporting equipment, facilities, and opportunities for Sri Lankan school children. 
                                    Even small contributions can make a huge difference!
                                </p>
                                <div className="mt-3 flex space-x-3">
                                    <button
                                        onClick={() => setActiveTab("donations")}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Make a Donation
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("schools")}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Browse Schools
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
