"use client";
import React, { useState } from "react";
import NavBar from "@/components/schoolContent/navBar";
import Dashboard from "@/components/schoolContent/dashboard";
import Requests from "@/components/schoolContent/requests";
import Donations from "@/components/schoolContent/donations";
import Borrowals from "@/components/schoolContent/borrowals";
import Achievements from "@/components/schoolContent/achivements";
import Inquiries from "@/components/schoolContent/Inquiries";
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
        {activeTab === "requests" && <Requests />}
        {activeTab === "borrowals" && <Borrowals />}
        {activeTab === "achievements" && <Achievements />}
        {activeTab === "donations" && <Donations />}
        {activeTab === "inquiries" && <Inquiries />}
      </main>

      <Footer />
    </div>
  );
};

export default Page;
