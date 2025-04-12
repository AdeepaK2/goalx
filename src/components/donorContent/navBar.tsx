import React from 'react';
import { FiHome, FiDollarSign, FiUser, FiLogOut } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';

interface NavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  donorName?: string;
}

const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab, donorName = 'Donor' }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <FiHome size={20} /> },
    { id: "donations", label: "My Donations", icon: <FiDollarSign size={20} /> },
    { id: "schools", label: "Schools in Need", icon: <HiOutlineAcademicCap size={20} /> },
    { id: "profile", label: "My Profile", icon: <FiUser size={20} /> }
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userType: 'donor' }) // Indicate this is a donor logout
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
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <img 
              className="h-8 w-auto" 
              src="/logo.png" 
              alt="GoalX Logo" 
            />
            <span className="ml-2 text-xl font-bold text-gray-900">GoalX</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === item.id
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center">
            <div className="flex items-center border-l border-gray-200 pl-4 ml-4">
              <FiUser className="text-gray-400" />
              <span className="ml-2 text-sm font-medium text-gray-700">
                {donorName}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="ml-6 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
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
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default NavBar;