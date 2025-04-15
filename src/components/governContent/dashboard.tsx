import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { FiPlus, FiAward, FiBox, FiCheckCircle, FiCalendar, FiBarChart2, FiGrid, FiX, FiAlertCircle } from "react-icons/fi";
import Image from "next/image";
import { format } from "date-fns";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

interface Sport {
    _id: string;
    sportId: string;
    sportName: string;
    description?: string;
}

interface Equipment {
    _id: string;
    equipmentId: string;
    name: string;
    sport: string;
    description?: string;
    quantity?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, donorData }) => {
    const [loading, setLoading] = useState(true);
    const [donorLoading, setDonorLoading] = useState(true);
    const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
    const [schoolAchievements, setSchoolAchievements] = useState<Achievement[]>([]);
    const [error, setError] = useState("");
    const [donorInfo, setDonorInfo] = useState({ totalDonated: "0" });
    
    // Sport and equipment data
    const [sports, setSports] = useState<Sport[]>([]);
    const [equipmentCount, setEquipmentCount] = useState<{[key: string]: number}>({});
    const [sportsLoading, setSportsLoading] = useState(true);
    
    // Equipment form state
    const [showEquipmentForm, setShowEquipmentForm] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        name: '',
        sport: '',
        description: '',
        quantity: 1
    });
    const [equipmentSubmitting, setEquipmentSubmitting] = useState(false);
    const [equipmentFormError, setEquipmentFormError] = useState('');
    const [equipmentFormSuccess, setEquipmentFormSuccess] = useState('');

    // Fetch governing body's specialized sports
    useEffect(() => {
        const fetchSports = async () => {
            try {
                setSportsLoading(true);
                setLoading(true);
                
                // Fetch governing body details to get their specialized sports
                const govResponse = await fetch(`/api/govern?id=${donorData?.donorId}`);
                
                if (!govResponse.ok) {
                    throw new Error('Failed to fetch governing body data');
                }
                
                const govData = await govResponse.json();
                const sportIds = govData.specializedSports || [];
                
                // Fetch details for each sport
                const sportPromises = sportIds.map((sportId: string) => 
                    fetch(`/api/sport?id=${sportId}`)
                    .then(res => res.ok ? res.json() : null)
                );
                
                const sportResults = await Promise.all(sportPromises);
                const validSports = sportResults.filter(Boolean);
                setSports(validSports);
                
                // Fetch equipment count for each sport
                const countPromises = validSports.map((sport: Sport) => 
                    fetch(`/api/equipment?sport=${sport._id}`)
                    .then(res => res.ok ? res.json() : null)
                    .then(data => ({
                        sportId: sport._id,
                        sportName: sport.sportName,
                        count: data?.equipment?.length || 0
                    }))
                );
                
                const countResults = await Promise.all(countPromises);
                const countMap: {[key: string]: number} = {};
                
                countResults.forEach((result: {sportId: string, sportName: string, count: number}) => {
                    countMap[result.sportName] = result.count;
                });
                
                setEquipmentCount(countMap);
                
            } catch (err) {
                console.error('Error fetching sports data:', err);
            } finally {
                setSportsLoading(false);
                setLoading(false);
            }
        };
        
        if (donorData?.id) {
            fetchSports();
        } else {
            setLoading(false);
        }
    }, [donorData?.id, donorData?.donorId]);

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
    
    // Handle equipment form changes
    const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewEquipment(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Submit new equipment
    const handleEquipmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEquipmentFormError('');
        setEquipmentFormSuccess('');
        setEquipmentSubmitting(true);
        
        try {
            if (!newEquipment.name || !newEquipment.sport) {
                throw new Error('Equipment name and sport are required');
            }
            
            const response = await fetch('/api/equipment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newEquipment)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add equipment');
            }
            
            // Success! Clear form and show success message
            setNewEquipment({
                name: '',
                sport: '',
                description: '',
                quantity: 1
            });
            
            setEquipmentFormSuccess('Equipment added successfully!');
            
            // Refresh equipment counts
            const sportName = sports.find(s => s._id === newEquipment.sport)?.sportName || '';
            if (sportName) {
                setEquipmentCount(prev => ({
                    ...prev,
                    [sportName]: (prev[sportName] || 0) + 1
                }));
            }
            
            // Close form after 2 seconds
            setTimeout(() => {
                setShowEquipmentForm(false);
                setEquipmentFormSuccess('');
            }, 2000);
            
        } catch (err) {
            console.error('Error adding equipment:', err);
            setEquipmentFormError(err instanceof Error ? err.message : 'Failed to add equipment');
        } finally {
            setEquipmentSubmitting(false);
        }
    };
    
    // Prepare chart data
    const pieChartData = {
        labels: Object.keys(equipmentCount),
        datasets: [
            {
                label: 'Equipment Count',
                data: Object.values(equipmentCount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };
    
    const barChartData = {
        labels: Object.keys(equipmentCount),
        datasets: [
            {
                label: 'Equipment by Sport',
                data: Object.values(equipmentCount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-20">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
                        Welcome to GoalX
                    </h1>
                    <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
                        Sports Governing Body Dashboard
                    </p>
                </div>
            </div>

            {/* Dashboard Summary with Charts */}
            <div className="max-w-7xl mx-auto px-4 py-8 -mt-10">
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="bg-indigo-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white flex items-center">
                            <FiBarChart2 className="mr-2" /> Equipment Summary by Sport
                        </h2>
                    </div>

                    <div className="p-6">
                        {sportsLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                            </div>
                        ) : sports.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Distribution</h3>
                                    <div className="h-64">
                                        <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Count by Sport</h3>
                                    <div className="h-64">
                                        <Bar 
                                            data={barChartData} 
                                            options={{ 
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No sports data available.</p>
                            </div>
                        )}
                        
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowEquipmentForm(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FiPlus className="mr-2" /> Add New Equipment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Equipment Form Modal */}
            {showEquipmentForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Add New Equipment</h2>
                            <button 
                                onClick={() => setShowEquipmentForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        
                        {equipmentFormError && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <FiAlertCircle className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{equipmentFormError}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {equipmentFormSuccess && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <FiCheckCircle className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700">{equipmentFormSuccess}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <form onSubmit={handleEquipmentSubmit}>
                            <div className="mb-4">
                                <label htmlFor="sport" className="block text-sm font-medium text-gray-700">
                                    Sport
                                </label>
                                <select
                                    id="sport"
                                    name="sport"
                                    value={newEquipment.sport}
                                    onChange={handleEquipmentChange}
                                    required
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="">-- Select Sport --</option>
                                    {sports.map(sport => (
                                        <option key={sport._id} value={sport._id}>
                                            {sport.sportName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Equipment Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newEquipment.name}
                                    onChange={handleEquipmentChange}
                                    required
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={newEquipment.description}
                                    onChange={handleEquipmentChange}
                                    rows={3}
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                            
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowEquipmentForm(false)}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={equipmentSubmitting}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {equipmentSubmitting ? 'Adding...' : 'Add Equipment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
