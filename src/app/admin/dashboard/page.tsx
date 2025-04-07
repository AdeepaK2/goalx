'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from '@/components/adminComponents/Sidebar';
import DashboardContent from '@/components/adminComponents/DashboardContent';
import SchoolsContent from '@/components/adminComponents/SchoolsContent';
import DonorsContent from '@/components/adminComponents/DonorsContent';
import GoverningBodiesContent from '@/components/adminComponents/GoverningBodiesContent';
import SettingsContent from '@/components/adminComponents/SettingsContent';

interface AdminInfo {
  id: string;
  name: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const renderContent = () => {
    if (!adminInfo) return null;
    
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent adminName={adminInfo.name} />;
      case 'schools':
        return <SchoolsContent />;
      case 'donors':
        return <DonorsContent />;
      case 'governing-bodies':
        return <GoverningBodiesContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent adminName={adminInfo.name} />;
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
    <div className="flex h-screen bg-gray-50">
      <ToastContainer />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <div className="flex-1 overflow-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;