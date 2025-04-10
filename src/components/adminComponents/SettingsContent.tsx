import React, { useState, useEffect } from 'react';
import AddSport from './AddSport';
import AddEquipment from './AddEquipment';

const SettingsContent: React.FC = () => {
  // States
  const [activeTab, setActiveTab] = useState<'sports' | 'equipment'>('sports');
  const [sports, setSports] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddSport, setShowAddSport] = useState<boolean>(false);
  const [showAddEquipment, setShowAddEquipment] = useState<boolean>(false);
  
  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteItemType, setDeleteItemType] = useState<'sport' | 'equipment'>('sport');
  const [deleteItemId, setDeleteItemId] = useState<string>('');
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  
  // Fetch sports data
  const fetchSports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sport${searchQuery ? `?name=${searchQuery}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch sports');
      
      const data = await response.json();
      setSports(data.sports || []);
    } catch (err) {
      setError('Error loading sports data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch equipment data
  const fetchEquipment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = '/api/equipment';
      if (selectedSport) url += `?sport=${selectedSport}`;
      else if (searchQuery) url += `?name=${searchQuery}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch equipment');
      
      const data = await response.json();
      setEquipment(data.equipment || []);
    } catch (err) {
      setError('Error loading equipment data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sport selection for equipment filtering
  const handleSportSelect = (sportId: string) => {
    setSelectedSport(sportId === selectedSport ? '' : sportId);
  };

  // Delete sport
  const handleDeleteSport = async (sportId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/sport?id=${sportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete sport');
      
      fetchSports();
      setShowDeleteModal(false);
    } catch (err) {
      setError('Error deleting sport');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete equipment
  const handleDeleteEquipment = async (equipmentId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/equipment?id=${equipmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete equipment');
      
      fetchEquipment();
      setShowDeleteModal(false);
    } catch (err) {
      setError('Error deleting equipment');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (type: 'sport' | 'equipment', id: string, name: string) => {
    setDeleteItemType(type);
    setDeleteItemId(id);
    setDeleteItemName(name);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteItemType === 'sport') {
      handleDeleteSport(deleteItemId);
    } else {
      handleDeleteEquipment(deleteItemId);
    }
  };

  // Handle successful sport addition
  const handleSportAdded = () => {
    setShowAddSport(false);
    fetchSports();
  };

  // Handle successful equipment addition
  const handleEquipmentAdded = () => {
    setShowAddEquipment(false);
    fetchEquipment();
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    if (activeTab === 'sports') {
      fetchSports();
    } else {
      fetchEquipment();
    }
  }, [activeTab, searchQuery, selectedSport]);

  // Always fetch sports for the equipment dropdown
  useEffect(() => {
    if (activeTab === 'equipment' && sports.length === 0) {
      fetchSports();
    }
  }, [activeTab]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sports & Equipment Management</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'sports' 
            ? 'text-[#1e0fbf] border-b-2 border-[#1e0fbf]' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('sports')}
        >
          Sports
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'equipment' 
            ? 'text-[#1e0fbf] border-b-2 border-[#1e0fbf]' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('equipment')}
        >
          Equipment
        </button>
      </div>
      
      {/* Add buttons and search bar row */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {activeTab === 'equipment' && (
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg w-full"
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
            >
              <option value="">All Sports</option>
              {sports.map(sport => (
                <option key={sport._id} value={sport._id}>
                  {sport.sportName}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddEquipment(true)}
              className="px-4 py-2 text-white bg-[#1e0fbf] rounded-lg hover:bg-indigo-700 focus:outline-none"
            >
              Add Equipment
            </button>
          </div>
        )}
        
        {activeTab === 'sports' && (
          <button
            onClick={() => setShowAddSport(true)}
            className="px-4 py-2 text-white bg-[#1e0fbf] rounded-lg hover:bg-indigo-700 focus:outline-none"
          >
            Add Sport
          </button>
        )}
      </div>
      
      {/* Add Sport Modal */}
      {showAddSport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <AddSport 
              onSuccess={handleSportAdded} 
              onCancel={() => setShowAddSport(false)} 
            />
          </div>
        </div>
      )}
      
      {/* Add Equipment Modal */}
      {showAddEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <AddEquipment 
              sports={sports}
              onSuccess={handleEquipmentAdded} 
              onCancel={() => setShowAddEquipment(false)} 
            />
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              {deleteItemType === 'sport' 
                ? `Are you sure you want to delete the sport "${deleteItemName}"? This will also delete all associated equipment.` 
                : `Are you sure you want to delete the equipment "${deleteItemName}"?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Content based on active tab */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e0fbf]"></div>
        </div>
      ) : activeTab === 'sports' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sports.length > 0 ? (
                sports.map((sport) => (
                  <tr key={sport._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sport.sportId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sport.sportName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{sport.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sport.categories && sport.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sport.categories.map((cat: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedSport(sport._id);
                          setActiveTab('equipment');
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View Equipment
                      </button>
                      <button 
                        onClick={() => showDeleteConfirmation('sport', sport._id || sport.sportId, sport.sportName)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No sports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipment.length > 0 ? (
                equipment.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.equipmentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sport?.sportName || 'Unknown Sport'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.description || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => showDeleteConfirmation('equipment', item._id || item.equipmentId, item.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No equipment found. {selectedSport ? 'Try a different sport.' : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SettingsContent;