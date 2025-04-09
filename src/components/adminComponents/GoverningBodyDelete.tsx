import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface GoverningBody {
  _id: string;
  governBodyId: string;
  name: string;
}

interface Props {
  governBody: GoverningBody;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}

const GoverningBodyDelete: React.FC<Props> = ({ governBody, onConfirm, onCancel }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/govern?id=${governBody.governBodyId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete governing body');
      }
      
      toast.success('Governing body deleted successfully');
      onConfirm(governBody.governBodyId);
    } catch (error: any) {
      console.error('Error deleting governing body:', error);
      toast.error(error.message || 'An error occurred while deleting governing body');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4 text-red-500">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">Delete Governing Body</h3>
        
        <p className="text-gray-700 mb-6 text-center">
          Are you sure you want to delete <span className="font-semibold">{governBody.name}</span>? This action cannot be undone.
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
  );
};

export default GoverningBodyDelete;