import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';  // <-- Changed from 'next/router' to 'next/navigation'

interface School {
  _id: string;
  name: string;
  location: {
    district: string;
    province: string;
  };
  students?: number;
  verified: boolean;
  adminVerified: boolean;
  status?: string;
  contact?: {
    email: string;
    phone?: string;
  };
}

// Form data interface for adding a new school
interface SchoolFormData {
  name: string;
  password: string;
  confirmPassword: string;
  location: {
    district: string;
    province: string;
    zonal?: string;
  };
  contact: {
    email: string;
    phone?: string;
  };
  principalName?: string;
}

// Sri Lankan provinces and districts for the form
const sriLankanProvinces = [
  'Central Province',
  'Eastern Province',
  'North Central Province',
  'Northern Province',
  'North Western Province',
  'Sabaragamuwa Province',
  'Southern Province',
  'Uva Province',
  'Western Province'
];

// Mapping of provinces to their districts
const districtsByProvince: Record<string, string[]> = {
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Eastern Province': ['Ampara', 'Batticaloa', 'Trincomalee'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
  'North Western Province': ['Kurunegala', 'Puttalam'],
  'Sabaragamuwa Province': ['Kegalle', 'Ratnapura'],
  'Southern Province': ['Galle', 'Hambantota', 'Matara'],
  'Uva Province': ['Badulla', 'Monaragala'],
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara']
};

// Modify the fetcher function to log more detailed error information
const fetcher = async (url: string) => {
  try {
    console.log('Fetching from:', url);
    const res = await fetch(url);
    
    if (!res.ok) {
      // Try to get the response body for more details
      let errorMessage = `Error ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        console.error('API error response body:', errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (parseErr) {
        console.error('Could not parse error response:', parseErr);
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await res.json();
    console.log('API response data:', data);
    return data;
  } catch (err) {
    console.error('Fetcher error details:', err);
    throw err;
  }
};

const SchoolsContent: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  
  // New school form state
  const [schoolForm, setSchoolForm] = useState<SchoolFormData>({
    name: '',
    password: '',
    confirmPassword: '',
    location: {
      district: '',
      province: '',
      zonal: ''
    },
    contact: {
      email: '',
      phone: ''
    },
    principalName: ''
  });
  
  // Fetch schools with SWR
  const { data, error, isLoading, isValidating, mutate: refreshData } = useSWR('/api/school', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    errorRetryCount: 2, // Reduced retry count
    errorRetryInterval: 2000,
    onSuccess: (data) => {
      console.log("SWR success:", data);
      setInitialLoading(false);
    },
    onError: (err) => {
      console.error("SWR error:", err);
      setInitialLoading(false);
    }
  });

  // Add console logging to debug the response
  useEffect(() => {
    console.log("SWR data state:", { data, error, isLoading, isValidating });
  }, [data, error, isLoading, isValidating]);

  // Force exit loading state after a shorter timeout (5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialLoading) {
        console.log('Forcing exit from loading state after timeout');
        setInitialLoading(false);
      }
    }, 5000); // Reduced from 10000 to 5000
    
    return () => clearTimeout(timer);
  }, [initialLoading]);

  const handleVerify = async (id: string) => {
    try {
      setActionInProgress(id);
      console.log(`Verifying school: ${id}`);
      
      // Get school details first to send email
      const schoolResponse = await fetch(`/api/school?id=${id}`);
      if (!schoolResponse.ok) {
        throw new Error('Failed to get school details for verification');
      }
      
      const schoolData = await schoolResponse.json();
      const schoolEmail = schoolData.contact?.email;
      const schoolName = schoolData.name;
      
      if (!schoolEmail) {
        throw new Error('School email not found');
      }
      
      // Update school verification status using PATCH endpoint
      const response = await fetch(`/api/school?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminVerified: true,
          verified: true,
          status: 'active'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Verification error response:', errorData);
        throw new Error(errorData.error || 'Failed to verify school');
      }
      
      // Optionally send verification email
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: schoolEmail,
            displayName: schoolName,
            subject: 'School Verification Approved',
            message: 'Your school has been verified and is now active on GoalX. You can now log in and access all features.',
            actionUrl: `${window.location.origin}/login`,
            actionText: 'Log In Now'
          }),
        });
      } catch (emailErr) {
        console.warn('Failed to send verification email, but school was verified', emailErr);
      }
      
      // Revalidate data
      mutate('/api/school');
      
      alert('School verified successfully!');
    } catch (err) {
      console.error('Error verifying school:', err);
      alert('Failed to verify school. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Are you sure you want to reject this school? This will delete the school from the system.')) {
      try {
        setActionInProgress(id);
        console.log(`Rejecting school: ${id}`);
        
        // First get the school details to have email information
        const schoolResponse = await fetch(`/api/school?id=${id}`);
        if (!schoolResponse.ok) {
          throw new Error('Failed to get school details for rejection');
        }
        
        const schoolData = await schoolResponse.json();
        const schoolEmail = schoolData.contact?.email;
        const schoolName = schoolData.name;
        
        // Optionally send rejection email
        if (schoolEmail) {
          try {
            await fetch('/api/email/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: schoolEmail,
                displayName: schoolName,
                subject: 'School Verification Rejected',
                message: 'We regret to inform you that your school\'s verification request has been rejected.',
                actionUrl: `${window.location.origin}/contact`,
                actionText: 'Contact Admin'
              }),
            });
          } catch (emailErr) {
            console.warn('Failed to send rejection email', emailErr);
          }
        }
        
        // Use DELETE endpoint to reject the school
        const deleteResponse = await fetch(`/api/school?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!deleteResponse.ok) {
          throw new Error('Failed to delete rejected school');
        }
        
        // Revalidate data
        mutate('/api/school');
        
        alert('School rejected and deleted successfully!');
      } catch (err) {
        console.error('Error rejecting school:', err);
        alert('Failed to reject school. Please try again.');
      } finally {
        setActionInProgress(null);
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like location.province
      const [parent, child] = name.split('.');
      setSchoolForm(prev => {
        // Use type assertion to ensure TypeScript treats this as an object
        const parentObj = prev[parent as keyof SchoolFormData] as Record<string, any>;
        
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
      
      // Auto-reset district when province changes
      if (name === 'location.province') {
        setSchoolForm(prev => ({
          ...prev,
          location: {
            ...prev.location,
            district: ''
          }
        }));
      }
    } else {
      // Handle top-level properties
      setSchoolForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate the form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Check required fields
    if (!schoolForm.name.trim()) {
      errors['name'] = 'School name is required';
    }
    
    if (!schoolForm.password) {
      errors['password'] = 'Password is required';
    } else if (schoolForm.password.length < 6) {
      errors['password'] = 'Password must be at least 6 characters';
    }
    
    if (schoolForm.password !== schoolForm.confirmPassword) {
      errors['confirmPassword'] = 'Passwords do not match';
    }
    
    if (!schoolForm.location.province) {
      errors['location.province'] = 'Province is required';
    }
    
    if (!schoolForm.location.district) {
      errors['location.district'] = 'District is required';
    }
    
    if (!schoolForm.contact.email) {
      errors['contact.email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(schoolForm.contact.email)) {
      errors['contact.email'] = 'Invalid email format';
    }
    
    // Set form errors
    setFormErrors(errors);
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const schoolData = {
        ...schoolForm,
        verified: true, // Auto-verify when admin creates
        adminVerified: true, // Auto-approve when admin creates
        status: 'active'
      };
      
      // Remove confirmPassword as it's not needed in the API
      delete (schoolData as any).confirmPassword;
      
      // Make API call to create school
      const response = await fetch('/api/school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.field) {
          // Handle duplicate key errors
          setFormErrors({
            [errorData.field]: `This ${errorData.field.split('.').pop()} is already taken`
          });
          throw new Error(`Duplicate ${errorData.field}`);
        } else {
          throw new Error(errorData.error || 'Failed to create school');
        }
      }
      
      // Reset form and close modal on success
      setSchoolForm({
        name: '',
        password: '',
        confirmPassword: '',
        location: {
          district: '',
          province: '',
          zonal: ''
        },
        contact: {
          email: '',
          phone: ''
        },
        principalName: ''
      });
      
      setShowAddModal(false);
      
      // Refresh schools list
      mutate('/api/school');
      
      alert('School added successfully!');
    } catch (err) {
      console.error('Error creating school:', err);
      if (!(err as Error).message.includes('Duplicate')) {
        alert(`Failed to create school: ${(err as Error).message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Make sure data is properly initialized
  const schools = data?.schools || [];
  
  // Filter schools based on adminVerified status
  const filteredSchools = schools.filter((school: School) => 
    searchTerm === '' || school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingSchools = filteredSchools.filter((school: School) => !school.adminVerified);
  const verifiedSchools = filteredSchools.filter((school: School) => school.adminVerified);

  const showLoading = (isLoading || isValidating) && initialLoading;
  const showError = error && !showLoading;
  const hasSchools = data?.schools && Array.isArray(data.schools);

  // Modify the retry button to use refreshData directly
  const handleRetry = () => {
    setInitialLoading(true);
    refreshData(); // Using the mutate function from useSWR directly
  };

  // Add navigation function to view school details
  const navigateToSchoolDetails = (schoolId: string) => {
    router.push(`/admin/dashboard/${schoolId}`);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">School Management</h1>
      
      {/* Search and Add Button Row */}
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#1e0fbf] text-white px-4 py-2 rounded-lg hover:bg-[#160b87] transition-colors flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add School
        </button>
      </div>
      
      {showLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e0fbf]"></div>
          <span className="ml-3 text-gray-600">Loading schools...</span>
        </div>
      ) : showError ? (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 flex flex-col">
          <div className="flex items-center justify-between">
            <span>Failed to load schools. Please try again later.</span>
            <button 
              onClick={handleRetry}
              className="bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
          <div className="mt-2 text-sm overflow-auto max-h-24">
            Error details: {error?.message || 'Unknown error'}
          </div>
        </div>
      ) : !hasSchools ? (
        <div className="text-center py-4 border rounded-lg bg-gray-50">
          No schools found. Add a school to get started.
        </div>
      ) : (
        <>
          {/* Pending Verification Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Verification ({pendingSchools.length})</h2>
            {pendingSchools.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-yellow-50">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingSchools.map((school: School) => (
                      <tr key={school._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">
                          {school.name}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {school.location.district}, {school.location.province}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {school.contact?.email}
                          {school.contact?.phone && <div>{school.contact.phone}</div>}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleVerify(school._id)}
                            className={`bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 ${actionInProgress === school._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={actionInProgress === school._id}
                          >
                            Verify
                          </button>
                          <button 
                            onClick={() => handleReject(school._id)}
                            className={`bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ${actionInProgress === school._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={actionInProgress === school._id}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 border rounded-lg bg-gray-50">
                No schools pending verification
              </div>
            )}
          </div>

          {/* Verified Schools Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Verified Schools ({verifiedSchools.length})</h2>
            {verifiedSchools.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {verifiedSchools.map((school: School) => (
                      <tr 
                        key={school._id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigateToSchoolDetails(school._id)}
                      >
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{school.name}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {school.location.district}, {school.location.province}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {school.contact?.email}
                          {school.contact?.phone && <div>{school.contact.phone}</div>}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 border rounded-lg bg-gray-50">
                No verified schools found
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New School</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* School Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  School Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={schoolForm.name}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter school name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
              
              {/* Location */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location.province" className="block text-sm font-medium text-gray-700 mb-1">
                    Province*
                  </label>
                  <select
                    id="location.province"
                    name="location.province"
                    value={schoolForm.location.province}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg ${formErrors['location.province'] ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select a province</option>
                    {sriLankanProvinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                  {formErrors['location.province'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['location.province']}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="location.district" className="block text-sm font-medium text-gray-700 mb-1">
                    District*
                  </label>
                  <select
                    id="location.district"
                    name="location.district"
                    value={schoolForm.location.district}
                    onChange={handleInputChange}
                    disabled={!schoolForm.location.province}
                    className={`w-full p-2 border rounded-lg ${formErrors['location.district'] ? 'border-red-500' : 'border-gray-300'} ${!schoolForm.location.province ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">Select a district</option>
                    {schoolForm.location.province && districtsByProvince[schoolForm.location.province]?.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {formErrors['location.district'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['location.district']}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="location.zonal" className="block text-sm font-medium text-gray-700 mb-1">
                  Zonal Education Office (Optional)
                </label>
                <input
                  type="text"
                  id="location.zonal"
                  name="location.zonal"
                  value={schoolForm.location.zonal || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter zonal education office"
                />
              </div>
              
              {/* Contact Information */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact.email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="contact.email"
                    name="contact.email"
                    value={schoolForm.contact.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg ${formErrors['contact.email'] ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="school@example.com"
                  />
                  {formErrors['contact.email'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['contact.email']}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="contact.phone"
                    name="contact.phone"
                    value={schoolForm.contact.phone || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              {/* Principal Name */}
              <div className="mb-4">
                <label htmlFor="principalName" className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Name (Optional)
                </label>
                <input
                  type="text"
                  id="principalName"
                  name="principalName"
                  value={schoolForm.principalName || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter principal's name"
                />
              </div>
              
              {/* Password Section */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password*
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={schoolForm.password}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter password"
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password*
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={schoolForm.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-lg ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Confirm password"
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-[#1e0fbf] text-white rounded-lg hover:bg-[#160b87] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : 'Add School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolsContent;