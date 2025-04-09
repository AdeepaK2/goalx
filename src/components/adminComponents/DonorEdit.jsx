import React, { useState } from 'react';
import { toast } from 'react-hot-toast'; // Assuming you use toast for notifications

const DonorEdit = ({ donor, onSave, onCancel }) => {
  const [editedDonor, setEditedDonor] = useState(donor);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedDonor(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Make PATCH request to update donor
      const response = await fetch(`/api/donor?id=${donor.donorId || donor._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedDonor),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update donor');
      }
      
      toast.success('Donor updated successfully');
      onSave(data); // Pass the updated donor data back to parent component
    } catch (error) {
      console.error('Error updating donor:', error);
      toast.error(error.message || 'An error occurred while updating donor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        <div className="bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-medium text-white">Edit Donor</h3>
          <button 
            onClick={onCancel}
            className="text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="form-group">
              <label className="block text-gray-700 text-sm font-bold mb-2">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={editedDonor.displayName || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
                required
              />
            </div>
            
            {/* Email */}
            <div className="form-group">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={editedDonor.email || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
                required
              />
            </div>
            
            {/* Phone */}
            <div className="form-group">
              <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={editedDonor.phone || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
              />
            </div>
            
            {/* Donor Type */}
            <div className="form-group">
              <label className="block text-gray-700 text-sm font-bold mb-2">Donor Type</label>
              <select
                name="donorType"
                value={editedDonor.donorType || 'INDIVIDUAL'}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="COMPANY">Company</option>
              </select>
            </div>
            
            {/* Profile Pic URL */}
            <div className="form-group col-span-1 md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Profile Picture URL</label>
              <input
                type="url"
                name="profilePicUrl"
                value={editedDonor.profilePicUrl || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
              />
              {editedDonor.profilePicUrl && (
                <div className="mt-2 flex justify-center">
                  <img 
                    src={editedDonor.profilePicUrl} 
                    alt="Profile preview" 
                    className="h-20 w-20 rounded-full object-cover border-2 border-[#1e0fbf]"
                    onError={(e) => { e.target.src = "/default-profile.png"; }}
                  />
                </div>
              )}
            </div>
            
            {/* Address */}
            <div className="form-group col-span-1 md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
              <textarea
                name="address"
                value={editedDonor.address || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
                rows={3}
              />
            </div>
            
            {/* Notes */}
            <div className="form-group col-span-1 md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
              <textarea
                name="note"
                value={editedDonor.note || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
                rows={3}
              />
            </div>
            
            {/* Verified Status */}
            <div className="form-group">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="verified"
                  checked={editedDonor.verified || false}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-[#1e0fbf] rounded focus:ring-[#1e0fbf]"
                />
                <span className="text-gray-700 font-medium">Verified Donor</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#1e0fbf] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf]"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonorEdit;