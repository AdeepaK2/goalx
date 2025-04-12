'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Loading component to show while the verification form is loading
function VerificationLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Loading verification...
        </h2>
      </div>
    </div>
  );
}

// Main page component
export default function VerifyPage() {
  return (
    <Suspense fallback={<VerificationLoading />}>
      <VerificationForm />
    </Suspense>
  );
}

// Client component that uses useSearchParams
function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Get user type from URL params (defaults to 'donor')
  const userType = searchParams.get('type') || 'donor';
  
  // Set page title and descriptions based on user type
  const pageTitle = `Verify Your ${userType === 'school' ? 'School ' : userType === 'govern' ? 'Organization ' : ''}Email`;
  const userLabel = userType === 'school' ? 'School' : 
                    userType === 'govern' ? 'Governing Body' :
                    userType === 'admin' ? 'Admin' : 'Donor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Select API endpoint based on user type
      const endpoint = `/api/${userType}/verify`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }

      setSuccess(true);
      
      // For schools and governing bodies, don't redirect to login page
      if (userType !== 'school' && userType !== 'govern') {
        // Redirect after successful verification for other users
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {pageTitle}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 4-digit code sent to your email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  {userType === 'school' || userType === 'govern' ? (
                    <>
                      <p className="text-sm font-medium text-green-800">
                        {userType === 'school' ? 'School' : 'Organization'} email verified successfully!
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        Thank you for registering your {userType === 'school' ? 'school' : 'organization'}. 
                        Our team will review your application and contact you soon to complete the verification process.
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        Once your {userType === 'school' ? 'school' : 'organization'} details are verified by our admin team, 
                        you'll be able to access all features of GoalX.
                      </p>
                      <div className="mt-4">
                        <button
                          onClick={() => router.push('/')}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] hover:from-[#2712c2] hover:to-[#7a15c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf]"
                        >
                          Return to Home
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-green-800">
                      {`${userLabel} email verified successfully! Redirecting to login...`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {userLabel} Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm text-black"
                    placeholder={`Enter your ${userType} email address`}
                  />
                </div>
              </div>

              {/* Verification Code */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-center text-2xl tracking-widest font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] text-black"
                    placeholder="0000"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] hover:from-[#2712c2] hover:to-[#7a15c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}