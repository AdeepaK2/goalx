import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

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

interface DonorDeleteProps {
  donor: Donor;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}

const DonorDelete: React.FC<DonorDeleteProps> = ({ donor, onConfirm, onCancel }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/donor?id=${donor.donorId || donor._id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete donor');
      }
      
      toast.success('Donor deleted successfully');
      onConfirm(donor.donorId || donor._id);
    } catch (error: unknown) {
      console.error('Error deleting donor:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred while deleting donor');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
        <div className="bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] px-6 py-4">
          <h3 className="text-xl font-medium text-white">Delete Donor</h3>
        </div>
        
        <div className="px-6 py-4">
          <div className="mt-2">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{donor.displayName}</span>? This action cannot be undone.
            </p>
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e0fbf]"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDelete;