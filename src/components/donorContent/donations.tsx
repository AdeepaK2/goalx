import React, { useState, useEffect } from "react";
import { FiBox, FiX, FiMail } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { HiOutlineAcademicCap } from "react-icons/hi";
import ContactSchoolModal from "./ContactSchoolModal";

// Football goal animation component
const GoalAnimation = () => {
  // Confetti pieces
  const confettiColors = ['#ff718d', '#fdff6a', '#ffcf4b', '#f0fff8', '#90d5ec', '#a6c1ee'];
  const confettiCount = 50;
  
  return (
    <div className="flex flex-col items-center justify-center py-8 relative">
      {/* Confetti elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: confettiCount }).map((_, i) => {
          const size = Math.random() * 10 + 5; // 5-15px
          const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
          const left = `${Math.random() * 100}%`;
          const animationDuration = `${Math.random() * 3 + 2}s`;
          const animationDelay = `${Math.random() * 0.5}s`;
          
          return (
            <div 
              key={i}
              className="absolute rounded-sm animate-confetti"
              style={{
                width: `${size}px`,
                height: `${size * 0.4}px`,
                backgroundColor: color,
                left: left,
                top: '-20px',
                animationDuration,
                animationDelay,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          );
        })}
      </div>
      
      {/* Bouncing football */}
      <div className="animate-bounce w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
        <div className="w-14 h-14 bg-gray-800 rounded-full relative">
          {/* Football pattern */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white"></div>
            <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-white/60"></div>
            <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-white/60"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white"></div>
            <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-white/60"></div>
            <div className="absolute left-3/4 top-0 bottom-0 w-[1px] bg-white/60"></div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-2xl font-bold text-green-600">GOAL!</p>
        <p className="text-lg text-green-500">Thank you for your donation!</p>
      </div>
    </div>
  );
};

interface DonorData {
    id: string;
    donorId: string;
    name: string;
    email: string;
    donorType: string;
}

// Update the DonationItem interface to include recipientId and schoolImageUrl
interface DonationItem {
    id: string;
    donationId: string;
    name: string;
    status: string;
    requestDate: string;
    donationType: 'MONETARY' | 'EQUIPMENT' | 'OTHER';
    amount?: number;
    currency?: string;
    itemName?: string;
    quantity?: number;
    purpose?: string;
    schoolName?: string;
    recipientId?: string; // Add this field for school contact
    schoolImageUrl?: string; // Add school image URL
}

interface DonationsProps {
    donorData: DonorData;
}

// Update the DonationForm component props
const DonationForm = ({ 
  onClose, 
  donorData, 
  preselectedSchool 
}: { 
  onClose: () => void, 
  donorData: DonorData, 
  preselectedSchool?: {id: string, name: string} | null 
}) => {
    const [donationType, setDonationType] = useState<'MONETARY' | 'EQUIPMENT' | 'OTHER'>('MONETARY');
    const [amount, setAmount] = useState<string>('');
    const [currency, setCurrency] = useState<string>('LKR');
    const [paymentMethod, setPaymentMethod] = useState<string>('CREDIT_CARD');
    const [itemName, setItemName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');
    const [school, setSchool] = useState<string>(preselectedSchool?.id || '');
    const [schools, setSchools] = useState<{id: string, name: string}[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    // Modify the useEffect to handle preselected schools
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await fetch('/api/school?limit=100');
                if (response.ok) {
                    const data = await response.json();
                    setSchools(data.schools.map((school: any) => ({
                        id: school._id,
                        name: school.name
                    })));
                }
            } catch (err) {
                console.error('Error fetching schools:', err);
            }
        };

        fetchSchools();
        
        // If preselectedSchool is provided, set it
        if (preselectedSchool?.id) {
            setSchool(preselectedSchool.id);
        }
    }, [preselectedSchool]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate form
            if (!school) {
                throw new Error('Please select a school');
            }

            if (donationType === 'MONETARY' && (!amount || parseFloat(amount) <= 0)) {
                throw new Error('Please enter a valid donation amount');
            }

            if ((donationType === 'EQUIPMENT' || donationType === 'OTHER') && !itemName) {
                throw new Error('Please enter an item name');
            }

            // Build donation payload
            const donationData: any = {
                donor: donorData.id,
                recipient: school,
                donationType,
                purpose: description || 'General donation',
                anonymous: false,
                status: 'completed' // Set status to completed immediately
            };

            // Add type-specific details
            if (donationType === 'MONETARY') {
                donationData.monetaryDetails = {
                    amount: parseFloat(amount),
                    currency,
                    paymentMethod
                };
            } else {
                donationData.itemDetails = [{
                    itemName,
                    description: description || undefined,
                    quantity: parseInt(quantity) || 1,
                    condition: 'good'
                }];
            }

            // Submit donation
            const response = await fetch('/api/donation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(donationData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create donation');
            }

            // Success
            setSuccess(true);
            setTimeout(() => {
                onClose();
                // Optionally refresh the donations list
                window.location.reload();
            }, 2000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto text-black">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Make a Donation</h2>
                <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiX size={24} />
                </button>
            </div>

            {success ? (
                <div className="bg-green-50 p-4 rounded-md mb-4 text-center">
                    <GoalAnimation />
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 p-3 rounded-md mb-4">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Donation Type
                        </label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio"
                                    name="donationType"
                                    value="MONETARY"
                                    checked={donationType === 'MONETARY'}
                                    onChange={() => setDonationType('MONETARY')}
                                />
                                <span className="ml-2">Money</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio"
                                    name="donationType"
                                    value="EQUIPMENT"
                                    checked={donationType === 'EQUIPMENT'}
                                    onChange={() => setDonationType('EQUIPMENT')}
                                />
                                <span className="ml-2">Equipment</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio"
                                    name="donationType"
                                    value="OTHER"
                                    checked={donationType === 'OTHER'}
                                    onChange={() => setDonationType('OTHER')}
                                />
                                <span className="ml-2">Other</span>
                            </label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select School
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            required
                        >
                            <option value="">Select a school</option>
                            {schools.map((school) => (
                                <option key={school.id} value={school.id}>
                                    {school.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {donationType === 'MONETARY' ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount (LKR)
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method
                                </label>
                                <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
                                    Credit Card
                                    <input 
                                        type="hidden" 
                                        name="paymentMethod" 
                                        value="CREDIT_CARD" 
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Only credit card payments are currently supported.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Item Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description/Purpose
                        </label>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Purpose of your donation"
                        ></textarea>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#6e11b0] hover:bg-[#5a0e91] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            {loading ? 'Submitting...' : 'Submit Donation'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

const Donations: React.FC<DonationsProps> = ({ donorData }) => {
    const [itemsRequestedData, setItemsRequestedData] = useState<DonationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDonationForm, setShowDonationForm] = useState(false);
    
    // New state for contact modal
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactSchool, setContactSchool] = useState<{
        name: string;
        email: string;
        donationDetails: string;
        imageUrl?: string; // Add imageUrl
    }>({ name: '', email: '', donationDetails: '' });
    
    // New function to handle contact button click
    const handleContactSchool = async (schoolId: string, schoolName: string, donationDetails: string, schoolImageUrl?: string) => {
        try {
            // Add console log to debug the school ID
            console.log("Fetching school with ID:", schoolId);
            
            // Fetch school email from API
            const response = await fetch(`/api/school?id=${schoolId}`);
            if (!response.ok) {
                throw new Error("Could not fetch school contact information");
            }
            
            const schoolData = await response.json();
            console.log("School data received:", schoolData); // Debug the response
            
            // Correctly extract email from the school data structure
            // The school schema has email inside the contact object
            const schoolEmail = schoolData.contact?.email;
            
            if (!schoolEmail) {
                alert("Sorry, no contact email is available for this school.");
                return;
            }
            
            // Get school image if available from API response or use passed value
            const imageUrl = schoolData.profileImageUrl || schoolImageUrl;
            
            // Set the school contact info and show modal
            setContactSchool({
                name: schoolName,
                email: schoolEmail,
                donationDetails: donationDetails,
                imageUrl: imageUrl
            });
            setShowContactModal(true);
        } catch (err) {
            console.error("Error fetching school contact:", err);
            alert("Could not retrieve school contact information. Please try again later.");
        }
    };

    useEffect(() => {
        const fetchDonationItems = async () => {
            try {
                // Modified API call to avoid population that's causing errors
                const response = await fetch(`/api/donation?donor=${donorData.id}`);
                
                if (!response.ok) {
                    // If server returns an error, try a more basic fetch approach
                    console.warn("Error from donation API, attempting fallback");
                    throw new Error(`Server error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Properly map donation data to the DonationItem format
                const mappedDonations = data.donations.map((donation: any) => {
                    let name = donation.purpose || 'General Donation';
                    
                    // For monetary donations, add amount info
                    if (donation.donationType === 'MONETARY' && donation.monetaryDetails) {
                        name = `${name} - ${donation.monetaryDetails.amount} ${donation.monetaryDetails.currency || 'LKR'}`;
                    } 
                    // For equipment/other donations, add item info
                    else if (donation.itemDetails && donation.itemDetails.length > 0) {
                        const itemInfo = donation.itemDetails[0];
                        name = `${itemInfo.itemName} (${itemInfo.quantity || 1} units)`;
                    }
                    
                    // Extract school name from populated recipient data
                    let schoolName = "Unknown School";
                    if (donation.recipient) {
                        if (typeof donation.recipient === 'object' && donation.recipient.name) {
                            schoolName = donation.recipient.name;
                        } else if (typeof donation.recipient === 'string') {
                            // When not populated, we still have the ID
                            schoolName = "School #" + donation.recipient.substring(0, 6);
                        }
                    }
                    
                    return {
                        id: donation._id,
                        donationId: donation.donationId || donation._id,
                        name: name,
                        status: donation.status || 'pending',
                        requestDate: new Date(donation.createdAt).toLocaleDateString(),
                        donationType: donation.donationType,
                        amount: donation.monetaryDetails?.amount,
                        currency: donation.monetaryDetails?.currency,
                        itemName: donation.itemDetails?.[0]?.itemName,
                        quantity: donation.itemDetails?.[0]?.quantity,
                        purpose: donation.purpose,
                        schoolName: schoolName, // Use the extracted school name
                        recipientId: donation.recipient?._id || donation.recipient, // Added recipientId
                        schoolImageUrl: donation.recipient?.imageUrl || '' // Added schoolImageUrl
                    };
                });
                
                setItemsRequestedData(mappedDonations || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching donation items:", err);
                setError("Unable to fetch donations. Please try again later.");
                
                // Try to fetch without populating relations as a fallback
                try {
                    const fallbackResponse = await fetch(`/api/donation?donor=${donorData.id}`, {
                        headers: {
                            'x-skip-populate': 'true'  // Add custom header to signal API to skip population
                        }
                    });
                    
                    if (fallbackResponse.ok) {
                        const data = await fallbackResponse.json();
                        const simpleMappedDonations = data.donations.map((donation: any) => ({
                            id: donation._id,
                            donationId: donation.donationId || donation._id,
                            name: donation.purpose || 'General Donation',
                            status: donation.status || 'pending',
                            requestDate: new Date(donation.createdAt).toLocaleDateString(),
                            donationType: donation.donationType,
                            amount: donation.monetaryDetails?.amount,
                            currency: donation.monetaryDetails?.currency,
                            itemName: donation.itemDetails?.[0]?.itemName,
                            quantity: donation.itemDetails?.[0]?.quantity,
                            purpose: donation.purpose,
                            schoolName: donation.schoolName, // Added schoolName
                            recipientId: donation.recipient?._id || donation.recipient, // Added recipientId
                            schoolImageUrl: donation.recipient?.imageUrl || '' // Added schoolImageUrl
                        }));
                        
                        setItemsRequestedData(simpleMappedDonations || []);
                        setError("Some donation details may be limited due to a system issue.");
                    }
                } catch (fallbackErr) {
                    console.error("Fallback fetch also failed:", fallbackErr);
                    // If all else fails, show at least an empty array
                    setItemsRequestedData([]);
                }
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
                {error && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FiBox className="mr-2 text-[#6e11b0]" /> Items Donated
                        </h2>
                        <button onClick={() => setShowDonationForm(true)}>
                            <span className="group bg-[#1e0fbf] hover:bg-[#6e11b0] text-white py-1 px-3 rounded-full text-sm font-medium inline-flex items-center ease-in-out duration-200 cursor-pointer">
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
                                        className="bg-gray-50 p-4 rounded-md flex flex-col"
                                    >
                                        <div className="flex flex-row">
                                            {/* Add school image */}
                                            <div className="mr-4 w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                                {item.schoolImageUrl ? (
                                                    <img 
                                                        src={item.schoolImageUrl} 
                                                        alt={item.schoolName || "School"} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                                                        <HiOutlineAcademicCap className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col flex-grow">
                                                <span className="text-gray-800 font-medium">{item.name}</span>
                                                <span className="text-gray-500 text-sm">
                                                    {item.donationType === 'MONETARY' ? 'Money Donation' : 
                                                     item.donationType === 'EQUIPMENT' ? 'Equipment Donation' : 'Other Donation'}
                                                </span>
                                                <span className="text-gray-600 text-sm font-medium">
                                                    School: {item.schoolName || "Unknown School"}
                                                </span>
                                                <span className="text-gray-500 text-sm">Date: {item.requestDate}</span>
                                            </div>
                                            
                                            <div className="flex flex-col justify-center space-y-2 ml-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium text-center
                                                    ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                     item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                     item.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                     'bg-red-100 text-red-800'}`}>
                                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                </span>
                                                
                                                {/* Update the contact school button to pass the image URL */}
                                                <button
                                                    onClick={() => handleContactSchool(
                                                        item.recipientId || '', 
                                                        item.schoolName || 'School', 
                                                        item.name,
                                                        item.schoolImageUrl
                                                    )}
                                                    className="flex items-center px-3 py-1 text-sm bg-[#1e0fbf] text-white rounded-md hover:bg-[#6e11b0] transition-colors"
                                                >
                                                    <FiMail className="mr-1" /> Contact School
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 mb-4">No donation items found.</p>
                                <button 
                                    onClick={() => setShowDonationForm(true)}
                                    className="bg-[#6e11b0] hover:bg-[#5a0e91] text-white px-4 py-2 rounded-md transition-colors"
                                >
                                    Make Your First Donation
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Donation Form Modal Overlay */}
            {showDonationForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <DonationForm 
                        onClose={() => setShowDonationForm(false)} 
                        donorData={donorData} 
                    />
                </div>
            )}
            
            {/* New Contact School Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <ContactSchoolModal 
                        schoolName={contactSchool.name}
                        schoolEmail={contactSchool.email}
                        donationDetails={contactSchool.donationDetails}
                        schoolImageUrl={contactSchool.imageUrl}
                        onClose={() => setShowContactModal(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default Donations;
export { DonationForm };