'use client';

import { useState } from 'react';
import Image from 'next/image';
import SchoolRegister from '@/components/register/schoolRegister';
import DonorRegister from '@/components/register/donorRegister';
import GoverBodyRegister from '@/components/register/goverBodyRegister';

const RegisterPage = () => {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState<'school' | 'donor' | 'governBody'>('school');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logo */}
      <header className="pt-6 pb-4 flex justify-center">
        <div className="w-32 h-16 relative">
          <Image
            src="/logo.png"
            alt="GoalX Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Registration type tabs */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-2 rounded-lg bg-white p-1 shadow">
            <button
              onClick={() => setActiveTab('school')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'school'
                  ? 'bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              School
            </button>
            
            <button
              onClick={() => setActiveTab('donor')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'donor'
                  ? 'bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Donor
            </button>
            
            <button
              onClick={() => setActiveTab('governBody')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'governBody'
                  ? 'bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Governing Body
            </button>
          </nav>
        </div>
        
        {/* Registration form based on selected tab */}
        <div className="fade-in transition-opacity">
          {activeTab === 'school' && <SchoolRegister />}
          {activeTab === 'donor' && <DonorRegister />}
          {activeTab === 'governBody' && <GoverBodyRegister />}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} GoalX. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RegisterPage;