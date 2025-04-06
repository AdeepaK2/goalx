'use client';

import React, { useState } from 'react';
import AdminLogin from '@/components/login/adminLogin';
import DonorLogin from '@/components/login/donorLogin';
import GovernBodyLogin from '@/components/login/governBodyLogin';
import SchoolLogin from '@/components/login/schoolLogin';

type UserType = 'admin' | 'donor' | 'governBody' | 'school';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserType>('donor');

  const handleAdminLogin = async (email: string, password: string) => {
    // Implement admin login logic
    console.log('Admin login attempt:', email);
  };

  const handleDonorLogin = async (email: string, password: string) => {
    // Implement donor login logic
    console.log('Donor login attempt:', email);
  };

  const handleGovernBodyLogin = async (email: string, password: string) => {
    // Implement governing body login logic
    console.log('Governing body login attempt:', email);
  };

  const handleSchoolLogin = async (email: string, password: string) => {
    // Implement school login logic
    console.log('School login attempt:', email);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.tabsContainer}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'donor' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('donor')}
        >
          Donor
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'school' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('school')}
        >
          School
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'governBody' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('governBody')}
        >
          Governing Body
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === 'admin' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('admin')}
        >
          Admin
        </button>
      </div>

      <div style={styles.contentContainer}>
        {activeTab === 'admin' && <AdminLogin onLogin={handleAdminLogin} />}
        {activeTab === 'donor' && <DonorLogin onLogin={handleDonorLogin} />}
        {activeTab === 'governBody' && <GovernBodyLogin onLogin={handleGovernBodyLogin} />}
        {activeTab === 'school' && <SchoolLogin onLogin={handleSchoolLogin} />}
      </div>
    </div>
  );
};

const styles: {[key: string]: React.CSSProperties} = {
  pageContainer: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  tabsContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '600px',
    margin: '20px 0',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  },
  tabButton: {
    flex: 1,
    padding: '16px 0',
    backgroundColor: 'white',
    color: '#555',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    borderBottom: '3px solid transparent',
  },
  activeTab: {
    backgroundColor: 'white',
    color: '#1e0fbf',
    borderBottom: '3px solid #6e11b0',
    fontWeight: '600',
  },
  contentContainer: {
    width: '100%',
  },
};

export default LoginPage;