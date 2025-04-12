"use client";
import React, { useState, useEffect } from "react";
import NavBar from "@/components/donorContent/navBar";
import Dashboard from "@/components/donorContent/dashboard";
import Donations from "@/components/donorContent/donations";
import SchoolNeeds from "@/components/donorContent/picks";
import DonorProfile from "@/components/donorContent/profile"; // Import the profile component
import Footer from "@/components/schoolContent/footer";
import { useRouter } from "next/navigation";

interface DonorData {
  id: string;
  donorId: string;
  name: string;
  email: string;
  donorType: string;
  location?: {
    district?: string;
    province?: string;
  };
}

const Page = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [donorData, setDonorData] = useState<DonorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch donor data on component mount
  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/donor/me", {
          credentials: "include", // Important for cookies
        });

        if (!response.ok) {
          // If not authenticated, redirect to login
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Enhance with location data if available
        try {
          const donorResponse = await fetch(`/api/donor?id=${data.id}`);
          if (donorResponse.ok) {
            const donorDetails = await donorResponse.json();
            if (donorDetails.location) {
              data.location = donorDetails.location;
            }
          }
        } catch (locErr) {
          console.warn("Could not fetch donor location details:", locErr);
        }
        
        setDonorData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch donor data");
        console.error("Error fetching donor data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonorData();
  }, [router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} donorName={donorData?.name || "Donor"} />
        <div className="flex-grow flex items-center justify-center">
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} donorName={donorData?.name || "Donor"} />
        <div className="flex-grow flex items-center justify-center">
          <div className="p-6 text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar with activeTab state and donor data */}
      <NavBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        donorName={donorData?.name || "Donor"} 
      />

      {/* Main Content Area - conditionally render based on activeTab */}
      <main className="flex-grow">
        {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} donorData={donorData} />}
        {activeTab === "donations" && donorData && <Donations donorData={donorData} />}
        {activeTab === "schools" && donorData && <SchoolNeeds donorData={donorData} />}
        {activeTab === "profile" && donorData && <DonorProfile donorData={donorData} />}
      </main>

      <Footer />
    </div>
  );
};

export default Page;