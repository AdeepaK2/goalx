import React, { useState, useEffect, useRef } from 'react';
import { FiHome, FiDollarSign, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';

interface NavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  donorName?: string;
  profileImageUrl?: string;
}

const NavBar: React.FC<NavBarProps> = ({ 
  activeTab, 
  setActiveTab, 
  donorName = 'Donor', 
  profileImageUrl 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
    
    // Add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleNavigation = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false); // Close mobile menu after selection
  };
  
  const getProfileImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) {
      return undefined;
    }
    
    if (imageUrl.startsWith('/api/file/download')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('http')) {
      return `/api/file/download?fileUrl=${encodeURIComponent(imageUrl)}`;
    }
    
    return `/api/file/download?file=${encodeURIComponent(imageUrl)}`;
  };
  
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
          body: JSON.stringify({ userType: 'donor' })
        });
        
        if (response.ok) {
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
    <header className="bg-white shadow-sm relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              className="h-8 w-auto" 
              src="/logo.png" 
              alt="GoalX Logo" 
            />
            <span className="ml-2 text-xl font-bold text-gray-900">GoalX</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
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
          
          {/* Desktop Profile */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center border-l border-gray-200 pl-4 ml-4">
              {profileImageUrl && !imageError ? (
                <img 
                  src={getProfileImageUrl(profileImageUrl)}
                  alt={donorName}
                  className="h-8 w-8 rounded-full object-cover"
                  onError={(e) => {
                    console.error("Failed to load image:", profileImageUrl);
                    e.currentTarget.onerror = null;
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FiUser className="h-4 w-4 text-indigo-500" />
                </div>
              )}
              <span className="ml-2 text-sm font-medium text-gray-700">
                {donorName}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="ml-6 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Logout"
            >
              <FiLogOut className="h-6 w-6" />
            </button>
          </div>
          
          {/* Mobile User Info and Menu Button */}
          <div className="md:hidden flex items-center">
            <div className="flex items-center mr-2">
              {profileImageUrl && !imageError ? (
                <img 
                  src={getProfileImageUrl(profileImageUrl)}
                  alt={donorName}
                  className="h-8 w-8 rounded-full object-cover"
                  onError={(e) => {
                    console.error("Failed to load image:", profileImageUrl);
                    e.currentTarget.onerror = null;
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FiUser className="h-4 w-4 text-indigo-500" />
                </div>
              )}
            </div>
            
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 md:hidden z-20" onClick={() => setIsMenuOpen(false)}></div>
      )}
      
      {/* Mobile Navigation Menu */}
      <div 
        ref={menuRef}
        className={`fixed top-16 right-0 w-full max-w-sm bg-white shadow-lg md:hidden z-30 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } h-screen overflow-y-auto`}
      >
        <div className="pt-2 pb-3 space-y-1 px-2 border-t border-gray-200">
          {/* Mobile nav items */}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-md text-base font-medium ${
                activeTab === item.id
                  ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
          
          {/* Mobile Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
          >
            <span className="mr-3"><FiLogOut size={20} /></span>
            Logout
          </button>
          
          {/* Mobile user info */}
          <div className="mt-3 pt-4 border-t border-gray-200">
            <div className="flex items-center px-4 py-2">
              <div className="text-base font-medium">Signed in as:</div>
              <div className="ml-2 text-base font-medium text-indigo-600">{donorName}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;