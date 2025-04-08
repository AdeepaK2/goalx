import React from 'react';

const SettingsContent: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Site Settings</h1>
      
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="site-name" className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                id="site-name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-transparent"
                defaultValue="GoalX Education Platform"
              />
            </div>
            
            <div>
              <label htmlFor="site-description" className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <textarea
                id="site-description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-transparent"
                defaultValue="Empowering education through community support and resource sharing."
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                id="contact-email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-transparent"
                defaultValue="contact@goalx.org"
              />
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  className="h-10 w-10 border border-gray-300 rounded cursor-pointer"
                  defaultValue="#1e0fbf"
                />
                <input
                  type="text"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-transparent"
                  defaultValue="#1e0fbf"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  className="h-10 w-10 border border-gray-300 rounded cursor-pointer"
                  defaultValue="#6e11b0"
                />
                <input
                  type="text"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e0fbf] focus:border-transparent"
                  defaultValue="#6e11b0"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">System</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="maintenance-mode"
                type="checkbox"
                className="h-4 w-4 text-[#1e0fbf] focus:ring-[#1e0fbf] border-gray-300 rounded"
              />
              <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-700">
                Enable Maintenance Mode
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="debug-mode"
                type="checkbox"
                className="h-4 w-4 text-[#1e0fbf] focus:ring-[#1e0fbf] border-gray-300 rounded"
              />
              <label htmlFor="debug-mode" className="ml-2 block text-sm text-gray-700">
                Enable Debug Mode
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button className="px-4 py-2 bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white rounded-lg hover:opacity-90 transition-opacity">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;