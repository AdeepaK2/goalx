'use client';


import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Router } from 'lucide-react';

type UserType = 'donor' | 'governBody' | 'school';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserType>('donor');
  const router = useRouter();

  const handleDonorLogin = async (email: string, password: string) => {
    console.log('Donor login attempt:', email);
  };

  const handleGovernBodyLogin = async (email: string, password: string) => {
    console.log('Governing body login attempt:', email);
  };

  const handleSchoolLogin = async (email: string, password: string) => {
    console.log('School login attempt:', email);
  };

  const navigateToRegister = () => {
    router.push('/register');
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

      {/* Login Tabs */}
      <div className="flex justify-center w-full max-w-xl mx-auto mb-3 rounded-lg overflow-hidden shadow-sm">
        <button
          className={`flex-1 py-3 bg-white text-gray-600 border-0 cursor-pointer text-sm font-medium transition-all duration-300 ease-in-out ${
            activeTab === 'donor' ? 'text-[#1e0fbf] border-b-[3px] border-[#6e11b0] font-semibold' : 'border-b-[3px] border-transparent'
          }`}
          onClick={() => setActiveTab('donor')}
        >
          Donor
        </button>
        <button
          className={`flex-1 py-3 bg-white text-gray-600 border-0 cursor-pointer text-sm font-medium transition-all duration-300 ease-in-out ${
            activeTab === 'school' ? 'text-[#1e0fbf] border-b-[3px] border-[#6e11b0] font-semibold' : 'border-b-[3px] border-transparent'
          }`}
          onClick={() => setActiveTab('school')}
        >
          School
        </button>
        <button
          className={`flex-1 py-3 bg-white text-gray-600 border-0 cursor-pointer text-sm font-medium transition-all duration-300 ease-in-out ${
            activeTab === 'governBody' ? 'text-[#1e0fbf] border-b-[3px] border-[#6e11b0] font-semibold' : 'border-b-[3px] border-transparent'
          }`}
          onClick={() => setActiveTab('governBody')}
        >
          Governing Body
        </button>
      </div>

      {/* Login Forms - They need to be more compact */}
      <div className="w-full flex-1 flex justify-center">
        {activeTab === 'donor' && <CompactDonorLogin onLogin={handleDonorLogin} />}
        {activeTab === 'governBody' && <CompactGovernBodyLogin onLogin={handleGovernBodyLogin} />}
        {activeTab === 'school' && <CompactSchoolLogin onLogin={handleSchoolLogin} />}
      </div>
    </div>
  );
};

// More compact versions of the login components to fit on one screen
const CompactDonorLogin: React.FC<{onLogin: (email: string, password: string) => Promise<void>}> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  
  // Define these functions at component level, not inside handleSubmit
  const toReg = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/register');
  }
  
  const toPwR = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/login/password-reset');
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // For debugging - log the attempt
      console.log('Attempting donor login with email:', email);
      
      const response = await fetch('/api/auth/donor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important: include credentials
      });
      
      // Get response data
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Failed to parse response:', err);
        throw new Error('Invalid server response');
      }
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Show success message
      setSuccess('Login successful! Redirecting to dashboard...');
      
      // Use a direct window reload for the donors page
      setTimeout(() => {
        console.log('Navigating to donors dashboard...');
        // Use window.location.assign for a complete page load/refresh
        window.location.assign('/donors');
      }, 2000);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
      <h1 className="text-xl font-semibold mb-4 text-[#6e11b0] text-center">Donor Login</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-xs mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-xs mb-4">
          {success}
        </div>
      )}
      
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
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none text-[#1e0fbf]"
            disabled={isLoading}
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
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none text-[#1e0fbf]"
            disabled={isLoading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full py-2 text-sm font-medium text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] border-none rounded-md cursor-pointer mb-3 disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="flex justify-between mt-1 text-xs">
          <a href="/register" className="text-[#1e0fbf] no-underline" onClick={toReg}>Create an account</a>
          <a href="/login/password-reset" className="text-[#1e0fbf] no-underline" onClick={toPwR}>Forgot password?</a>
        </div>
      </form>
    </div>
  );
};

const CompactGovernBodyLogin: React.FC<{onLogin: (email: string, password: string) => Promise<void>}> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // For debugging - log the attempt
      console.log('Attempting governing body login with email:', email);
      
      const response = await fetch('/api/auth/govern/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important: include credentials
      });
      
      // Get response data
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Failed to parse response:', err);
        throw new Error('Invalid server response');
      }
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Show success message
      setSuccess('Login successful! Redirecting to dashboard...');
      
      // Use a direct window reload for the govern-bodies page
      setTimeout(() => {
        console.log('Navigating to governing body dashboard...');
        // Use window.location.assign for a complete page load/refresh
        window.location.assign('/governBody');
      }, 2000);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
      <h1 className="text-xl font-semibold mb-4 text-[#1e0fbf] text-center">Governing Body Login</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-xs mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-xs mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="govEmail" className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="govEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none text-[#1e0fbf]"
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="mb-5">
          <label htmlFor="govPassword" className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="govPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none text-[#1e0fbf]"
            disabled={isLoading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full py-2 text-sm font-medium text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] border-none rounded-md cursor-pointer mb-3 disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="flex justify-between mt-1 text-xs">
          <a href="/register" className="text-[#1e0fbf] no-underline" onClick={(e) => {
            e.preventDefault();
            router.push('/register');
          }}>Register governing body</a>
          <a href="/governBody/forgot-password" className="text-[#1e0fbf] no-underline" onClick={(e) => {
            e.preventDefault();
            router.push('/governBody/forgot-password');
          }}>Forgot password?</a>
        </div>
      </form>
    </div>
  );
};

const CompactSchoolLogin: React.FC<{onLogin: (email: string, password: string) => Promise<void>}> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // For debugging - log the attempt
      console.log('Attempting login with email:', email);
      
      const response = await fetch('/api/auth/school/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important: include credentials
      });
      
      // Get response data
      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Failed to parse response:', err);
        throw new Error('Invalid server response');
      }
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Show success message
      setSuccess('Login successful! Redirecting to dashboard...');
      
      // Use a direct window reload for the schools page after a slightly longer delay
      setTimeout(() => {
        console.log('Navigating to schools dashboard...');
        // Use window.location.assign for a complete page load/refresh
        window.location.assign('/schools');
      }, 2000);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
      <h1 className="text-xl font-semibold mb-4 text-[#6e11b0] text-center">School Login</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-xs mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-xs mb-4">
          {success}
        </div>
      )}
      
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
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none text-[#1e0fbf]"
            disabled={isLoading}
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
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none text-[#1e0fbf]"
            disabled={isLoading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full py-2 text-sm font-medium text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] border-none rounded-md cursor-pointer mb-3 disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="flex justify-between mt-1 text-xs">
          <a href="/register" className="text-[#1e0fbf] no-underline">Register your school</a>
          <a href="/school/forgot-password" className="text-[#1e0fbf] no-underline">Forgot password?</a>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;