'use client';

import React, { useEffect, useState } from 'react';
import Dashboard from '../../components/governContent/dashboard';
import NavBar from '../../components/governContent/navBar';
import GovernProfile from '../../components/governContent/profile';
import EquipmentRequestComponent from '../../components/governContent/equipment-request';
import EquipmentTransaction from '../../components/governContent/equipment-transaction';
import SchoolsDirectory from '../../components/governContent/schools';

interface GovernBodyData {
  id?: string;
  name: string;
  governBodyId: string;
  email: string;
  donorType?: string;
}

export default function GovernDashboard() {
  const [governBody, setGovernBody] = useState<GovernBodyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    async function fetchGovernBodyData() {
      try {
        const response = await fetch('/api/auth/govern/me', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch governing body data');
        }

        const data = await response.json();
        setGovernBody(data.governBody);
      } catch (err) {
        console.error('Error fetching governing body data:', err);
        setError('Failed to load governing body data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchGovernBodyData();
  }, []);

  // Transform governBody data to match the format expected by Dashboard
  const donorData = governBody ? {
    id: governBody.id || governBody.governBodyId,
    donorId: governBody.governBodyId,
    name: governBody.name,
    email: governBody.email,
    donorType: governBody.donorType || "GOVERN_BODY"
  } : null;

  const renderContent = () => {
    switch(activeTab) {
      case "dashboard":
        return <Dashboard setActiveTab={setActiveTab} donorData={donorData} />;
      case "profile":
        return <GovernProfile donorData={donorData} />;
      case "equipment-request":
        return <EquipmentRequestComponent governBodyId={donorData?.donorId} donorData={donorData} />;
      case "equipment-transaction":
        return <EquipmentTransaction />;
      case "schools":
        return <SchoolsDirectory />;
      default:
        return <Dashboard setActiveTab={setActiveTab} donorData={donorData} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Loading dashboard...</h2>
          <p className="mt-2 text-sm text-gray-600">Please wait while we load your information.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center text-red-600">
          <h2 className="text-lg font-medium">Error</h2>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        governName={governBody?.name}
      />
      
      {renderContent()}
    </div>
  );
}