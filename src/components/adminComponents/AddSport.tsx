import React, { useState } from 'react';

interface AddSportProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddSport: React.FC<AddSportProps> = ({ onSuccess, onCancel }) => {
  const [sportName, setSportName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const categoriesArray = categories
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0);

      const response = await fetch('/api/sport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sportName,
          description,
          categories: categoriesArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add sport');
      }

      // Reset form and notify parent component
      setSportName('');
      setDescription('');
      setCategories('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Sport</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="sportName" className="block text-sm font-medium text-gray-700 mb-1">
            Sport Name*
          </label>
          <input
            id="sportName"
            type="text"
            value={sportName}
            onChange={(e) => setSportName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description*
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
            Categories (comma-separated)
          </label>
          <input
            id="categories"
            type="text"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="e.g. Indoor, Team, Winter"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1e0fbf] rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Sport'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSport;