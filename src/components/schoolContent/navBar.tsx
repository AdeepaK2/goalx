import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiMenu, FiX, FiUser, FiLogOut, FiLoader } from "react-icons/fi";

interface NavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface SchoolData {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  profilePicture?: string;
}

const NavBar = ({ activeTab, setActiveTab }: NavBarProps) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Remove "profile" from the tabs array
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "requests", label: "Requests" },
    { id: "borrowals", label: "Borrowals" },
    { id: "donations", label: "Donations" },
    { id: "inquiries", label: "Inquiries" },
    { id: "achievements", label: "Achievements" }
  ];

  // Fetch school data on component mount
  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/school/me");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();

        if (data.success && data.school) {
          setSchoolData({
            id: data.school.id,
            schoolId: data.school.schoolId,
            name: data.school.name,
            email: data.school.email,
            profilePicture: data.school.profilePicture || undefined
          });
        } else {
          setError(data.error || "Could not load school information");
        }
      } catch (err) {
        console.error("Error fetching school data:", err);
        setError("Failed to load school data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchoolData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        // Clear any local state/storage if needed
        localStorage.removeItem("schoolData");
        
        // Redirect to login page
        window.location.href = "/login";
      } else {
        const errorData = await response.json();
        console.error("Logout failed:", errorData);
        alert("Failed to log out. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred during logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Function to get placeholder initials if no profile picture
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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

          {/* School Logo and User Section */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center pr-4 border-r border-gray-200">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <FiLoader className="animate-spin h-5 w-5 text-gray-400" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : error ? (
                <div className="text-red-500 text-sm">{error}</div>
              ) : (
                <>
                  {schoolData?.profilePicture ? (
                    <div 
                      onClick={() => setActiveTab("profile")}
                      className={`h-10 w-10 rounded-full cursor-pointer ${activeTab === "profile" ? "ring-2 ring-indigo-500" : ""}`}
                    >
                      <Image
                        src={`/api/file/download?file=${schoolData.profilePicture}`}
                        alt={`${schoolData.name} Logo`}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/school-placeholder.png';
                        }}
                      />
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveTab("profile")}
                      className="focus:outline-none"
                    >
                      <div className={`h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 cursor-pointer ${activeTab === "profile" ? "ring-2 ring-indigo-500" : ""}`}>
                        {schoolData?.name ? getInitials(schoolData.name) : <FiUser className="h-6 w-6" />}
                      </div>
                    </button>
                  )}
                  <span className="ml-2 text-gray-700 font-medium">
                    {schoolData?.name || "School"}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center ml-4">
              <div className="ml-4">
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <FiLoader className="animate-spin mr-2" /> Logging out...
                    </>
                  ) : (
                    <>
                      <FiLogOut className="mr-2" /> Logout
                    </>
                  )}
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
                className={`w-full text-left ${
                  activeTab === tab.id
                    ? "text-blue-600 bg-blue-50 block pl-3 pr-4 py-2 border-l-4 border-blue-500 text-base font-medium"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <FiLoader className="animate-spin h-5 w-5 text-gray-400" />
                <span className="ml-2 text-gray-500">Loading school data...</span>
              </div>
            ) : (
              <div className="flex items-center px-4">
                <button onClick={() => setActiveTab("profile")} className="flex items-center">
                <div className="flex-shrink-0">
                  {schoolData?.profilePicture ? (
                    <Image
                      src={`/api/file/download?file=${schoolData.profilePicture}`}
                      alt="School Logo"
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/school-placeholder.png';
                      }}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      {schoolData?.name ? getInitials(schoolData.name) : <FiUser className="h-5 w-5" />}
                    </div>
                  )}
                </div>
                </button>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {schoolData?.name || "School"}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {schoolData?.email || ""}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-3 space-y-1">
              {/* Remove the Profile button from mobile menu */}
              <button 
                onClick={handleLogout} 
                disabled={isLoggingOut}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
