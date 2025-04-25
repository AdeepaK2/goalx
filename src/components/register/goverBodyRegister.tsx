'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define Sport interface
interface Sport {
  _id: string;
  sportId: string;
  sportName: string;
  description: string;
}

const GoverBodyRegister = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [availableSports, setAvailableSports] = useState<Sport[]>([]);
  const [isLoadingSports, setIsLoadingSports] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Add password validation error state
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    specializedSports: [] as string[],
    description: '',
    contact: {
      phone: '',
      website: '',
    },
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Fetch available sports when component mounts
  useEffect(() => {
    const fetchSports = async () => {
      try {
        setIsLoadingSports(true);
        const response = await fetch('/api/sport?limit=100');
        if (response.ok) {
          const data = await response.json();
          setAvailableSports(data.sports || []);
        } else {
          console.error('Failed to fetch sports');
        }
      } catch (err) {
        console.error('Error fetching sports:', err);
      } finally {
        setIsLoadingSports(false);
      }
    };

    fetchSports();
  }, []);

  // Password validation function
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData] as any,
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Clear password error when password field changes
      if (name === 'password') {
        setPasswordError(validatePassword(value));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate password strength
    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      setIsLoading(false);
      return;
    }
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/govern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          abbreviation: formData.abbreviation,
          specializedSports: formData.specializedSports, // Send array of sport IDs
          description: formData.description || undefined,
          contact: {
            phone: formData.contact.phone || undefined,
            website: formData.contact.website || undefined,
          },
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register governing body');
      }

      setSuccess(true);
      // Redirect to verification page
      setTimeout(() => {
        router.push(`/verify?type=govern&email=${encodeURIComponent(formData.email)}`);
      }, 2000);
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
          Governing Body Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Register your sports governing organization
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
                  <p className="text-sm font-medium text-green-800">
                    Registration successful! Redirecting...
                  </p>
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
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Organization Information</h4>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Organization Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm text-black"
                    />
                  </div>
                </div>

                {/* Abbreviation */}
                <div>
                  <label htmlFor="abbreviation" className="block text-sm font-medium text-gray-700">
                    Abbreviation (e.g., FIFA)
                  </label>
                  <div className="mt-1">
                    <input
                      id="abbreviation"
                      name="abbreviation"
                      type="text"
                      value={formData.abbreviation}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm text-black"
                    />
                  </div>
                </div>

                {/* Specialized Sports - Tag-based selection */}
                <div>
                  <label htmlFor="specializedSports" className="block text-sm font-medium text-gray-700">
                    Specialized Sports
                  </label>
                  <div className="mt-1">
                    {/* Selected sports tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.specializedSports.map(sportId => {
                        const sport = availableSports.find(s => s._id === sportId);
                        return sport && (
                          <div key={sport._id} className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                            {sport.sportName}
                            <button 
                              type="button" 
                              className="ml-1.5 text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  specializedSports: formData.specializedSports.filter(id => id !== sport._id)
                                });
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sports dropdown */}
                    <div className="relative">
                      <input 
                        type="text" 
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm text-black"
                        placeholder="Search and select sports"
                        onClick={() => document.getElementById('sports-dropdown')?.classList.remove('hidden')}
                        onBlur={() => {
                          // Delay hiding to allow click on options
                          setTimeout(() => {
                            document.getElementById('sports-dropdown')?.classList.add('hidden');
                          }, 200);
                        }}
                        id="sports-search"
                        onChange={(e) => {
                          // Show dropdown when typing
                          document.getElementById('sports-dropdown')?.classList.remove('hidden');
                        }}
                      />
                      
                      {/* Dropdown */}
                      <div id="sports-dropdown" className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm hidden">
                        {isLoadingSports ? (
                          <div className="text-center py-2 text-gray-500">Loading sports...</div>
                        ) : availableSports.length === 0 ? (
                          <div className="text-center py-2 text-gray-500">No sports available</div>
                        ) : (
                          <ul className="divide-y divide-gray-200">
                            {availableSports
                              .filter(sport => {
                                const searchValue = (document.getElementById('sports-search') as HTMLInputElement)?.value.toLowerCase();
                                return !searchValue || sport.sportName.toLowerCase().includes(searchValue);
                              })
                              .filter(sport => !formData.specializedSports.includes(sport._id))
                              .map(sport => (
                                <li
                                  key={sport._id}
                                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      specializedSports: [...formData.specializedSports, sport._id]
                                    });
                                    // Clear search after selection
                                    if (document.getElementById('sports-search')) {
                                      (document.getElementById('sports-search') as HTMLInputElement).value = '';
                                    }
                                  }}
                                >
                                  <div className="flex items-center">
                                    <span className="font-medium">{sport.sportName}</span>
                                    <span className="ml-2 text-sm text-gray-500">{sport.sportId}</span>
                                  </div>
                                  {sport.description && (
                                    <p className="text-xs text-gray-500 truncate">{sport.description}</p>
                                  )}
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Rest of the form remains unchanged */}
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Contact Information</h4>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm text-black"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="contact.phone"
                      name="contact.phone"
                      type="tel"
                      value={formData.contact.phone}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm text-black"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="contact.website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <div className="mt-1">
                    <input
                      id="contact.website"
                      name="contact.website"
                      type="url"
                      value={formData.contact.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm text-black pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      // Hide password icon (eye-off)
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      // Show password icon (eye)
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm text-black pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      // Hide password icon (eye-off)
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      // Show password icon (eye)
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !!passwordError}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] hover:from-[#2712c2] hover:to-[#7a15c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Register Organization'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoverBodyRegister;