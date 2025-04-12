import React, { useState, useEffect } from "react";
import { FiMapPin, FiMail, FiPhone, FiUser, FiHash, FiCompass, FiLoader } from "react-icons/fi";
import { toast } from "react-hot-toast";

// Define the structure of school data
interface SchoolLocation {
    district: string;
    zonal: string;
    province: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

interface SchoolContact {
    email: string;
    phone: string;
}

interface School {
    id?: string;
    schoolId: string;
    sid?: number;
    name: string;
    location: SchoolLocation;
    contact: SchoolContact;
    principalName: string;
    verified: boolean;
}

const Profile = () => {
    const [schoolData, setSchoolData] = useState<School | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch school data on component mount
    useEffect(() => {
        const fetchSchoolData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/school/profile');
                
                if (!response.ok) {
                    throw new Error(`Error fetching school data: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Transform API response to match our School interface
                setSchoolData({
                    id: data.id || data._id,
                    schoolId: data.schoolId,
                    sid: data.sid,
                    name: data.name,
                    location: {
                        district: data.location?.district || '',
                        zonal: data.location?.zonal || '',
                        province: data.location?.province || '',
                        coordinates: {
                            latitude: data.location?.coordinates?.latitude || 0,
                            longitude: data.location?.coordinates?.longitude || 0
                        }
                    },
                    contact: {
                        email: data.contact?.email || '',
                        phone: data.contact?.phone || ''
                    },
                    principalName: data.principalName || '',
                    verified: data.verified || false
                });
                
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

    // Function to handle input changes and update nested state
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!schoolData) return;
        
        const { name, value } = e.target;
        const keys = name.split('.'); // Handle nested properties like 'location.district'

        setSchoolData(prevData => {
            if (!prevData) return null;
            
            let updatedData = { ...prevData };
            let currentLevel: any = updatedData;

            for (let i = 0; i < keys.length - 1; i++) {
                currentLevel[keys[i]] = { ...currentLevel[keys[i]] }; // Ensure nested objects are cloned
                currentLevel = currentLevel[keys[i]];
            }

            // Handle coordinate conversion to number
            if (name === 'location.coordinates.latitude' || name === 'location.coordinates.longitude') {
                 currentLevel[keys[keys.length - 1]] = parseFloat(value) || 0; // Use parseFloat, default to 0 if invalid
            } else {
                 currentLevel[keys[keys.length - 1]] = value;
            }

            return updatedData;
        });

        setIsDirty(true); // Mark as dirty whenever a change occurs
    };

    // Function to handle the update action
    const handleUpdate = async () => {
        if (!schoolData) return;
        
        try {
            setIsSaving(true);
            
            const response = await fetch('/api/school/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(schoolData)
            });
            
            if (!response.ok) {
                throw new Error(`Error updating profile: ${response.statusText}`);
            }
            
            const result = await response.json();
            toast.success('Profile updated successfully');
            setIsDirty(false);
        } catch (err) {
            console.error('Error updating school profile:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Basic input styling
    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700";

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
                                readOnly // IDs are typically not editable
                                className={inputStyle + " bg-gray-100 cursor-not-allowed"} // Style for read-only
                                placeholder="School ID"
                            />
                        </div>

                        {/* SID - Read-only */}
                         <div className="flex items-center">
                            <FiHash className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-32 text-sm font-medium text-gray-700">SID:</label>
                            <input
                                type="number" // Use number type if SID is always numeric
                                name="sid"
                                value={schoolData.sid || 0}
                                readOnly // SID is typically not editable
                                className={inputStyle + " bg-gray-100 cursor-not-allowed"} // Style for read-only
                                placeholder="SID"
                            />
                        </div>

                        {/* Location Fields */}
                        <div className="flex items-start">
                             <FiMapPin className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-28 mt-2 text-sm font-medium text-gray-700">Location:</label>
                             <div className="flex-1 space-y-2">
                                <input type="text" name="location.district" value={schoolData.location.district} onChange={handleChange} placeholder="District" className={inputStyle} />
                                <input type="text" name="location.zonal" value={schoolData.location.zonal} onChange={handleChange} placeholder="Zonal" className={inputStyle} />
                                <input type="text" name="location.province" value={schoolData.location.province} onChange={handleChange} placeholder="Province" className={inputStyle} />
                             </div>
                        </div>

                         {/* Coordinates */}
                        <div className="flex items-start">
                            <FiCompass className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-28 mt-2 text-sm font-medium text-gray-700">Coordinates:</label>
                             <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input type="number" step="any" name="location.coordinates.latitude" value={schoolData.location.coordinates.latitude} onChange={handleChange} placeholder="Latitude" className={inputStyle} />
                                <input type="number" step="any" name="location.coordinates.longitude" value={schoolData.location.coordinates.longitude} onChange={handleChange} placeholder="Longitude" className={inputStyle} />
                             </div>
                        </div>

                        {/* Contact Email */}
                        <div className="flex items-center">
                            <FiMail className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-28 text-sm font-medium text-gray-700">Email:</label>
                            <input
                                type="email"
                                name="contact.email"
                                value={schoolData.contact.email}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Contact Email"
                            />
                        </div>

                        {/* Contact Phone */}
                        <div className="flex items-center">
                            <FiPhone className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-28 text-sm font-medium text-gray-700">Phone:</label>
                            <input
                                type="tel"
                                name="contact.phone"
                                value={schoolData.contact.phone}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Contact Phone"
                            />
                        </div>

                        {/* Principal Name */}
                        <div className="flex items-center">
                            <FiUser className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-28 text-sm font-medium text-gray-700">Principal:</label>
                            <input
                                type="text"
                                name="principalName"
                                value={schoolData.principalName}
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
