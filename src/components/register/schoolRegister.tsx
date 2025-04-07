'use client';

import { useState } from 'react';
import { SriLankanProvince, SriLankanDistrict } from '@/types/locationTypes';
import { useRouter } from 'next/navigation';

const SchoolRegister = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    principalName: '',
    location: {
      province: '',
      district: '',
      zonal: '',
    },
    contact: {
      email: '',
      phone: '',
    }
  });

  // Get districts based on selected province
  const getDistricts = () => {
    // This would be populated from your locationTypes
    return Object.values(SriLankanDistrict);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password,
          principalName: formData.principalName,
          location: {
            province: formData.location.province,
            district: formData.location.district,
            zonal: formData.location.zonal,
          },
          contact: {
            email: formData.contact.email,
            phone: formData.contact.phone,
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register school');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/verify?type=school&email=${encodeURIComponent(formData.contact.email)}`);
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
          School Registration
        </h2>
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
                    Registration successful! We've sent a 4-digit verification code to your school email.
                  </p>
                  <p className="mt-2 text-sm text-green-700">
                    Redirecting to verification page...
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

              {/* School Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  School Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm"
                  />
                </div>
              </div>

              {/* Principal Name */}
              <div>
                <label htmlFor="principalName" className="block text-sm font-medium text-gray-700">
                  Principal Name
                </label>
                <div className="mt-1">
                  <input
                    id="principalName"
                    name="principalName"
                    type="text"
                    value={formData.principalName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Location Details</h4>
                
                {/* Province */}
                <div>
                  <label htmlFor="location.province" className="block text-sm font-medium text-gray-700">
                    Province
                  </label>
                  <div className="mt-1">
                    <select
                      id="location.province"
                      name="location.province"
                      required
                      value={formData.location.province}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm"
                    >
                      <option value="">Select Province</option>
                      {Object.values(SriLankanProvince).map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* District */}
                <div>
                  <label htmlFor="location.district" className="block text-sm font-medium text-gray-700">
                    District
                  </label>
                  <div className="mt-1">
                    <select
                      id="location.district"
                      name="location.district"
                      required
                      value={formData.location.district}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm"
                    >
                      <option value="">Select District</option>
                      {getDistricts().map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Zonal */}
                <div>
                  <label htmlFor="location.zonal" className="block text-sm font-medium text-gray-700">
                    Zonal Education Office
                  </label>
                  <div className="mt-1">
                    <input
                      id="location.zonal"
                      name="location.zonal"
                      type="text"
                      value={formData.location.zonal}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Contact Information</h4>
                
                {/* Email */}
                <div>
                  <label htmlFor="contact.email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="contact.email"
                      name="contact.email"
                      type="email"
                      required
                      value={formData.contact.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <div className="mt-1">
                    <input
                      id="contact.phone"
                      name="contact.phone"
                      type="tel"
                      value={formData.contact.phone}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] hover:from-[#2712c2] hover:to-[#7a15c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf] disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Register School'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolRegister;