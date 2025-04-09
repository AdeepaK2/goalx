import React, { useState } from 'react';

interface Donor {
  _id: string;
  donorId: string;
  displayName: string;
  email: string;
  donorType: 'INDIVIDUAL' | 'COMPANY';
  verified: boolean;
  profilePicUrl?: string;
  createdAt: string;
}

interface DonorEditProps {
  donor: Donor;
  onSave: (donor: Donor) => void;
  onCancel: () => void;
}

const DonorEdit: React.FC<DonorEditProps> = ({ donor, onSave, onCancel }) => {
  const [editedDonor, setEditedDonor] = useState<Donor>(donor);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedDonor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedDonor);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
        <div className="bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] px-6 py-4">
          <h3 className="text-xl font-medium text-white">Edit Donor</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayName">
              Name
            </label>
            <input
              id="displayName"
              type="text"
              name="displayName"
              value={editedDonor.displayName || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={editedDonor.email || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="donorType">
              Donor Type
            </label>
            <select
              id="donorType"
              name="donorType"
              value={editedDonor.donorType}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#1e0fbf]"
            >
              <option value="INDIVIDUAL">Individual</option>
              <option value="COMPANY">Company</option>
            </select>
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#1e0fbf] hover:bg-[#180b8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonorEdit;