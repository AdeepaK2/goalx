import React, { useState } from "react";
import Image from "next/image";
import { FiMenu, FiX, FiUser, FiLogOut } from "react-icons/fi";

interface NavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  donorName?: string; // Added donor name prop
}

const NavBar = ({ activeTab, setActiveTab, donorName = "User" }: NavBarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "donations", label: "Donations" },
    { id: "requests", label: "Requests" }
  ];

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      
      if (response.ok) {
        // Redirect to login page after successful logout
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Image
                src="/logo.png"
                alt="GoalX Logo"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center pr-4 border-r border-gray-200">
              <span className="ml-2 text-gray-700 font-medium">
                {donorName}
              </span>
            </div>

            <div className="flex items-center ml-4">
              <div className="relative">
                <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FiUser />
                  </div>
                </button>
              </div>
              <div className="ml-4">
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiLogOut className="mr-2" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">
                {mobileMenuOpen ? "Close menu" : "Open menu"}
              </span>
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  activeTab === tab.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FiUser className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {donorName}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
