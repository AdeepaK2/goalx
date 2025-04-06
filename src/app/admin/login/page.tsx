'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLogin from '@/components/login/adminLogin';

const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Here you would make an API call to your backend auth service
      // For example:
      // const response = await fetch('/api/admin/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      
      console.log('Admin login attempt with:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If login is successful, redirect to admin dashboard
      // router.push('/admin/dashboard');
      
      // For now, just log that login was successful
      console.log('Admin login successful!');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <AdminLogin onLogin={handleAdminLogin} isLoading={isLoading} />
      
      {error && (
        <div style={{
          color: '#ff3333',
          textAlign: 'center',
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#ffeeee',
          borderRadius: '4px',
          maxWidth: '400px',
          margin: '20px auto'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminLoginPage;