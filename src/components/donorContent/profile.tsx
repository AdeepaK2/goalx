import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
import { FiMapPin, FiMail, FiPhone, FiUser, FiHash, FiType, FiFileText, FiImage, FiUploadCloud } from "react-icons/fi"; // Added FiUploadCloud

// Define the structure of donor data based on IDonor
interface Donor {
    donorId: string;
    displayName: string;
    profilePicUrl?: string;
    donorType: 'INDIVIDUAL' | 'COMPANY';
    email: string;
    phone?: string;
    address?: string;
    verified: boolean;
    note: string;
    // Fields like password, tokens, timestamps are typically not managed directly in a profile UI
}

// Mock data for a donor - replace with actual data fetching
const initialDonorData: Donor = {
    donorId: "d456",
    displayName: "John Doe",
    profilePicUrl: "https://http.cat/404.jpg", // Example placeholder image
    donorType: 'INDIVIDUAL',
    email: "john.doe@example.com",
    phone: "0771234567",
    address: "123 Main St, Colombo 07",
    verified: true,
    note: "Regular donor interested in supporting primary education.",
};

const DonorProfile = () => {
    const [donorData, setDonorData] = useState<Donor>(initialDonorData);
    const [isDirty, setIsDirty] = useState(false);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null); // State for the selected file
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(donorData.profilePicUrl || null); // State for the image preview URL

    // Effect to create/revoke object URL for preview
    useEffect(() => {
        let objectUrl: string | null = null;
        if (profilePicFile) {
            objectUrl = URL.createObjectURL(profilePicFile);
            setProfilePicPreview(objectUrl);
            setIsDirty(true); // Mark as dirty when a new file is selected
        } else {
             // If file is removed or initially null, revert to original URL if it exists
             setProfilePicPreview(donorData.profilePicUrl || null);
        }

        // Cleanup function to revoke the object URL
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [profilePicFile, donorData.profilePicUrl]); // Rerun when file or original URL changes

    // Function to handle input/select/textarea changes (excluding file input)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Prevent direct update of profilePicUrl via this handler
        if (name === 'profilePicUrl') return;

        setDonorData(prevData => ({
            ...prevData,
            [name]: value
        }));

        setIsDirty(true); // Mark as dirty whenever a change occurs
    };

    // Handler for file selection (click or drop)
    const handleFileChange = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            setProfilePicFile(file);
        } else {
            setProfilePicFile(null); // Reset if no file or non-image file is selected/dropped
            // Optionally show an error message to the user here
            console.log("Please select a valid image file.");
        }
    };

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    }, []);

    // Click handler for the drop zone to trigger file input
    const handleDropZoneClick = () => {
        document.getElementById('profilePicInput')?.click();
    };


     // Function to handle the update action
     const handleUpdate = async () => {
        console.log("Updating donor data:", donorData);
        if (profilePicFile) {
            console.log("New profile picture selected:", profilePicFile.name);
            // TODO: Implement API call to upload the profilePicFile
            // You'll likely need to use FormData here
            alert("Profile picture upload logic needs to be implemented.");
        }
        // TODO: Implement API call to update other donor profile fields
         alert("Update logic needs to be implemented (e.g., API call). Check console for data.");
         setIsDirty(false); // Reset dirty state after attempting update
         // Optionally reset profilePicFile state if upload is successful
         // setProfilePicFile(null);
    };


    // Basic input styling
    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-700";
    const selectStyle = inputStyle; // Use the same style for select
    const textareaStyle = inputStyle + " min-h-[80px]"; // Style for textarea
    // Style for the drop zone
    const dropZoneStyle = "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500";


    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                        {initialDonorData.displayName} {/* Display donor name */}
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
                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Update Profile
                            </button>
                        )}
                    </div>
                    <div className="p-4 sm:p-5 space-y-5"> {/* Increased spacing */}

                        {/* Donor ID - Typically Read-only */}
                        <div className="flex items-center">
                            <FiHash className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                            <label className="w-32 text-sm font-medium text-gray-700">Donor ID:</label>
                            <input
                                type="text"
                                name="donorId"
                                value={donorData.donorId}
                                readOnly // Usually IDs are not editable
                                className={inputStyle + " bg-gray-100 cursor-not-allowed"} // Style for read-only
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
                                            <img src={profilePicPreview} alt="Profile Preview" className="mx-auto h-24 w-24 object-cover rounded-md mb-2" />
                                        ) : (
                                            <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        )}
                                        <div className="flex text-sm text-gray-600">
                                            <span className="relative font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                Upload a file
                                            </span>
                                            <input
                                                id="profilePicInput"
                                                name="profilePicFile" // Name for the input itself
                                                type="file"
                                                accept="image/*"
                                                className="sr-only" // Hide the default input visually
                                                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                                            />
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p> {/* Example text */}
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

                         {/* Donor Type */}
                        <div className="flex items-center">
                            <FiType className="mr-3 flex-shrink-0 text-[#6e11b0]" size={18} />
                             <label className="w-32 text-sm font-medium text-gray-700">Donor Type:</label>
                             <select
                                name="donorType"
                                value={donorData.donorType}
                                onChange={handleChange}
                                className={selectStyle}
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
                                value={donorData.note}
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
