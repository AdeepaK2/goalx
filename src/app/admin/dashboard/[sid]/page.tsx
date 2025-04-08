'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/solid';
import {
  BuildingLibraryIcon,
  TrophyIcon,
  GiftIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface School {
  _id: string;
  schoolId: string;
  sid: number;
  name: string;
  location: {
    district: string;
    zonal?: string;
    province: string;
  };
  contact?: {
    email?: string;
    phone?: string;
  };
  principalName?: string;
  verified?: boolean;
  adminVerified?: boolean;
}

interface Achievement {
  _id: string;
  achievementId: string;
  title: string;
  year: number;
  level: string;
  position?: string;
  event?: string;
}

interface Donation {
  _id: string;
  donationId: string;
  donationType: string;
  status: string;
  monetaryDetails?: {
    amount: number;
    currency: string;
  };
  createdAt: string;
  donor: {
    displayName: string;
  };
}

interface EquipmentRequest {
  _id: string;
  requestId: string;
  eventName: string;
  status: string;
  createdAt: string;
  items: {
    equipment: {
      name: string;
    };
    quantityRequested: number;
  }[];
}

interface SchoolDetailsPageProps {
  params: Promise<{ sid: string }>; // Keep params as a Promise
  searchParams?: Promise<any>; // Update searchParams to match the expected type
}

// Sri Lankan provinces and districts for the form
const sriLankanProvinces = [
  'Central Province',
  'Eastern Province',
  'North Central Province',
  'Northern Province',
  'North Western Province',
  'Sabaragamuwa Province',
  'Southern Province',
  'Uva Province',
  'Western Province'
];

// Mapping of provinces to their districts
const districtsByProvince: Record<string, string[]> = {
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Eastern Province': ['Ampara', 'Batticaloa', 'Trincomalee'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
  'North Western Province': ['Kurunegala', 'Puttalam'],
  'Sabaragamuwa Province': ['Kegalle', 'Ratnapura'],
  'Southern Province': ['Galle', 'Hambantota', 'Matara'],
  'Uva Province': ['Badulla', 'Monaragala'],
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara']
};

export default function SchoolDetailsPage({ params }: SchoolDetailsPageProps) {
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);
  const [editedSchool, setEditedSchool] = useState<School | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSchoolData = async () => {
      setLoading(true);
      try {
        const resolvedParams = await params; // Resolve the promise
        const schoolRes = await fetch(`/api/school?id=${resolvedParams.sid}`);
        if (!schoolRes.ok) throw new Error('Failed to fetch school details');
        const schoolData = await schoolRes.json();
        setSchool(schoolData);
        setEditedSchool(schoolData);

        // Fetch achievements (assuming we need to fetch by school ID)
        const playRes = await fetch(`/api/play?school=${schoolData._id}`);
        if (playRes.ok) {
          const playData = await playRes.json();
          if (playData.plays && playData.plays.length > 0) {
            // For each play, fetch achievements
            const allAchievements: Achievement[] = [];
            for (const play of playData.plays) {
              const achieveRes = await fetch(`/api/achievement?play=${play._id}`);
              if (achieveRes.ok) {
                const achieveData = await achieveRes.json();
                if (achieveData.achievements) {
                  allAchievements.push(...achieveData.achievements);
                }
              }
            }
            setAchievements(allAchievements);
          }
        }

        // Fetch donations
        const donationRes = await fetch(`/api/donation?recipient=${schoolData._id}`);
        if (donationRes.ok) {
          const donationData = await donationRes.json();
          setDonations(donationData.donations || []);
        }

        // Fetch equipment requests
        const equipmentRes = await fetch(`/api/equipment/request?school=${schoolData._id}`);
        if (equipmentRes.ok) {
          const equipmentData = await equipmentRes.json();
          setEquipmentRequests(equipmentData.equipmentRequests || []);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load school data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [params]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (!editedSchool) return;

    if (name.includes('.')) {
      // Handle nested properties like location.province
      const [parent, child] = name.split('.');

      setEditedSchool((prev) => {
        if (!prev) return prev;

        if (parent === 'location') {
          return {
            ...prev,
            location: {
              ...prev.location,
              [child]: value,
            },
          };
        } else if (parent === 'contact') {
          return {
            ...prev,
            contact: {
              ...prev.contact || {},
              [child]: value,
            },
          };
        }
        return prev;
      });

      // Auto-reset district when province changes
      if (name === 'location.province') {
        setEditedSchool((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            location: {
              ...prev.location,
              district: '',
            },
          };
        });
      }
    } else {
      // Handle top-level properties
      setEditedSchool((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: value,
        };
      });
    }
  };

  const saveSchoolChanges = async () => {
    if (!editedSchool) return;

    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/school?id=${editedSchool._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedSchool.name,
          location: editedSchool.location,
          contact: editedSchool.contact,
          principalName: editedSchool.principalName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update school details');
      }

      const updatedSchool = await response.json();
      setSchool(updatedSchool);
      setSaveSuccess(true);

      // Exit edit mode after successful save
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1500);

    } catch (err) {
      console.error('Error updating school:', err);
      setError('Failed to update school details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSchoolChanges();
  };

  const cancelEdit = () => {
    setEditedSchool(school);
    setIsEditing(false);
    setError('');
  };

  const navigateBackToSchools = () => {
    router.push('/admin/dashboard?tab=schools');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading school data...</p>
        </div>
      </div>
    );
  }

  if (error && !school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link href="/admin/dashboard" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 inline-flex items-center">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">School Not Found</h1>
          <p className="text-gray-700 mb-6">The requested school could not be found.</p>
          <Link href="/admin/dashboard" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 inline-flex items-center">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total monetary donations
  const totalDonations = donations
    .filter(d => d.donationType === 'MONETARY' && d.status === 'completed')
    .reduce((sum, d) => sum + (d.monetaryDetails?.amount || 0), 0);

  // Count completed equipment donations
  const equipmentDonations = donations.filter(d => 
    d.donationType === 'EQUIPMENT' && d.status === 'completed'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header with back button */}
      <div className="bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white py-6 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={navigateBackToSchools}
              className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{school.name}</h1>
              <p className="text-sm opacity-80">School ID: {school.schoolId} | SID: {school.sid}</p>
            </div>
          </div>
          
          {activeTab === 'overview' && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/30"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit School
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification when saving is successful */}
        {saveSuccess && (
          <div className="mb-4 p-3 bg-purple-100 text-[#6e11b0] border border-[#6e11b0]/30 rounded-lg flex items-center">
            <CheckIcon className="w-5 h-5 mr-2" />
            School details updated successfully
          </div>
        )}
        
        {/* Error notification */}
        {error && isEditing && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Navigation tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview', icon: <BuildingLibraryIcon className="w-5 h-5" /> },
              { id: 'achievements', name: 'Achievements', icon: <TrophyIcon className="w-5 h-5" />, count: achievements.length },
              { id: 'donations', name: 'Donations', icon: <GiftIcon className="w-5 h-5" />, count: donations.length },
              { id: 'equipment', name: 'Equipment Requests', icon: <ClipboardDocumentListIcon className="w-5 h-5" />, count: equipmentRequests.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={isEditing}
                className={`
                  flex items-center whitespace-nowrap pb-4 pt-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  ${isEditing && 'opacity-50 pointer-events-none'}
                `}
              >
                {tab.icon}
                <span className="ml-2">{tab.name}</span>
                {tab.count !== undefined && (
                  <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    activeTab === tab.id ? 'bg-[#1e0fbf]/10 text-[#1e0fbf]' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab - Read Mode */}
        {activeTab === 'overview' && !isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">School Information</h2>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-sm text-primary hover:text-primary/80"
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <BuildingLibraryIcon className="w-5 h-5 text-[#6e11b0] mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">School Name</p>
                      <p className="text-gray-800 font-medium">{school.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPinIcon className="w-5 h-5 text-[#6e11b0] mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-gray-800">
                        {school.location.zonal && `${school.location.zonal}, `}
                        {school.location.district}, {school.location.province}
                      </p>
                    </div>
                  </div>
                  
                  {school.contact?.email && (
                    <div className="flex items-start">
                      <EnvelopeIcon className="w-5 h-5 text-[#6e11b0] mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-800">{school.contact.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {school.contact?.phone && (
                    <div className="flex items-start">
                      <PhoneIcon className="w-5 h-5 text-[#6e11b0] mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-gray-800">{school.contact.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {school.principalName && (
                    <div className="flex items-start">
                      <UserIcon className="w-5 h-5 text-[#6e11b0] mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Principal</p>
                        <p className="text-gray-800">{school.principalName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Activity Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {[...donations.slice(0, 2), ...equipmentRequests.slice(0, 2)]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3)
                    .map((item, idx) => (
                      <div key={idx} className="border-l-4 border-[#1e0fbf] pl-4 py-1">
                        <p className="text-sm font-medium text-gray-900">
                          {'donationType' in item ? 
                            `${item.donationType} Donation (${item.donationId})` : 
                            `Equipment Request for "${item.eventName}" (${item.requestId})`
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </p>
                      </div>
                    ))}
                  
                  {donations.length === 0 && equipmentRequests.length === 0 && (
                    <p className="text-gray-500 text-sm">No recent activity found</p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistics</h2>
                <div className="space-y-6">
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-[#6e11b0]">
                    <p className="text-sm font-medium text-gray-700">Total Achievements</p>
                    <div className="flex items-center mt-1">
                      <TrophyIcon className="w-5 h-5 text-[#6e11b0] mr-2" />
                      <p className="text-2xl font-bold text-gray-800">{achievements.length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Total Monetary Donations</p>
                    <div className="flex items-center mt-1">
                      <GiftIcon className="w-5 h-5 text-green-500 mr-2" />
                      <p className="text-2xl font-bold text-gray-800">
                        {totalDonations.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'LKR',
                          maximumFractionDigits: 0
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Equipment Donations</p>
                    <div className="flex items-center mt-1">
                      <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500 mr-2" />
                      <p className="text-2xl font-bold text-gray-800">{equipmentDonations}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Admin Actions Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Actions</h2>
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center py-2 px-4 rounded-md bg-[#1e0fbf] text-white hover:bg-[#1e0fbf]/90 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit School Details
                  </button>
                  
                  {/* Toggle school status button */}
                  <button 
                    onClick={async () => {
                      try {
                        // Perform status update PATCH request
                        const response = await fetch(`/api/school?id=${school._id}`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            verified: !school.verified,
                            adminVerified: !school.verified // Toggle together
                          }),
                        });
                        
                        if (!response.ok) throw new Error('Failed to update school status');
                        
                        const updatedSchool = await response.json();
                        setSchool(updatedSchool);
                        setSaveSuccess(true);
                        
                        setTimeout(() => {
                          setSaveSuccess(false);
                        }, 1500);
                      } catch (err) {
                        console.error('Error updating school status:', err);
                        setError('Failed to update school status. Please try again.');
                      }
                    }}
                    className={`w-full flex items-center justify-center py-2 px-4 rounded-md ${
                      school.verified 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white transition-colors`}
                  >
                    {school.verified 
                      ? 'Deactivate School Account' 
                      : 'Activate School Account'
                    }
                  </button>
                  
                  {/* Reset password option */}
                  <button 
                    onClick={async () => {
                      const confirmReset = window.confirm(
                        'Are you sure you want to reset this school\'s password? A temporary password will be generated and sent to their email.'
                      );
                      
                      if (confirmReset) {
                        try {
                          // Call API to reset password
                          const response = await fetch(`/api/school/reset-password?id=${school._id}`, {
                            method: 'POST',
                          });
                          
                          if (!response.ok) throw new Error('Failed to reset password');
                          
                          alert('Password reset link has been sent to the school\'s email address.');
                        } catch (err) {
                          console.error('Error resetting password:', err);
                          alert('Failed to reset password. Please try again.');
                        }
                      }
                    }}
                    className="w-full flex items-center justify-center py-2 px-4 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab - Edit Mode */}
        {activeTab === 'overview' && isEditing && editedSchool && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Edit School Information</h2>
              <button
                onClick={cancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              {/* School Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  School Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editedSchool.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e11b0] focus:border-[#6e11b0]"
                  placeholder="Enter school name"
                  required
                />
              </div>
              
              {/* Location */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location.province" className="block text-sm font-medium text-gray-700 mb-1">
                    Province*
                  </label>
                  <select
                    id="location.province"
                    name="location.province"
                    value={editedSchool.location.province}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e11b0] focus:border-[#6e11b0]"
                    required
                  >
                    <option value="">Select a province</option>
                    {sriLankanProvinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="location.district" className="block text-sm font-medium text-gray-700 mb-1">
                    District*
                  </label>
                  <select
                    id="location.district"
                    name="location.district"
                    value={editedSchool.location.district}
                    onChange={handleInputChange}
                    disabled={!editedSchool.location.province}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e11b0] focus:border-[#6e11b0]"
                    required
                  >
                    <option value="">Select a district</option>
                    {editedSchool.location.province && 
                      districtsByProvince[editedSchool.location.province]?.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="location.zonal" className="block text-sm font-medium text-gray-700 mb-1">
                  Zonal Education Office (Optional)
                </label>
                <input
                  type="text"
                  id="location.zonal"
                  name="location.zonal"
                  value={editedSchool.location.zonal || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e11b0] focus:border-[#6e11b0]"
                  placeholder="Enter zonal education office"
                />
              </div>
              
              {/* Contact Information */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact.email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="contact.email"
                    name="contact.email"
                    value={editedSchool.contact?.email || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e11b0] focus:border-[#6e11b0]"
                    placeholder="school@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="contact.phone"
                    name="contact.phone"
                    value={editedSchool.contact?.phone || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e11b0] focus:border-[#6e11b0]"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              {/* Principal Name */}
              <div className="mb-6">
                <label htmlFor="principalName" className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Name (Optional)
                </label>
                <input
                  type="text"
                  id="principalName"
                  name="principalName"
                  value={editedSchool.principalName || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6e11b0] focus:border-[#6e11b0]"
                  placeholder="Enter principal's name"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#1e0fbf] text-white rounded-lg hover:bg-[#1e0fbf]/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">School Achievements</h2>
                <p className="text-gray-500 mt-1">Historic accomplishments and awards</p>
              </div>
            </div>
            
            {achievements.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <TrophyIcon className="w-16 h-16 mx-auto text-gray-300" />
                <p className="mt-4 text-lg font-medium">No achievements recorded yet</p>
                <p className="mt-2 max-w-md mx-auto">
                  This school doesn't have any recorded sports achievements yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Achievement
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {achievements.map((achievement) => (
                      <tr key={achievement._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{achievement.title}</div>
                          <div className="text-sm text-gray-500">{achievement.event}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {achievement.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            achievement.level === 'International' ? 'bg-purple-100 text-purple-800' :
                            achievement.level === 'National' ? 'bg-indigo-100 text-indigo-800' :
                            achievement.level === 'Provincial' ? 'bg-blue-100 text-blue-800' :
                            achievement.level === 'District' ? 'bg-green-100 text-green-800' :
                            achievement.level === 'Zonal' ? 'bg-teal-100 text-teal-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {achievement.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {achievement.position || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {achievement.achievementId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Donations</h2>
                <p className="text-gray-500 mt-1">All donations received by the school</p>
              </div>
            </div>
            
            {donations.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <GiftIcon className="w-16 h-16 mx-auto text-gray-300" />
                <p className="mt-4 text-lg font-medium">No donations recorded yet</p>
                <p className="mt-2 max-w-md mx-auto">
                  This school hasn't received any donations yet.
                </p>
              </div>
            ) : (
              <div>
                {/* Donation Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gray-50">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-800">{donations.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Monetary Donations</p>
                    <p className="text-2xl font-bold text-green-600">
                      {totalDonations.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'LKR',
                        maximumFractionDigits: 0
                      })}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm font-medium text-gray-500">Equipment Donations</p>
                    <p className="text-2xl font-bold text-blue-600">{equipmentDonations}</p>
                  </div>
                </div>
              
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Donation ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Donor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount/Details
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {donations.map((donation) => (
                        <tr key={donation._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {donation.donationId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {donation.donor.displayName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              donation.donationType === 'MONETARY' ? 'bg-green-100 text-green-800' :
                              donation.donationType === 'EQUIPMENT' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {donation.donationType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {donation.donationType === 'MONETARY' && donation.monetaryDetails
                              ? `${donation.monetaryDetails.amount.toLocaleString()} ${donation.monetaryDetails.currency}`
                              : 'View Details'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                              donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              donation.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {donation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Equipment Requests Tab */}
        {activeTab === 'equipment' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Equipment Requests</h2>
                <p className="text-gray-500 mt-1">All equipment requests made by the school</p>
              </div>
            </div>
            
            {equipmentRequests.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <ClipboardDocumentListIcon className="w-16 h-16 mx-auto text-gray-300" />
                <p className="mt-4 text-lg font-medium">No equipment requests recorded yet</p>
                <p className="mt-2 max-w-md mx-auto">
                  This school hasn't made any equipment requests yet.
                </p>
              </div>
            ) : (
              <div>
                {/* Request Status Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-gray-50">
                  {[
                    { status: 'all', label: 'All Requests', count: equipmentRequests.length, color: 'gray' },
                    { status: 'pending', label: 'Pending', count: equipmentRequests.filter(r => r.status === 'pending').length, color: 'yellow' },
                    { status: 'approved', label: 'Approved', count: equipmentRequests.filter(r => r.status === 'approved').length, color: 'green' },
                    { status: 'rejected', label: 'Rejected', count: equipmentRequests.filter(r => r.status === 'rejected').length, color: 'red' }
                  ].map(item => (
                    <div key={item.status} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 border-${item.color}-500`}>
                      <p className="text-sm font-medium text-gray-500">{item.label}</p>
                      <p className="text-2xl font-bold text-gray-800">{item.count}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Request ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {equipmentRequests.map((request) => (
                        <tr key={request._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {request.requestId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.eventName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.items.slice(0, 2).map((item, i) => (
                              <div key={i}>
                                {item.equipment.name} ({item.quantityRequested})
                              </div>
                            ))}
                            {request.items.length > 2 && (
                              <div className="text-xs text-gray-400">
                                +{request.items.length - 2} more
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
