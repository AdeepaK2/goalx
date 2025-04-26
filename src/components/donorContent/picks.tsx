import React, { useState, useEffect } from 'react';
import { FiMapPin, FiAward, FiHeart, FiDollarSign, FiPackage, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { FaPlus } from 'react-icons/fa';
import { DonationForm } from './donations'; // Import the DonationForm component

interface DonorData {
  id: string;
  donorId: string;
  name: string;
  email: string;
  donorType: string;
  location?: {
    district?: string;
    province?: string;
  };
}

interface SchoolNeed {
  id: string;
  schoolId: string;
  schoolName: string;
  district: string;
  province: string;
  achievements: string[];
  needType: 'EQUIPMENT' | 'MONETARY' | 'OTHER';
  description: string;
  targetAmount?: number;
  itemsNeeded?: string[];
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  imageUrl?: string;
  distance?: number; // in km
  relevanceScore?: number; // 0-100
  sports?: string[];
}

interface SchoolNeedsProps {
  donorData: DonorData;
}

const SchoolNeeds: React.FC<SchoolNeedsProps> = ({ donorData }) => {
  const [schoolNeeds, setSchoolNeeds] = useState<SchoolNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtering, setFiltering] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    district: '',
    province: '',
    needType: '',
    urgency: ''
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    const fetchSchoolNeeds = async () => {
      try {
        setLoading(true);
        
        // Build query params for filters
        const queryParams = new URLSearchParams();
        if (filters.district) queryParams.append('district', filters.district);
        if (filters.province) queryParams.append('province', filters.province);
        if (filters.urgency) queryParams.append('urgency', filters.urgency);
        
        // Fetch schools in need from API
        const response = await fetch(`/api/school/needs?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process schools with donor proximity if location available
        const processedSchools = data.schools || [];
        
        // Extract unique districts and provinces for filter dropdowns
        const uniqueDistricts = [...new Set(processedSchools.map((s: SchoolNeed) => s.district))] as string[];
        const uniqueProvinces = [...new Set(processedSchools.map((s: SchoolNeed) => s.province))] as string[];
        setDistricts(uniqueDistricts);
        setProvinces(uniqueProvinces);
        
        // Set the schools
        setSchoolNeeds(processedSchools);
        
        // Get Gemini analysis if schools are available
        if (processedSchools.length > 0) {
          await getGeminiAnalysis(processedSchools, donorData);
        }
        
      } catch (err) {
        console.error("Error fetching school needs:", err);
        setError("Unable to load schools. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    const getGeminiAnalysis = async (schools: SchoolNeed[], donor: DonorData) => {
      try {
        setFiltering(true);
        // Call Gemini API for personalized analysis
        const response = await fetch('/api/gemini/analyze-schools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            donorData: {
              id: donor.id,
              location: donor.location,
              donorType: donor.donorType,
              donorId: donor.donorId
            },
            schools: schools.map(s => ({
              id: s.id,
              name: s.schoolName,
              district: s.district,
              province: s.province,
              needs: s.description,
              achievements: s.achievements,
              sports: s.sports,
              needType: s.needType,
              itemsNeeded: s.itemsNeeded,
              targetAmount: s.targetAmount,
              urgencyLevel: s.urgencyLevel
            }))
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update with Gemini relevance scores
          if (data.scoredSchools) {
            setSchoolNeeds(prev => 
              prev.map(school => {
                const scored = data.scoredSchools.find((s: any) => s.id === school.id);
                return scored ? { 
                  ...school, 
                  relevanceScore: scored.relevanceScore,
                  distance: scored.distance
                } : school;
              }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
            );
          }
          
          // Set analysis text
          if (data.analysis) {
            setAnalysis(data.analysis);
          }
        }
      } catch (e) {
        console.error("Error with Gemini analysis:", e);
        // Continue without Gemini analysis
      } finally {
        setFiltering(false);
      }
    };

    fetchSchoolNeeds();
  }, [donorData, filters.district, filters.province, filters.urgency]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#6e11b0] to-[#1e0fbf] px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Schools in Need
          </h1>
          <p className="text-blue-100 text-xl mt-4 text-center max-w-2xl mx-auto">
            Discover schools that need your support for their sports programs.
          </p>
        </div>
      </div>

      {/* Schools Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 space-y-6">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex justify-between items-center" onClick={() => setFiltersOpen(!filtersOpen)}>
            <h3 className="text-lg font-semibold text-gray-800">Filter Schools</h3>
            <button className="text-gray-500 focus:outline-none">
              {filtersOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>
          
          {filtersOpen && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filters.province}
                  onChange={(e) => handleFilterChange('province', e.target.value)}
                >
                  <option value="">All Provinces</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filters.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Need Type</label>
                <select 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filters.needType}
                  onChange={(e) => handleFilterChange('needType', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="MONETARY">Monetary</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filters.urgency}
                  onChange={(e) => handleFilterChange('urgency', e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* AI Analysis Card */}
        {filtering && (
          <div className="bg-blue-50 p-4 rounded-md shadow text-center">
            <div className="inline-block animate-pulse">
              <HiOutlineAcademicCap className="inline-block text-blue-600 h-5 w-5 mr-2" />
              <span className="text-blue-800">Finding the best school matches for you...</span>
            </div>
          </div>
        )}
        
        {analysis && (
          <div className="bg-white shadow rounded-lg p-5 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <HiOutlineAcademicCap className="text-purple-600 mr-2" />
              Personalized Recommendations
            </h3>
            <p className="text-gray-600">{analysis}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {schoolNeeds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {schoolNeeds.map((school) => (
              <div key={school.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                {/* School image or placeholder */}
                <div className="h-48 bg-gray-200 relative">
                  {school.imageUrl ? (
                    <img 
                      src={`/api/file/download?fileUrl=${encodeURIComponent(school.imageUrl)}`}
                      alt={school.schoolName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback in case image fails to load
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/images/school-placeholder.png';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-300">
                      <HiOutlineAcademicCap className="h-16 w-16 text-gray-400 mb-2" />
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                  
                  {/* Urgency badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                    school.urgencyLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                    school.urgencyLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {school.urgencyLevel === 'HIGH' ? 'Urgent Need' :
                     school.urgencyLevel === 'MEDIUM' ? 'Moderate Need' :
                     'General Need'}
                  </div>
                  
                  {/* Donation type badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold bg-white/80 backdrop-blur-sm flex items-center">
                    {school.needType === 'MONETARY' ? (
                      <>
                        <FiDollarSign className="mr-1" />
                        <span>Financial</span>
                      </>
                    ) : (
                      <>
                        <FiPackage className="mr-1" />
                        <span>Equipment</span>
                      </>
                    )}
                  </div>
                  
                  {/* Relevance score if available */}
                  {school.relevanceScore && (
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-purple-800 border border-purple-200">
                      {school.relevanceScore}% Match
                    </div>
                  )}
                </div>
                
                {/* School details */}
                <div className="p-5 flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{school.schoolName}</h3>
                  
                  <div className="flex items-start mb-2">
                    <FiMapPin className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-gray-600 text-sm">
                      {school.district}, {school.province}
                      {school.distance && (
                        <span className="ml-1 text-gray-500">
                          ({Math.round(school.distance * 10) / 10} km away)
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {/* Sports */}
                  {school.sports && school.sports.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {school.sports.map((sport, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          {sport}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Achievements */}
                  {school.achievements && school.achievements.length > 0 && (
                    <div className="flex items-start mb-3">
                      <FiAward className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Recent Achievements:</p>
                        <ul className="text-sm text-gray-600 list-disc pl-4">
                          {school.achievements.slice(0, 2).map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                          {school.achievements.length > 2 && (
                            <li className="text-purple-600 font-medium">
                              +{school.achievements.length - 2} more
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* Need description */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-1 font-medium">Donation Need:</p>
                    <p className="text-sm text-gray-600">{school.description}</p>
                  </div>
                  
                  {/* For monetary needs */}
                  {school.needType === 'MONETARY' && school.targetAmount && (
                    <div className="mt-2 mb-4">
                      <p className="text-sm text-gray-600">
                        Target: <span className="font-medium">LKR {school.targetAmount.toLocaleString()}</span>
                      </p>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">15% funded</p>
                    </div>
                  )}
                  
                  {/* For equipment needs */}
                  {school.needType === 'EQUIPMENT' && school.itemsNeeded && (
                    <div className="mt-2 mb-4">
                      <p className="text-sm text-gray-700 mb-1">Items Needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {school.itemsNeeded.map((item, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="px-5 pb-5 pt-0">
                  <button 
                    onClick={() => {
                      setSelectedSchool({ id: school.id, name: school.schoolName });
                      setShowDonationForm(true);
                    }}
                    className="w-full bg-[#6e11b0] hover:bg-[#5a0e91] text-white py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center"
                  >
                    <FiHeart className="mr-2" /> Support This School
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <HiOutlineAcademicCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No schools found</h3>
            <p className="mt-1 text-sm text-gray-500">We couldn't find any schools matching your criteria. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Donation Form Modal Overlay */}
      {showDonationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <DonationForm 
            onClose={() => setShowDonationForm(false)} 
            donorData={donorData}
            preselectedSchool={selectedSchool} 
          />
        </div>
      )}
    </div>
  );
};

export default SchoolNeeds;