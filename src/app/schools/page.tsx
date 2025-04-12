"use client";
import React, { useState, useEffect } from "react"; // Import useEffect
import NavBar from "@/components/schoolContent/navBar";
import Dashboard from "@/components/schoolContent/dashboard";
import Requests from "@/components/schoolContent/requests";
import Donations from "@/components/schoolContent/donations";
import Borrowals from "@/components/schoolContent/borrowals";
import Achievements from "@/components/schoolContent/achivements";
import Profile from "@/components/schoolContent/profile";
import Inquiries from "@/components/schoolContent/Inquiries";
import Footer from "@/components/schoolContent/footer";
import Outgoing from "@/components/schoolContent/outgoing"; // Import Outgoing

// Define a type for the action trigger
type ActionTrigger = {
  tab: string;
  action: string;
} | null;

const Page = () => {
  const [activeTab, setActiveTab] = useState("dashboard"); // Default active tab
  const [actionTrigger, setActionTrigger] = useState<ActionTrigger>(null); // State to trigger actions on tabs

  // Function to handle the click from the dashboard button
  const handleReportAchievementClick = () => {
    setActionTrigger({ tab: "achievements", action: "openModal" });
  };

  // Effect to switch tab when actionTrigger is set
  useEffect(() => {
    if (actionTrigger) {
      setActiveTab(actionTrigger.tab);
    }
  }, [actionTrigger]);

  // Function to clear the trigger, passed down to the target component
  const clearActionTrigger = () => {
    setActionTrigger(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar with activeTab state */}
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Navigation */}
      {/* Main Content Area - conditionally render based on activeTab */}
      <main className="flex-grow">
        {activeTab === "dashboard" && (
          <Dashboard
            setActiveTab={setActiveTab}
            onReportAchievementClick={handleReportAchievementClick} // Pass the handler down
          />
        )}
        {activeTab === "requests" && <Requests />}
        {activeTab === "borrowals" && <Borrowals />}
        {activeTab === "outgoing" && <Outgoing />}
        {activeTab === "profile" && <Profile />}
        {activeTab === "achievements" && (
          <Achievements
            actionTrigger={actionTrigger} // Pass the trigger state
            clearActionTrigger={clearActionTrigger} // Pass the clear function
          />
        )}
        {activeTab === "donations" && <Donations />}
        {activeTab === "inquiries" && <Inquiries />}
      </main>

      <Footer />
    </div>
  );
};

export default Page;
