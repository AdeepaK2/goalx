'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleAdminLogin(email, password);
  };

  const handleAdminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API call to backend auth service
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('adminToken', data.token);
      
      // Store admin info
      localStorage.setItem('adminInfo', JSON.stringify(data.admin));
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
      toast.error(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col items-center p-4 overflow-hidden">
      {/* Header with Logo */}
      <div className="w-full flex justify-center relative mb-2">
        {/* Home button in top right */}
        <div className="absolute top-0 right-4">
          <Link 
            href="/" 
            className="px-4 py-1.5 bg-white text-[#1e0fbf] border border-[#1e0fbf] rounded-full 
                     hover:bg-gray-50 transition-colors text-xs font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </Link>
        </div>
        
        {/* Larger Logo */}
        <div className="relative h-28 w-64">
          <Image 
            src="/logo.png" 
            alt="GoalX Logo" 
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>

      {/* Admin Login Form */}
      <div className="w-full flex-1 flex justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
          <h1 className="text-xl font-semibold mb-4 text-[#1e0fbf] text-center">Admin Login</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none"
                required
              />
            </div>
            
            <div className="mb-5">
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-2 text-sm font-medium text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] border-none rounded-md cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLoginPage;