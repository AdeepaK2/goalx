import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiLoader, FiMail } from "react-icons/fi";

interface DonationItem {
  _id: string;
  donationId: string;
  donationType: string;
  status: string;
  donor: {
    displayName: string;
    email?: string; // Added email field to the interface
  };
  itemDetails?: Array<{
    itemName: string;
    quantity: number;
    condition?: string;
  }>;
  monetaryDetails?: {
    amount: number;
    currency: string;
  };
  createdAt: string;
}

const Donations = () => {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setIsLoading(true);
        
        // Get the school ID from the current user session
        const response = await fetch("/api/auth/school/me");
        const schoolData = await response.json();
        
        if (!schoolData.success || !schoolData.school?.id) {
          throw new Error("Could not retrieve school information");
        }
        
        // Use the school ID to fetch donations
        const donationsResponse = await fetch(`/api/donation?recipient=${schoolData.school.id}&status=completed`);
        const donationsData = await donationsResponse.json();
        
        if (donationsData.donations) {
          setDonations(donationsData.donations);
        } else {
          throw new Error("Could not retrieve donations data");
        }
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError("Failed to load donations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // Format donation item for display
  const formatDonationItem = (donation: DonationItem) => {
    if (donation.donationType === "MONETARY") {
      return `${donation.monetaryDetails?.amount || 0} ${donation.monetaryDetails?.currency || "LKR"}`;
    } else if (donation.donationType === "EQUIPMENT" && donation.itemDetails && donation.itemDetails.length > 0) {
      return donation.itemDetails.map(item => 
        `${item.itemName} (${item.quantity > 1 ? `x${item.quantity}` : '1'})`
      ).join(", ");
    } else {
      return "Other Donation";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Function to handle thanking a donor via email
  const handleThankDonor = (donation: DonationItem) => {
    if (!donation.donor.email) {
      alert("Sorry, no email address is available for this donor.");
      return;
    }
    
    const subject = encodeURIComponent(`Thank you for your donation to our school`);
    const body = encodeURIComponent(
      `Dear ${donation.donor.displayName},\n\n` +
      `Thank you for your generous ${donation.donationType.toLowerCase()} donation ` +
      `(${formatDonationItem(donation)}) to our school. ` +
      `Your support makes a significant difference for our students and sports programs.\n\n` +
      `Sincerely,\n` +
      `School Administration`
    );
    
    const mailtoLink = `mailto:${donation.donor.email}?subject=${subject}&body=${body}`;
    
    // Try to open the email client in a new window
    const emailWindow = window.open(mailtoLink, '_blank');
    
    // If opening failed (blocked by browser or returned null)
    if (!emailWindow || emailWindow.closed || typeof emailWindow.closed === 'undefined') {
      // Fallback method - create a temporary link and click it
      const link = document.createElement('a');
      link.href = mailtoLink;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // If still having issues, alert the user with instructions
      setTimeout(() => {
        alert("If your email client didn't open automatically, please copy this donor's email address and send a thank you message manually: " + donation.donor.email);
      }, 1000);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Donations Received by Our School
          </h1>
          <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
            Keep track of the donations received by your school.
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 gap-6">
          {/* Items Donated Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiCheckCircle className="mr-2 text-[#1e0fbf]" /> Donations Received
              </h2>   
            </div>
            <div className="p-5">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <FiLoader className="animate-spin text-3xl text-[#6e11b0]" />
                  <span className="ml-3 text-gray-600">Loading donations...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md flex items-center justify-center">
                  <FiAlertCircle className="text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No donations have been received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div
                      key={donation._id}
                      className="bg-gray-50 p-3 rounded-md flex justify-between items-center space-x-4"
                    >
                      <span className="text-gray-700 flex-1 min-w-0">
                        {formatDonationItem(donation)}
                      </span>
                      <span className="text-[#6e11b0] text-sm text-right flex-shrink-0">
                        Received {formatDate(donation.createdAt)}
                      </span>
                      <span className="text-[#1e0fbf] text-sm text-right flex-shrink-0">
                        By {donation.donor.displayName || "Anonymous"}
                      </span>
                      <button
                        onClick={() => handleThankDonor(donation)}
                        className="px-3 py-1 bg-[#6e11b0] text-white rounded-md flex items-center hover:bg-[#5a0e91] transition-colors"
                        disabled={!donation.donor.email}
                        title={donation.donor.email ? "Send thank you email" : "No email available"}
                      >
                        <FiMail className="mr-1" /> Thank Donor
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
