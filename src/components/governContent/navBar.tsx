import React from 'react';
import { FiHome, FiUser, FiLogOut, FiAward, FiBox } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';

interface NavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  governName?: string;
}

const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab, governName = 'Governing Body' }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <FiHome size={20} /> },
    { id: "equipment-request", label: "Equipment Request", icon: <FiBox size={20} /> },
    { id: "equipment-transaction", label: "Equipment Transaction", icon: <FiAward size={20} /> },
    { id: "schools", label: "Schools", icon: <HiOutlineAcademicCap size={20} /> }
    // Profile removed from main navigation
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userType: 'govern' }) // Indicate this is a governing body logout
        });
        
        if (response.ok) {
          // Redirect to login page
          window.location.href = '/login';
        } else {
          console.error('Logout failed');
          alert('Failed to log out. Please try again.');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred during logout');
      }
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <img 
              className="h-8 w-auto" 
              src="/logo.png" 
              alt="GoalX Logo" 
            />
            <span className="ml-2 text-xl font-bold text-gray-900">GoalX</span>
            <span className="ml-2 text-sm font-medium text-indigo-600 bg-indigo-100 py-0.5 px-2 rounded-full">
              Governing Body
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center">
            <div 
              className="flex items-center border-l border-gray-200 pl-4 ml-4 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => setActiveTab("profile")}
            >
              <div className={`p-2 rounded-full ${activeTab === "profile" ? "bg-indigo-100" : "hover:bg-gray-100"}`}>
                <FiUser className={activeTab === "profile" ? "text-indigo-600" : "text-gray-500"} />
              </div>
              <span className={`ml-2 text-sm font-medium ${activeTab === "profile" ? "text-indigo-600" : "text-gray-700"}`}>
                {governName}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="ml-6 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiLogOut className="h-6 w-6" />
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="hidden md:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                activeTab === item.id
                  ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <span className="mr-2 inline-flex items-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
          {/* Add Profile option in mobile menu */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              activeTab === "profile"
                ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <span className="mr-2 inline-flex items-center"><FiUser /></span>
            My Profile
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;