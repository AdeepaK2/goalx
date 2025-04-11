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
    { id: "schools", label: "Schools in Need", icon: <HiOutlineAcademicCap size={20} /> }
  ];

  const handleLogout = () => {
    // Implement logout functionality
    if (window.confirm('Are you sure you want to log out?')) {
      // Clear cookies or tokens
      document.cookie = 'donor_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Redirect to login
      window.location.href = '/login';
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
<<<<<<< HEAD
            
            <button 
              onClick={handleLogout}
              className="ml-6 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
=======

            <div className="flex items-center ml-4">
              <div className="relative">
                <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"  onClick={() => setActiveTab("profile")}>
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FiUser />
                  </div>
                </button>
              </div>
              <div className="ml-4">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
>>>>>>> 00acb78891bffb9763f8e4fd6ce22cbee14a1fc8
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
<<<<<<< HEAD
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
=======
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
                  Admin User
                </div>
                <div className="text-sm font-medium text-gray-500">
                  admin@centralhs.edu
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={() => setActiveTab("profile")}>
                Profile
              </button>
              <button className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Logout
              </button>
            </div>
          </div>
>>>>>>> 00acb78891bffb9763f8e4fd6ce22cbee14a1fc8
        </div>
      </div>
    </header>
  );
};

export default NavBar;
