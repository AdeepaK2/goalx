import React, { useState, useEffect, useCallback } from "react";
import { FiMapPin, FiMail, FiPhone, FiUser, FiHash, FiType, FiFileText, FiImage, FiUploadCloud } from "react-icons/fi";
import { toast } from "react-hot-toast"; // Add toast for notifications (make sure to install if not already)

// Define the structure of donor data based on IDonor
interface Donor {
    id?: string;
    donorId: string;
    displayName: string;
    profilePicUrl?: string;
    donorType: 'INDIVIDUAL' | 'COMPANY';
    email: string;
    phone?: string;
    address?: string;
    verified: boolean;
    note?: string;
}

// Define props for the component
interface DonorProfileProps {
    donorData: any; // Using 'any' to match the parent component's data structure
}

const DonorProfile: React.FC<DonorProfileProps> = ({ donorData: initialData }) => {
    // Convert parent component data to our Donor interface format
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [donorData, setDonorData] = useState<Donor>({
        id: initialData?.id,
        donorId: initialData?.donorId || "",
        displayName: initialData?.name || "",
        profilePicUrl: initialData?.profilePicUrl,
        donorType: initialData?.donorType || "INDIVIDUAL",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        address: initialData?.address || "",
        verified: initialData?.verified || false,
        note: initialData?.note || "",
    });

    const [isDirty, setIsDirty] = useState(false);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(donorData.profilePicUrl || null);

    // Add this function to generate download URL for profile pictures
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

    // Load full donor details on component mount
    useEffect(() => {
        const fetchDonorDetails = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/donor?id=${initialData.id || initialData.donorId}`);

                if (!response.ok) {
                    throw new Error(`Error fetching donor details: ${response.statusText}`);
                }

                const donorDetails = await response.json();

                setDonorData({
                    id: donorDetails._id || donorDetails.id,
                    donorId: donorDetails.donorId,
                    displayName: donorDetails.displayName,
                    profilePicUrl: donorDetails.profilePicUrl,
                    donorType: donorDetails.donorType,
                    email: donorDetails.email,
                    phone: donorDetails.phone || "",
                    address: donorDetails.address || "",
                    verified: donorDetails.verified,
                    note: donorDetails.note || "",
                });

                setProfilePicPreview(donorDetails.profilePicUrl ? getProfileImageUrl(donorDetails.profilePicUrl) : null);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch donor details");
                console.error("Error fetching donor details:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDonorDetails();
    }, [initialData.id, initialData.donorId]);

    // Effect to create/revoke object URL for preview
    useEffect(() => {
        let objectUrl: string | null = null;
        if (profilePicFile) {
            objectUrl = URL.createObjectURL(profilePicFile);
            setProfilePicPreview(objectUrl);
            setIsDirty(true);
        } else {
            // Use the download API for stored profile pictures
            setProfilePicPreview(donorData.profilePicUrl ? getProfileImageUrl(donorData.profilePicUrl) : null);
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [profilePicFile, donorData.profilePicUrl]);

    // Function to handle input/select/textarea changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'profilePicUrl') return;

        setDonorData(prevData => ({
            ...prevData,
            [name]: value
        }));

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

            // First, handle profile picture upload if there's a new file
            if (profilePicFile) {
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

                // Update donorData with the new profile picture URL
                setDonorData(prev => ({
                    ...prev,
                    profilePicUrl: uploadResult.url
                }));

                // Update the payload for the donor API call
                donorData.profilePicUrl = uploadResult.url;
            }

            // Now update the donor profile
            const updateResponse = await fetch(`/api/donor?id=${donorData.id || donorData.donorId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    displayName: donorData.displayName,
                    email: donorData.email,
                    phone: donorData.phone,
                    address: donorData.address,
                    note: donorData.note,
                    profilePicUrl: donorData.profilePicUrl,
                })
            });

            if (!updateResponse.ok) {
                throw new Error(`Error updating donor profile: ${updateResponse.statusText}`);
            }

            const updatedDonor = await updateResponse.json();

            // Update state with the response from the server
            setDonorData({
                id: updatedDonor._id || updatedDonor.id,
                donorId: updatedDonor.donorId,
                displayName: updatedDonor.displayName,
                profilePicUrl: updatedDonor.profilePicUrl,
                donorType: updatedDonor.donorType,
                email: updatedDonor.email,
                phone: updatedDonor.phone || "",
                address: updatedDonor.address || "",
                verified: updatedDonor.verified,
                note: updatedDonor.note || "",
            });

            setIsDirty(false);
            setProfilePicFile(null);
            toast.success("Profile updated successfully!");
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

    // Show loading state
    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                            Profile
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
                            Profile
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
                        {donorData.displayName}
                    </h1>
                    <p className="mt-3 text-lg text-blue-100 sm:mt-4 sm:text-xl max-w-xl mx-auto">
                        View and edit your donor profile details.
                    </p>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-8 sm:-mt-10">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-4 sm:p-5 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Donor Details</h2>
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
                        {/* Donor ID - Read-only */}
                        <div className="flex items-center">
                            <FiHash className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">Donor ID:</label>
                            <input
                                type="text"
                                name="donorId"
                                value={donorData.donorId}
                                readOnly
                                className={inputStyle + " bg-gray-100 cursor-not-allowed"}
                                placeholder="Donor ID"
                            />
                        </div>

                        {/* Display Name */}
                        <div className="flex items-center">
                            <FiUser className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">Display Name:</label>
                            <input
                                type="text"
                                name="displayName"
                                value={donorData.displayName}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Full Name or Company Name"
                            />
                        </div>

                        {/* Profile Picture Upload */}
                        <div className="flex items-start">
                            <FiImage className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 mt-2 text-sm font-medium text-gray-700">Profile Picture:</label>
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
                                                    // Set a fallback image or retry with direct URL as fallback
                                                    const directUrl = donorData.profilePicUrl?.startsWith('http') 
                                                        ? donorData.profilePicUrl 
                                                        : `/no-image.png`;
                                                    e.currentTarget.src = directUrl;
                                                }}
                                            />
                                        ) : (
                                            <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        )}
                                        <div className="flex text-sm text-gray-600">
                                            <span className="relative font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
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

                        {/* Donor Type - Read-only since it shouldn't be changed directly */}
                        <div className="flex items-center">
                            <FiType className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">Donor Type:</label>
                            <select
                                name="donorType"
                                value={donorData.donorType}
                                disabled
                                className={selectStyle + " bg-gray-100 cursor-not-allowed"}
                            >
                                <option value="INDIVIDUAL">Individual</option>
                                <option value="COMPANY">Company</option>
                            </select>
                        </div>

                        {/* Email */}
                        <div className="flex items-center">
                            <FiMail className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={donorData.email}
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
                                value={donorData.phone || ''}
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
                                value={donorData.address || ''}
                                onChange={handleChange}
                                className={textareaStyle}
                                placeholder="Full Address (Optional)"
                                rows={3}
                            />
                        </div>

                        {/* Note */}
                        <div className="flex items-start">
                            <FiFileText className="mr-3 mt-2.5 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 mt-2 text-sm font-medium text-gray-700">Note:</label>
                            <textarea
                                name="note"
                                value={donorData.note || ''}
                                onChange={handleChange}
                                className={textareaStyle}
                                placeholder="Any relevant notes (e.g., interests, contact preferences)"
                                rows={3}
                            />
                        </div>

                        {/* Verified Status - Display Only */}
                        <div className="flex items-center pt-2">
                            <span className="w-32 text-sm font-medium text-gray-700">Status:</span>
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${donorData.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {donorData.verified ? 'Verified' : 'Not Verified'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorProfile;