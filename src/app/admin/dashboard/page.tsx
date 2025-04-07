'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AdminInfo {
  id: string;
  name: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Admin dashboard loaded, checking authentication...');
    
    // Verify authentication using the verification endpoint
    fetch('/api/auth/admin', {
      method: 'GET',
      credentials: 'include' // Important: include cookies
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      return response.json();
    })
    .then(data => {
      if (data.authenticated && data.admin) {
        setAdminInfo(data.admin);
        console.log('Admin authenticated:', data.admin.name);
        
        // Show welcome toast
        toast.success(`Welcome back, ${data.admin.name}!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // If not authenticated for some reason, redirect to login
        router.push('/admin/login');
      }
    })
    .catch(error => {
      console.error('Authentication check failed:', error);
      router.push('/admin/login');
    })
    .finally(() => {
      setLoading(false);
    });
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      // Redirect to login page
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1e0fbf]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              {adminInfo && (
                <span className="text-sm text-gray-700">
                  Welcome, {adminInfo.name}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] rounded-md hover:opacity-90 transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Add action cards here */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Manage Users</h3>
              <p className="text-sm text-gray-500 mb-3">View and manage all registered users</p>
              <Link href="/admin/users">
                <span className="text-sm text-[#1e0fbf] font-medium">View Users →</span>
              </Link>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Site Settings</h3>
              <p className="text-sm text-gray-500 mb-3">Configure site settings and preferences</p>
              <Link href="/admin/settings">
                <span className="text-sm text-[#1e0fbf] font-medium">Edit Settings →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;