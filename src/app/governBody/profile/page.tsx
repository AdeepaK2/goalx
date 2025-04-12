"use client";
import React, { useState, useEffect } from "react";
import { 
  FiMail, FiPhone, FiUser, FiHash, FiType, FiFileText, 
  FiUploadCloud, FiGlobe, FiActivity, FiCheckCircle, FiAlertCircle,
  FiImage, FiArrowLeft
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Define the structure of governing body data based on schema
interface GovernBody {
  id?: string;
  governBodyId: string;
  name: string;
  abbreviation?: string;
  specializedSport?: string;
  description?: string;
  logoUrl?: string;
  contact?: {
    phone?: string;
    website?: string;
  };
  email: string;
  verified: boolean;
  adminVerified: boolean;
}

// Default empty state for new governing body profiles
const defaultGovernBody: GovernBody = {
  governBodyId: "",
  name: "",
  abbreviation: "",
  specializedSport: "",
  description: "",
  logoUrl: "",
  contact: {
    phone: "",
    website: "",
  },
  email: "",
  verified: false,
  adminVerified: false,
};

const GovernBodyProfile = () => {
  const router = useRouter();
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  // State for tracking whether we're creating a new profile
  const [isNewProfile, setIsNewProfile] = useState(false);
  
  // State for the form data
  const [formData, setFormData] = useState<GovernBody>(defaultGovernBody);
  
  // State for UI
  const [isDirty, setIsDirty] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Extract ID from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');
    
    if (idFromUrl) {
      fetchGovernBodyData(idFromUrl);
    } else {
      // Handle case where no ID is provided - set up for creating a new profile
      setIsNewProfile(true);
      setIsLoading(false);
      // Generate a temporary ID for the new profile
      setFormData({
        ...defaultGovernBody,
        governBodyId: `new-${Date.now()}` // Temporary ID that will be replaced on save
      });
      setDebugInfo("No ID provided, entering creation mode");
    }
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError("Loading timed out. Please refresh and try again.");
        setDebugInfo("Loading timeout triggered after 15 seconds");
      }
    }, 15000);
    
    return () => clearTimeout(safetyTimeout);
  }, []);
  
  // Fetch the govern body data from API
  const fetchGovernBodyData = async (id: string) => {
    try {
      setIsLoading(true);
      setDebugInfo(`Fetching data for ID: ${id}`);
      
      const response = await fetch(`/api/govern?id=${id}`);
      setDebugInfo(`API Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDebugInfo(`Data received: ${JSON.stringify(data).substring(0, 100)}...`);
      
      // Map API response to our state format
      setFormData({
        id: data._id || data.id,
        governBodyId: data.governBodyId || id,
        name: data.name || "",
        abbreviation: data.abbreviation || "",
        specializedSport: data.specializedSport || "",
        description: data.description || "",
        logoUrl: data.logoUrl || "",
        contact: {
          phone: data.contact?.phone || "",
          website: data.contact?.website || "",
        },
        email: data.email || "",
        verified: Boolean(data.verified),
        adminVerified: Boolean(data.adminVerified),
      });
      
      // Set logo preview if available
      if (data.logoUrl) {
        setLogoPreview(getLogoUrl(data.logoUrl));
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch governing body details");
      setDebugInfo(err instanceof Error ? err.stack || "No stack trace" : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to get proper logo URL
  const getLogoUrl = (url: string) => {
    if (!url) return null;
    
    if (url.startsWith('/api/file/download')) {
      return url;
    }
    
    if (url.startsWith('http')) {
      return `/api/file/download?fileUrl=${encodeURIComponent(url)}`;
    }
    
    return `/api/file/download?file=${encodeURIComponent(url)}`;
  };
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setIsDirty(true);
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setIsDirty(true);
    } else if (file) {
      toast.error("Please select a valid image file");
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setDebugInfo("Starting update process");
      
      // First upload the logo if changed
      let updatedLogoUrl = formData.logoUrl;
      
      if (logoFile) {
        setDebugInfo("Uploading logo file");
        const formDataForUpload = new FormData();
        formDataForUpload.append('file', logoFile);
        
        const uploadResponse = await fetch('/api/file/upload', {
          method: 'POST',
          body: formDataForUpload
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload logo: ${uploadResponse.statusText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        updatedLogoUrl = uploadResult.url;
        setDebugInfo(`Logo uploaded, new URL: ${updatedLogoUrl}`);
      }
      
      // Prepare data for update
      const updateData = {
        ...formData,
        logoUrl: updatedLogoUrl
      };
      
      // Determine if creating new or updating existing
      const apiMethod = isNewProfile ? 'POST' : 'PATCH';
      const apiEndpoint = isNewProfile 
        ? '/api/govern' 
        : `/api/govern?id=${formData.id || formData.governBodyId}`;
      
      setDebugInfo(`Sending ${apiMethod} to API: ${apiEndpoint}`);
      
      const updateResponse = await fetch(apiEndpoint, {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to ${isNewProfile ? 'create' : 'update'} profile: ${updateResponse.statusText}`);
      }
      
      const updatedData = await updateResponse.json();
      setDebugInfo(`${isNewProfile ? 'Creation' : 'Update'} successful`);
      
      // Update state with response data
      const responseData = updatedData.data || updatedData;
      
      // If this was a new profile, redirect to the proper edit URL
      if (isNewProfile && (responseData._id || responseData.id)) {
        const newId = responseData._id || responseData.id;
        toast.success("Profile created successfully!");
        router.push(`/govern-body?id=${newId}`);
        return;
      }
      
      // Otherwise update the form data
      setFormData({
        id: responseData._id || responseData.id,
        governBodyId: responseData.governBodyId,
        name: responseData.name || "",
        abbreviation: responseData.abbreviation || "",
        specializedSport: responseData.specializedSport || "",
        description: responseData.description || "",
        logoUrl: responseData.logoUrl || "",
        contact: {
          phone: responseData.contact?.phone || "",
          website: responseData.contact?.website || "",
        },
        email: responseData.email || "",
        verified: Boolean(responseData.verified),
        adminVerified: Boolean(responseData.adminVerified),
      });
      
      // If logo was updated, update preview
      if (updatedLogoUrl !== formData.logoUrl) {
        setLogoPreview(getLogoUrl(updatedLogoUrl ?? ""));
        setLogoFile(null);
      }
      
      setIsDirty(false);
      setIsNewProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(`Error ${isNewProfile ? 'creating' : 'updating'} profile:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${isNewProfile ? 'create' : 'update'} profile`);
      setDebugInfo(err instanceof Error ? err.stack || "No stack trace" : "Unknown error type");
      toast.error(err instanceof Error ? err.message : `Failed to ${isNewProfile ? 'create' : 'update'} profile`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle navigation back to list page
  const handleBackToList = () => {
    router.push('/governBody'); // Adjust this URL based on your application's routing
  };
  
  // UI styling
  const inputStyle = "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const sectionStyle = "mb-6";
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white text-center">Loading Profile</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center mt-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-700"></div>
            <p className="mt-4 text-gray-600">Loading governing body profile...</p>
            {debugInfo && <p className="mt-2 text-xs text-gray-500">{debugInfo}</p>}
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state - with improved guidance
  if (error && !isNewProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white text-center">Error</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading profile</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                {debugInfo && <p className="mt-2 text-xs text-gray-500">{debugInfo}</p>}
                <div className="mt-3 flex space-x-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-medium text-red-800 hover:text-red-600 underline"
                  >
                    Reload page
                  </button>
                  <button
                    onClick={handleBackToList}
                    className="text-sm font-medium text-indigo-800 hover:text-indigo-600 underline"
                  >
                    Back to list
                  </button>
                  <button
                    onClick={() => {
                      setIsNewProfile(true);
                      setError(null);
                      setFormData(defaultGovernBody);
                    }}
                    className="text-sm font-medium text-green-800 hover:text-green-600 underline"
                  >
                    Create new profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main component render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center">
            <button
              onClick={handleBackToList}
              className="absolute left-8 text-white flex items-center hover:text-indigo-200 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to List
            </button>
            <h1 className="text-3xl font-bold text-white text-center">
              {isNewProfile ? "Create Governing Body" : formData.name || "Governing Body Profile"}
            </h1>
          </div>
          
          {!isNewProfile && formData.abbreviation && (
            <p className="mt-2 text-xl text-indigo-200 text-center">
              {formData.abbreviation}
            </p>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-800">
              {isNewProfile ? "New Governing Body" : "Governing Body Details"}
            </h2>
            {!isNewProfile && (
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${formData.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {formData.verified ? 'Verified' : 'Unverified'}
                </span>
                
                <span className={`px-2 py-1 text-xs rounded-full ${formData.adminVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {formData.adminVerified ? 'Admin Approved' : 'Pending Approval'}
                </span>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Information Section */}
            <div className={sectionStyle}>
              <h3 className="font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID - Read Only or Hidden if New */}
                {!isNewProfile && (
                  <div>
                    <label htmlFor="governBodyId" className={labelStyle}>
                      <div className="flex items-center">
                        <FiHash className="mr-2 text-purple-600" />
                        <span>Governing Body ID</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      id="governBodyId"
                      name="governBodyId"
                      value={formData.governBodyId}
                      readOnly
                      className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                    />
                  </div>
                )}
                
                {/* Name */}
                <div className={isNewProfile ? 'md:col-span-2' : ''}>
                  <label htmlFor="name" className={labelStyle}>
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-purple-600" />
                      <span>Organization Name</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputStyle}
                    required
                  />
                </div>
                
                {/* Abbreviation */}
                <div>
                  <label htmlFor="abbreviation" className={labelStyle}>
                    <div className="flex items-center">
                      <FiType className="mr-2 text-purple-600" />
                      <span>Abbreviation (e.g., FIFA)</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="abbreviation"
                    name="abbreviation"
                    value={formData.abbreviation || ''}
                    onChange={handleInputChange}
                    className={inputStyle}
                  />
                </div>
                
                {/* Specialized Sport */}
                <div>
                  <label htmlFor="specializedSport" className={labelStyle}>
                    <div className="flex items-center">
                      <FiActivity className="mr-2 text-purple-600" />
                      <span>Sport</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="specializedSport"
                    name="specializedSport"
                    value={formData.specializedSport || ''}
                    onChange={handleInputChange}
                    className={inputStyle}
                    placeholder="e.g., Football, Cricket, Basketball"
                  />
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className={sectionStyle}>
              <h3 className="font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelStyle}>
                    <div className="flex items-center">
                      <FiMail className="mr-2 text-purple-600" />
                      <span>Email Address</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputStyle}
                    required
                  />
                </div>
                
                {/* Phone */}
                <div>
                  <label htmlFor="contactPhone" className={labelStyle}>
                    <div className="flex items-center">
                      <FiPhone className="mr-2 text-purple-600" />
                      <span>Phone Number</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contact.phone"
                    value={formData.contact?.phone || ''}
                    onChange={handleInputChange}
                    className={inputStyle}
                    placeholder="+1 (123) 456-7890"
                  />
                </div>
                
                {/* Website */}
                <div className="md:col-span-2">
                  <label htmlFor="contactWebsite" className={labelStyle}>
                    <div className="flex items-center">
                      <FiGlobe className="mr-2 text-purple-600" />
                      <span>Website</span>
                    </div>
                  </label>
                  <input
                    type="url"
                    id="contactWebsite"
                    name="contact.website"
                    value={formData.contact?.website || ''}
                    onChange={handleInputChange}
                    className={inputStyle}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
            
            {/* Logo Upload */}
            <div className={sectionStyle}>
              <h3 className="font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Organization Logo</h3>
              
              <div className="flex flex-col md:flex-row md:space-x-6">
                {/* Preview */}
                <div className="mb-4 md:mb-0 flex-shrink-0">
                  <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo Preview" 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          e.currentTarget.src = "/no-image.png";
                        }}
                      />
                    ) : (
                      <FiImage className="text-gray-400 w-12 h-12" />
                    )}
                  </div>
                </div>
                
                {/* Upload */}
                <div className="flex-grow">
                  <label htmlFor="logoUpload" className={labelStyle}>Upload New Logo</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-purple-500 transition-colors cursor-pointer">
                    <div className="space-y-1 text-center">
                      <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="logoUpload" className="relative cursor-pointer font-medium text-purple-600 hover:text-purple-500">
                          <span>Upload a file</span>
                          <input 
                            id="logoUpload" 
                            name="logoUpload" 
                            type="file" 
                            accept="image/*"
                            className="sr-only" 
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  
                  {logoFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {logoFile.name} ({Math.round(logoFile.size / 1024)} KB)
                      <button 
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(formData.logoUrl ? getLogoUrl(formData.logoUrl) : null);
                        }}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className={sectionStyle}>
              <h3 className="font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">About the Organization</h3>
              
              <div>
                <label htmlFor="description" className={labelStyle}>
                  <div className="flex items-center">
                    <FiFileText className="mr-2 text-purple-600" />
                    <span>Description</span>
                  </div>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className={`${inputStyle} resize-none`}
                  placeholder="Provide a brief description of your organization..."
                ></textarea>
              </div>
            </div>
            
            {/* Verification Status - only show for existing profiles */}
            {!isNewProfile && (
              <div className={sectionStyle}>
                <h3 className="font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Verification Status</h3>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <FiCheckCircle className={`mr-3 ${formData.verified ? 'text-green-500' : 'text-gray-400'}`} />
                    <div>
                      <span className="font-medium">Email Verification:</span>
                      <span className={`ml-2 ${formData.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {formData.verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FiCheckCircle className={`mr-3 ${formData.adminVerified ? 'text-blue-500' : 'text-gray-400'}`} />
                    <div>
                      <span className="font-medium">Admin Approval:</span>
                      <span className={`ml-2 ${formData.adminVerified ? 'text-blue-600' : 'text-gray-600'}`}>
                        {formData.adminVerified ? 'Approved' : 'Pending Review'}
                      </span>
                    </div>
                  </div>
                  
                  {!formData.verified && (
                    <p className="mt-3 text-sm text-gray-600">
                      Email verification is required to access all features. Please check your inbox for a verification email.
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBackToList}
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!isDirty || isLoading}
                className={`${
                  !isDirty || isLoading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                {isLoading ? 'Saving...' : isNewProfile ? 'Create Profile' : 'Save Changes'}
              </button>
            </div>
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <div className="mt-8 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-48">
                <p className="text-gray-500 mb-1">Debug Info:</p>
                <pre>{debugInfo}</pre>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default GovernBodyProfile;