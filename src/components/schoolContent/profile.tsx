import React, { useState, useEffect, useCallback } from "react";
import { FiMapPin, FiMail, FiPhone, FiUser, FiHash, FiCompass, FiLoader, FiFileText, FiImage, FiUploadCloud } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Image from "next/image";

// Define the structure of school data
interface SchoolLocation {
    district: string;
    zonal?: string;
    province: string;
    coordinates?: {
        latitude?: number;
        longitude?: number;
    };
}

interface SchoolContact {
    email: string;
    phone?: string;
}

interface School {
    id?: string;
    schoolId: string;
    sid?: number;
    name: string;
    profilePicUrl?: string;
    location: SchoolLocation;
    contact: SchoolContact;
    principalName?: string;
    verified: boolean;
}

const Profile = () => {
    const [schoolData, setSchoolData] = useState<School | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

    // Function to generate correct download URL for profile pictures
    const getProfileImageUrl = (imageUrl: string | null) => {
        if (!imageUrl) return null;
        
        // Avoid processing URLs that are already pointing to our API
        if (imageUrl.startsWith('/api/file/download')) {
            return imageUrl;
        }

        // Check if it's a full URL 
        if (imageUrl.startsWith('http')) {
            return `/api/file/download?fileUrl=${encodeURIComponent(imageUrl)}`;
        }
        
        // Handle just the filename case
        return `/api/file/download?file=${encodeURIComponent(imageUrl)}`;
    };

    // Fetch school data on component mount
    useEffect(() => {
        const fetchSchoolData = async () => {
            try {
                setIsLoading(true);
                
                // Step 1: Get authenticated school basic info
                const authResponse = await fetch('/api/auth/school/me');
                
                if (!authResponse.ok) {
                    throw new Error(`Error authenticating: ${authResponse.statusText}`);
                }
                
                const authData = await authResponse.json();
                
                // Get the school ID from auth response
                const schoolInfo = authData.school || authData;
                
                if (!schoolInfo || (!schoolInfo.id && !schoolInfo._id && !schoolInfo.schoolId)) {
                    throw new Error("Failed to get school identity");
                }
                
                // Extract the ID to use in the next request
                const schoolId = schoolInfo.id || schoolInfo._id || schoolInfo.schoolId;
                
                console.log("Authenticated as school with ID:", schoolId);
                
                // Step 2: Now fetch complete school details from the /api/school endpoint
                const detailsResponse = await fetch(`/api/school?id=${schoolId}`);
                
                if (!detailsResponse.ok) {
                    throw new Error(`Error fetching complete school details: ${detailsResponse.statusText}`);
                }
                
                const detailsData = await detailsResponse.json();
                
                // The school details might be directly in the response or nested
                const completeSchoolInfo = detailsData.school || detailsData;
                
                console.log("Complete school data received:", completeSchoolInfo);
                
                // Transform API response to match our School interface
                setSchoolData({
                    id: completeSchoolInfo.id || completeSchoolInfo._id,
                    schoolId: completeSchoolInfo.schoolId || '',
                    sid: completeSchoolInfo.sid,
                    name: completeSchoolInfo.name || '',
                    profilePicUrl: completeSchoolInfo.profilePicUrl || completeSchoolInfo.profilePicture,
                    location: {
                        district: completeSchoolInfo.location?.district || '',
                        zonal: completeSchoolInfo.location?.zonal || '',
                        province: completeSchoolInfo.location?.province || '',
                        coordinates: {
                            latitude: completeSchoolInfo.location?.coordinates?.latitude || 0,
                            longitude: completeSchoolInfo.location?.coordinates?.longitude || 0
                        }
                    },
                    contact: {
                        email: completeSchoolInfo.contact?.email || completeSchoolInfo.email || '',
                        phone: completeSchoolInfo.contact?.phone || completeSchoolInfo.phone || ''
                    },
                    principalName: completeSchoolInfo.principalName || '',
                    verified: completeSchoolInfo.verified || false
                });
                
                // Set profile pic preview if available
                const profilePicUrl = completeSchoolInfo.profilePicUrl || completeSchoolInfo.profilePicture;
                if (profilePicUrl) {
                    console.log("Setting profile pic preview:", profilePicUrl);
                    setProfilePicPreview(getProfileImageUrl(profilePicUrl));
                }
                
                setError(null);
            } catch (err) {
                console.error('Error fetching school data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load school data');
                toast.error('Failed to load school profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchoolData();
    }, []);

    // Effect to create/revoke object URL for preview
    useEffect(() => {
        let objectUrl: string | null = null;
        if (profilePicFile) {
            objectUrl = URL.createObjectURL(profilePicFile);
            setProfilePicPreview(objectUrl);
            setIsDirty(true);
        } else {
            // Use the download API for stored profile pictures
            const picUrl = schoolData?.profilePicUrl;
            if (picUrl) {
                setProfilePicPreview(getProfileImageUrl(picUrl));
            } else {
                setProfilePicPreview(null);
            }
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [profilePicFile, schoolData?.profilePicUrl]);

    // Function to handle input changes and update nested state
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!schoolData) return;
        
        const { name, value } = e.target;
        const keys = name.split('.'); // Handle nested properties like 'location.district'

        setSchoolData(prevData => {
            if (!prevData) return null;
            
            let updatedData = { ...prevData };
            let currentLevel: any = updatedData;

            for (let i = 0; i < keys.length - 1; i++) {
                // Ensure nested objects exist
                if (!currentLevel[keys[i]]) {
                    currentLevel[keys[i]] = {};
                }
                currentLevel[keys[i]] = { ...currentLevel[keys[i]] };
                currentLevel = currentLevel[keys[i]];
            }

            // Handle coordinate conversion to number
            if (name === 'location.coordinates.latitude' || name === 'location.coordinates.longitude') {
                 currentLevel[keys[keys.length - 1]] = parseFloat(value) || 0; 
            } else {
                 currentLevel[keys[keys.length - 1]] = value;
            }

            return updatedData;
        });

        setIsDirty(true); // Mark as dirty whenever a change occurs
    };

    // Handler for file selection
    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setProfilePicFile(file);
            console.log("Profile pic file set:", file.name);
        } else {
            setProfilePicFile(null);
            if (file) toast.error("Please select a valid image file.");
        }
    };

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    }, []);

    // Click handler for the drop zone
    const handleDropZoneClick = () => {
        document.getElementById('profilePicInput')?.click();
    };

    // Function to handle the update action
    const handleUpdate = async () => {
        if (!schoolData) return;
        
        try {
            setIsSaving(true);
            
            // First handle profile picture upload if there's a new file
            let profilePicUrl = schoolData.profilePicUrl;
            
            if (profilePicFile) {
                console.log("Uploading profile picture...");
                const formData = new FormData();
                formData.append('file', profilePicFile);

                // Upload the profile picture
                const uploadResponse = await fetch('/api/file/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Error uploading profile picture: ${uploadResponse.statusText}`);
                }

                const uploadResult = await uploadResponse.json();
                console.log("Upload result:", uploadResult);

                if (!uploadResult.url) {
                    throw new Error("Failed to get upload URL from server response");
                }

                // Update the URL for our API call
                profilePicUrl = uploadResult.url;
            }
            
            console.log("Updating school profile with:", {
                name: schoolData.name,
                profilePicUrl: profilePicUrl,
                contact: schoolData.contact,
                location: schoolData.location,
                principalName: schoolData.principalName
            });
            
            // Now update the school profile
            const response = await fetch(`/api/school?id=${schoolData.id || schoolData.schoolId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: schoolData.name,
                    profilePicUrl: profilePicUrl,
                    contact: schoolData.contact,
                    location: schoolData.location,
                    principalName: schoolData.principalName
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error updating profile: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log("Update result:", result);
            
            // Update the school data with the returned data
            setSchoolData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    profilePicUrl: profilePicUrl
                };
            });
            
            toast.success('Profile updated successfully');
            setIsDirty(false);
            setProfilePicFile(null);
        } catch (err) {
            console.error('Error updating school profile:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Basic input styling
    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700";
    const textareaStyle = inputStyle + " min-h-[80px]";
    const dropZoneStyle = "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500";

    // Show loading state
    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                <FiLoader className="animate-spin text-indigo-600 h-12 w-12 mb-4" />
                <p className="text-gray-600">Loading school profile...</p>
            </div>
        );
    }

    // Show error state
    if (error || !schoolData) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Profile</h2>
                    <p className="text-gray-600 mb-4">{error || "Could not load school data"}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                        {schoolData.name}
                    </h1>
                    <p className="mt-3 text-lg text-blue-100 sm:mt-4 sm:text-xl max-w-xl mx-auto">
                        View and edit your school profile details.
                    </p>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-8 sm:-mt-10">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-4 sm:p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">School Details</h2>
                         {/* Update Button - Conditionally Rendered */}
                         {isDirty && (
                            <button
                                onClick={handleUpdate}
                                disabled={isSaving}
                                className={`px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isSaving ? 'Saving...' : 'Update Profile'}
                            </button>
                        )}
                    </div>
                    <div className="p-4 sm:p-5 space-y-5">
                        {/* School ID - Read-only */}
                        <div className="flex items-center">
                            <FiHash className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">School ID:</label>
                            <input
                                type="text"
                                name="schoolId"
                                value={schoolData.schoolId}
                                readOnly
                                className={inputStyle + " bg-gray-100 cursor-not-allowed"}
                                placeholder="School ID"
                            />
                        </div>

                        {/* SID - Read-only */}
                         <div className="flex items-center">
                            <FiHash className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-32 text-sm font-medium text-gray-700">SID:</label>
                            <input
                                type="number"
                                name="sid"
                                value={schoolData.sid || 0}
                                readOnly
                                className={inputStyle + " bg-gray-100 cursor-not-allowed"}
                                placeholder="SID"
                            />
                        </div>

                        {/* School Name */}
                        <div className="flex items-center">
                            <FiUser className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">School Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={schoolData.name}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="School Name"
                            />
                        </div>

                        {/* Profile Picture Upload */}
                        <div className="flex items-start">
                            <FiImage className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 mt-2 text-sm font-medium text-gray-700">School Logo:</label>
                            <div className="w-full">
                                {/* Drop Zone */}
                                <div
                                    className={dropZoneStyle}
                                    onClick={handleDropZoneClick}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <div className="space-y-1 text-center">
                                        {profilePicPreview ? (
                                            <img 
                                                src={profilePicPreview} 
                                                alt="Profile Preview" 
                                                className="mx-auto h-24 w-24 object-cover rounded-md mb-2" 
                                                onError={(e) => {
                                                    console.error("Failed to load image:", profilePicPreview);
                                                    e.currentTarget.src = '/school-placeholder.png';
                                                }}
                                            />
                                        ) : (
                                            <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        )}
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="relative font-medium text-indigo-600 hover:text-indigo-500">
                                                Upload a file
                                            </span>
                                            <input
                                                id="profilePicInput"
                                                name="profilePicFile"
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                                            />
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </div>
                                {/* Button to remove selected file */}
                                {profilePicFile && (
                                    <button
                                        onClick={() => handleFileChange(null)}
                                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                                    >
                                        Remove selected image
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Location Fields */}
                        <div className="flex items-start">
                             <FiMapPin className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-32 mt-2 text-sm font-medium text-gray-700">Location:</label>
                             <div className="flex-1 space-y-2">
                                <input type="text" name="location.district" value={schoolData.location?.district || ''} onChange={handleChange} placeholder="District" className={inputStyle} />
                                <input type="text" name="location.zonal" value={schoolData.location?.zonal || ''} onChange={handleChange} placeholder="Zonal" className={inputStyle} />
                                <input type="text" name="location.province" value={schoolData.location?.province || ''} onChange={handleChange} placeholder="Province" className={inputStyle} />
                             </div>
                        </div>

                         {/* Coordinates */}
                        <div className="flex items-start">
                            <FiCompass className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 mt-2 text-sm font-medium text-gray-700">Coordinates:</label>
                             <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input 
                                    type="number" 
                                    step="any" 
                                    name="location.coordinates.latitude" 
                                    value={schoolData.location?.coordinates?.latitude || 0} 
                                    onChange={handleChange} 
                                    placeholder="Latitude" 
                                    className={inputStyle} 
                                />
                                <input 
                                    type="number" 
                                    step="any" 
                                    name="location.coordinates.longitude" 
                                    value={schoolData.location?.coordinates?.longitude || 0} 
                                    onChange={handleChange} 
                                    placeholder="Longitude" 
                                    className={inputStyle}
                                />
                             </div>
                        </div>

                        {/* Contact Email */}
                        <div className="flex items-center">
                            <FiMail className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-32 text-sm font-medium text-gray-700">Email:</label>
                            <input
                                type="email"
                                name="contact.email"
                                value={schoolData.contact?.email || ''}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Contact Email"
                            />
                        </div>

                        {/* Contact Phone */}
                        <div className="flex items-center">
                            <FiPhone className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-32 text-sm font-medium text-gray-700">Phone:</label>
                            <input
                                type="tel"
                                name="contact.phone"
                                value={schoolData.contact?.phone || ''}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Contact Phone"
                            />
                        </div>

                        {/* Principal Name */}
                        <div className="flex items-center">
                            <FiUser className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-32 text-sm font-medium text-gray-700">Principal:</label>
                            <input
                                type="text"
                                name="principalName"
                                value={schoolData.principalName || ''}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Principal's Name"
                            />
                        </div>

                         {/* Verified Status - Display Only */}
                         <div className="flex items-center pt-2">
                             <span className="w-32 text-sm font-medium text-gray-700">Status:</span>
                             <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${schoolData.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {schoolData.verified ? 'Verified' : 'Not Verified'}
                             </span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
