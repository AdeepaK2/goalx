import React, { useState, useEffect, useCallback } from "react";
import { FiMapPin, FiMail, FiPhone, FiUser, FiHash, FiType, FiFileText, FiImage, FiUploadCloud, FiAward } from "react-icons/fi";
import { toast } from "react-hot-toast";

// Define the structure of governing body data
interface GovernBody {
    id?: string;
    governId: string;
    displayName: string;
    profilePicUrl?: string;
    email: string;
    phone?: string;
    address?: string;
    description?: string;
    verified: boolean;
    specializedSports?: string[];
    foundedYear?: number;
}

// Define props for the component
interface GovernProfileProps {
    donorData: any; // Using 'any' to match the dashboard component's data structure
}

const GovernProfile: React.FC<GovernProfileProps> = ({ donorData: initialData }) => {
    // Convert parent component data to our GovernBody interface format
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [governData, setGovernData] = useState<GovernBody>({
        id: initialData?.id,
        governId: initialData?.donorId || "",
        displayName: initialData?.name || "",
        profilePicUrl: initialData?.profilePicUrl,
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        address: initialData?.address || "",
        verified: initialData?.verified || false,
        description: initialData?.description || "",
        specializedSports: [],
        foundedYear: initialData?.foundedYear || new Date().getFullYear(),
    });

    const [isDirty, setIsDirty] = useState(false);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(governData.profilePicUrl || null);
    const [sports, setSports] = useState<any[]>([]);
    const [sportsLoading, setSportsLoading] = useState(false);

    // Generate download URL for profile pictures
    const getProfileImageUrl = (imageUrl: string | null) => {
        if (!imageUrl) return null;
        
        if (imageUrl.startsWith('/api/file/download')) {
            return imageUrl;
        }

        if (imageUrl.startsWith('http')) {
            return `/api/file/download?fileUrl=${encodeURIComponent(imageUrl)}`;
        }
        
        return `/api/file/download?file=${encodeURIComponent(imageUrl)}`;
    };

    // Load all available sports
    useEffect(() => {
        const fetchAllSports = async () => {
            try {
                setSportsLoading(true);
                const response = await fetch('/api/sport');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch sports');
                }
                
                const data = await response.json();
                setSports(data.sports || []);
            } catch (err) {
                console.error('Error fetching sports:', err);
            } finally {
                setSportsLoading(false);
            }
        };
        
        fetchAllSports();
    }, []);

    // Extract fetchGovernDetails to its own function that can be reused
    const fetchGovernDetails = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/govern?id=${initialData.donorId}`);

            if (!response.ok) {
                throw new Error(`Errorr fetching governing body details: ${response.statusText}`);
            }

            const governDetails = await response.json();

            setGovernData({
                id: governDetails._id || governDetails.id,
                governId: governDetails.governBodyId || governDetails.governId,
                displayName: governDetails.name || governDetails.displayName,
                profilePicUrl: governDetails.logoUrl || governDetails.profilePicUrl,
                email: governDetails.email,
                phone: governDetails.contact?.phone || governDetails.phone || "",
                address: governDetails.address || "",
                verified: governDetails.verified || false,
                description: governDetails.description || "",
                specializedSports: governDetails.specializedSports || [],
                foundedYear: governDetails.foundedYear || new Date().getFullYear(),
            });

            setProfilePicPreview(governDetails.logoUrl || governDetails.profilePicUrl ? 
                getProfileImageUrl(governDetails.logoUrl || governDetails.profilePicUrl) : null);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch governing body details");
            console.error("Error fetching governing body details:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Update useEffect to use the extracted function
    useEffect(() => {
        fetchGovernDetails();
    }, [initialData.donorId]);

    // Effect to create/revoke object URL for preview
    useEffect(() => {
        let objectUrl: string | null = null;
        if (profilePicFile) {
            objectUrl = URL.createObjectURL(profilePicFile);
            setProfilePicPreview(objectUrl);
            setIsDirty(true);
        } else {
            setProfilePicPreview(governData.profilePicUrl ? getProfileImageUrl(governData.profilePicUrl) : null);
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [profilePicFile, governData.profilePicUrl]);

    // Function to handle input/select/textarea changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'profilePicUrl') return;
        
        if (name === 'foundedYear') {
            setGovernData(prevData => ({
                ...prevData,
                [name]: parseInt(value)
            }));
        } else {
            setGovernData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }

        setIsDirty(true);
    };
    
    // Handle specialized sports changes
    const handleSportChange = (sportId: string) => {
        setGovernData(prev => {
            const currentSports = prev.specializedSports || [];
            const updatedSports = currentSports.includes(sportId)
                ? currentSports.filter(id => id !== sportId)
                : [...currentSports, sportId];
                
            return {
                ...prev,
                specializedSports: updatedSports
            };
        });
        
        setIsDirty(true);
    };

    // Handler for file selection
    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setProfilePicFile(file);
        } else {
            setProfilePicFile(null);
            console.log("Please select a valid image file.");
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
        try {
            setIsLoading(true);
            setError(null);

            let updatedProfileUrl = governData.profilePicUrl;

            // First, handle profile picture upload if there's a new file
            if (profilePicFile) {
                const formData = new FormData();
                formData.append('file', profilePicFile);
                formData.append('path', 'govern-profiles'); // Organize uploads in folders
                
                toast.loading("Uploading image...");
                
                // Upload the profile picture
                const uploadResponse = await fetch('/api/file/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(`Image upload failed: ${errorData.message || uploadResponse.statusText}`);
                }

                const uploadResult = await uploadResponse.json();
                updatedProfileUrl = uploadResult.url;
                
                toast.dismiss();
                toast.success("Image uploaded successfully!");
            }

            // Prepare data for API call - using the DB field names
            const updatePayload = {
                name: governData.displayName, // map displayName to name field in DB
                email: governData.email,
                contact: {
                    phone: governData.phone || ''
                },
                address: governData.address || '',
                description: governData.description || '',
                logoUrl: updatedProfileUrl, // map profilePicUrl to logoUrl field in DB
                specializedSports: governData.specializedSports || [],
                foundedYear: governData.foundedYear || new Date().getFullYear()
            };

            toast.loading("Updating profile...");
            
            // Now update the governing body profile
            const updateResponse = await fetch(`/api/govern?id=${governData.governId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload)
            });

            toast.dismiss();

            if (!updateResponse.ok) {
                // Try to get error details from response
                let errorMessage;
                try {
                    const errorData = await updateResponse.json();
                    errorMessage = errorData.error || errorData.message;
                } catch (e) {
                    errorMessage = updateResponse.statusText;
                }
                
                throw new Error(`Failed to update profile: ${errorMessage}`);
            }

            const responseData = await updateResponse.json();
            const updatedGovern = responseData.data; // Access data property from response

            // Update state with the response from the server
            setGovernData({
                id: updatedGovern._id || updatedGovern.id,
                governId: updatedGovern.governBodyId || updatedGovern.governId,
                displayName: updatedGovern.name || updatedGovern.displayName,
                profilePicUrl: updatedGovern.logoUrl || updatedGovern.profilePicUrl,
                email: updatedGovern.email,
                phone: updatedGovern.contact?.phone || updatedGovern.phone || "",
                address: updatedGovern.address || "",
                verified: updatedGovern.verified || false,
                description: updatedGovern.description || "",
                specializedSports: updatedGovern.specializedSports || [],
                foundedYear: updatedGovern.foundedYear || new Date().getFullYear(),
            });

            setIsDirty(false);
            setProfilePicFile(null);
            toast.success("Profile updated successfully!");
            
            // Refresh profile data to ensure we have the latest from server
            fetchGovernDetails();
            
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err instanceof Error ? err.message : "Failed to update profile");
            toast.error(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    // Basic input styling
    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700";
    const selectStyle = inputStyle;
    const textareaStyle = inputStyle + " min-h-[80px]";
    const dropZoneStyle = "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500";
    const checkboxContainerStyle = "grid grid-cols-2 md:grid-cols-3 gap-4 mt-2";

    // Show loading state
    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Governing Body Profile
                        </h1>
                    </div>
                </div>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Governing Body Profile
                        </h1>
                    </div>
                </div>
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    {error}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
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
                        {governData.displayName}
                    </h1>
                    <p className="mt-3 text-lg text-blue-100 sm:mt-4 sm:text-xl max-w-xl mx-auto">
                        Sports Governing Body Profile
                    </p>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-8 sm:-mt-10">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-4 sm:p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Governing Body Details</h2>
                        {/* Update Button - Conditionally Rendered */}
                        {isDirty && (
                            <button
                                onClick={handleUpdate}
                                disabled={isLoading}
                                className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                    isLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                                {isLoading ? "Updating..." : "Update Profile"}
                            </button>
                        )}
                    </div>
                    <div className="p-4 sm:p-5 space-y-5">
                        {/* Governing Body ID - Read-only */}
                        <div className="flex items-center">
                            <FiHash className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">ID:</label>
                            <input
                                type="text"
                                name="governId"
                                value={governData.governId}
                                readOnly
                                className={inputStyle + " bg-gray-100 cursor-not-allowed"}
                                placeholder="Governing Body ID"
                            />
                        </div>

                        {/* Display Name */}
                        <div className="flex items-center">
                            <FiUser className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">Organization:</label>
                            <input
                                type="text"
                                name="displayName"
                                value={governData.displayName}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Organization Name"
                            />
                        </div>

                        {/* Founded Year */}
                        <div className="flex items-center">
                            <FiType className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">Founded Year:</label>
                            <input
                                type="number"
                                name="foundedYear"
                                value={governData.foundedYear}
                                onChange={handleChange}
                                min="1800"
                                max={new Date().getFullYear()}
                                className={inputStyle}
                                placeholder="Year Founded"
                            />
                        </div>

                        {/* Profile Picture Upload */}
                        <div className="flex items-start">
                            <FiImage className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 mt-2 text-sm font-medium text-gray-700">Logo:</label>
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
                                                    // Set a fallback image
                                                    e.currentTarget.src = '/no-image.png';
                                                }}
                                            />
                                        ) : (
                                            <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        )}
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="relative font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                Upload a logo
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

                        {/* Specialized Sports */}
                        <div className="flex items-start">
                            <FiAward className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 mt-2 text-sm font-medium text-gray-700">Sports:</label>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-2">Select the sports your organization governs:</p>
                                {sportsLoading ? (
                                    <div className="animate-pulse h-12 bg-gray-100 rounded"></div>
                                ) : (
                                    <div className={checkboxContainerStyle}>
                                        {sports.map(sport => (
                                            <div key={sport._id} className="flex items-center">
                                                <input
                                                    id={`sport-${sport._id}`}
                                                    type="checkbox"
                                                    checked={governData.specializedSports?.includes(sport._id)}
                                                    onChange={() => handleSportChange(sport._id)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor={`sport-${sport._id}`} className="ml-2 block text-sm text-gray-700">
                                                    {sport.sportName}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center">
                            <FiMail className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={governData.email}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Contact Email"
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex items-center">
                            <FiPhone className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">Phone:</label>
                            <input
                                type="tel"
                                name="phone"
                                value={governData.phone || ''}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Contact Phone (Optional)"
                            />
                        </div>

                        {/* Address */}
                        <div className="flex items-start">
                            <FiMapPin className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 mt-2 text-sm font-medium text-gray-700">Address:</label>
                            <textarea
                                name="address"
                                value={governData.address || ''}
                                onChange={handleChange}
                                className={textareaStyle}
                                placeholder="Full Address (Optional)"
                                rows={3}
                            />
                        </div>

                        {/* Description */}
                        <div className="flex items-start">
                            <FiFileText className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 mt-2 text-sm font-medium text-gray-700">Description:</label>
                            <textarea
                                name="description"
                                value={governData.description || ''}
                                onChange={handleChange}
                                className={textareaStyle}
                                placeholder="Short description of the governing body and its mission"
                                rows={4}
                            />
                        </div>

                        {/* Verified Status - Display Only */}
                        <div className="flex items-center pt-2">
                            <span className="w-32 text-sm font-medium text-gray-700">Status:</span>
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${governData.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {governData.verified ? 'Verified' : 'Pending Verification'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovernProfile;