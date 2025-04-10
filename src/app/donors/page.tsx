"use client";
import React, { useState } from "react";
import NavBar from "@/components/donorContent/navBar";
import Dashboard from "@/components/donorContent/dashboard";
import Donations from "@/components/donorContent/donations";
import Requests from "@/components/donorContent/requests";
import Profile from "@/components/donorContent/profile";
import Footer from "@/components/schoolContent/footer";

const Page = () => {
  const [activeTab, setActiveTab] = useState("dashboard"); // Default active tab

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar with activeTab state */}
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area - conditionally render based on activeTab */}
      
      <main className="flex-grow">
        {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === "donations" && <Donations />}
        {activeTab === "requests" && <Requests />}
        {activeTab === "profile" && <Profile />}
      </main>

      <Footer />
    </div>
  );
};

export default Page;
