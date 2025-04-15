import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface GovernBodyLoginProps {
  onLogin: (email: string, password: string) => Promise<{success: boolean, redirectUrl?: string}>;
  isLoading?: boolean;
}

const GovernBodyLogin: React.FC<GovernBodyLoginProps> = ({ onLogin, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const valid = regex.test(email);
    setEmailError(valid ? '' : 'Please enter a valid email address');
    return valid;
  };

  const validatePassword = (password: string): boolean => {
    const valid = password.length >= 6;
    setPasswordError(valid ? '' : 'Password must be at least 6 characters');
    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isEmailValid && isPasswordValid) {
      try {
        const result = await onLogin(email, password);
        if (result.success && result.redirectUrl) {
          router.push(result.redirectUrl);
        }
      } catch (error) {
        setLoginError('Login failed. Please check your credentials and try again.');
        console.error('Login error:', error);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-[#1e0fbf] text-center">Governing Body Login</h1>
        
        {loginError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateEmail(email)}
              placeholder="Enter your email"
              className="w-full px-3 py-3 text-sm border border-gray-200 rounded-md outline-none transition-colors"
            />
            {emailError && <p className="text-red-600 text-xs mt-1">{emailError}</p>}
          </div>
          
          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validatePassword(password)}
              placeholder="Enter your password"
              className="w-full px-3 py-3 text-sm border border-gray-200 rounded-md outline-none transition-colors"
            />
            {passwordError && <p className="text-red-600 text-xs mt-1">{passwordError}</p>}
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 text-base font-medium text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] border-none rounded-md cursor-pointer transition-transform disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GovernBodyLogin;