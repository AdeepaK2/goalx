import React, { useState } from 'react';
import { toast } from 'react-hot-toast'; // Assuming you use toast for notifications

interface GoverningBody {
  _id: string;
  governBodyId: string;
  name: string;
  type?: string;
  email: string;
  contact?: {
    phone?: string;
    website?: string;
  };
  specializedSport?: string;
  active: boolean;
  description?: string;
  logoUrl?: string;
  schoolsManaged?: number;
}

interface Props {
  governBody: GoverningBody;
  onSave: (updatedBody: GoverningBody) => void;
  onCancel: () => void;
}

const GoverningBodyEdit: React.FC<Props> = ({ governBody, onSave, onCancel }) => {
  const [editedBody, setEditedBody] = useState<GoverningBody>(governBody);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., contact.phone)
      const [parent, child] = name.split('.');
      setEditedBody(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof GoverningBody] as object || {}),
          [child]: isCheckbox ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      // Handle top-level properties
      setEditedBody(prev => ({
        ...prev,
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleActiveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedBody(prev => ({
      ...prev,
      active: e.target.checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Make PATCH request to update governing body
      const response = await fetch(`/api/govern?id=${governBody.governBodyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update governing body');
      }
      
      toast.success('Governing body updated successfully');
      onSave(data.data); // Pass the updated data back to parent component
    } catch (error: any) {
      console.error('Error updating governing body:', error);
      toast.error(error.message || 'An error occurred while updating governing body');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        <div className="bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-medium text-white">Edit Governing Body</h3>
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
            {/* Name */}
            <div className="form-group">
              <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={editedBody.name || ''}
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
                value={editedBody.email || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
                required
              />
            </div>
            
            {/* Type */}
            <div className="form-group">
              <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
              <select
                name="type"
                value={editedBody.type || 'NGO'}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
              >
                <option value="NGO">NGO</option>
                <option value="Government">Government</option>
                <option value="Association">Association</option>
                <option value="Federation">Federation</option>
              </select>
            </div>
            
            {/* Specialized Sport */}
            <div className="form-group">
              <label className="block text-gray-700 text-sm font-bold mb-2">Specialized Sport</label>
              <input
                type="text"
                name="specializedSport"
                value={editedBody.specializedSport || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
              />
            </div>
            
            {/* Phone */}
            <div className="form-group">
              <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
              <input
                type="tel"
                name="contact.phone"
                value={editedBody.contact?.phone || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
              />
            </div>
            
            {/* Website */}
            <div className="form-group">
              <label className="block text-gray-700 text-sm font-bold mb-2">Website</label>
              <input
                type="url"
                name="contact.website"
                value={editedBody.contact?.website || ''}
                onChange={handleChange}
                placeholder="https://example.com"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
              />
            </div>
            
            {/* Logo URL */}
            <div className="form-group col-span-1 md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Logo URL</label>
              <input
                type="url"
                name="logoUrl"
                value={editedBody.logoUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
              />
              {editedBody.logoUrl && (
                <div className="mt-2 flex justify-center">
                  <img 
                    src={editedBody.logoUrl} 
                    alt="Logo preview" 
                    className="h-20 w-auto object-contain border-2 border-gray-200 rounded"
                    onError={(e) => { e.currentTarget.src = "/default-logo.png"; }}
                  />
                </div>
              )}
            </div>
            
            {/* Description */}
            <div className="form-group col-span-1 md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea
                name="description"
                value={editedBody.description || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
                rows={3}
              />
            </div>
            
            {/* Active Status */}
            <div className="form-group">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedBody.active || false}
                  onChange={handleActiveToggle}
                  className="form-checkbox h-5 w-5 text-[#1e0fbf] rounded focus:ring-[#1e0fbf]"
                />
                <span className="text-gray-700 font-medium">Active</span>
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

export default GoverningBodyEdit;