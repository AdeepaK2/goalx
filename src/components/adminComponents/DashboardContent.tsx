'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';

interface DashboardContentProps {
  adminName: string;
}

// Type definitions for our data
interface DashboardStats {
  schoolCount: number;
  donorCount: number;
  governBodyCount: number;
}

interface ActivityItem {
  id: string;
  type: 'school' | 'donation' | 'equipment' | 'achievement';
  title: string;
  timeAgo: string;
  iconColor: string;
}

// SWR fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
};

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${diffInDays} days ago`;
};

// Helper function to get minutes for sorting
const getTimeAgoInMinutes = (timeAgo: string): number => {
  if (timeAgo.includes('minutes')) {
    return parseInt(timeAgo) || 0;
  } else if (timeAgo.includes('hours')) {
    return (parseInt(timeAgo) || 0) * 60;
  } else if (timeAgo.includes('days')) {
    return (parseInt(timeAgo) || 0) * 60 * 24;
  }
  return 0; // Default for 'Recently' or invalid strings
};

const DashboardContent: React.FC<DashboardContentProps> = ({ adminName }) => {
  // Fetch school count
  const { data: schoolData, error: schoolError, isLoading: isLoadingSchools } = useSWR('/api/school', fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    revalidateOnFocus: false
  });
  
  // Fetch donor count
  const { data: donorData, error: donorError, isLoading: isLoadingDonors } = useSWR('/api/donor', fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    revalidateOnFocus: false
  });
  
  // Fetch governing body count
  const { data: governData, error: governError, isLoading: isLoadingGovBodies } = useSWR('/api/govern', fetcher, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    revalidateOnFocus: false
  });
  
  // Fetch recent activity (schools)
  const { data: schoolsActivityData } = useSWR('/api/school?limit=2', fetcher, {
    refreshInterval: 2 * 60 * 1000, // 2 minutes
    revalidateOnFocus: false
  });
  
  // Fetch recent activity (donations)
  const { data: donationsActivityData } = useSWR('/api/donation?limit=2', fetcher, {
    refreshInterval: 2 * 60 * 1000, // 2 minutes
    revalidateOnFocus: false
  });
  
  // Fetch recent activity (equipment requests)
  const { data: equipmentActivityData } = useSWR('/api/equipment/request?limit=2', fetcher, {
    refreshInterval: 2 * 60 * 1000, // 2 minutes
    revalidateOnFocus: false
  });
  
  // Fetch recent activity (achievements)
  const { data: achievementActivityData } = useSWR('/api/achievement?limit=2', fetcher, {
    refreshInterval: 2 * 60 * 1000, // 2 minutes
    revalidateOnFocus: false
  });
  
  // Process school count
  const schoolCount = schoolData?.pagination?.total || 0;
  
  // Process donor count
  const donorCount = donorData?.pagination?.total || 0;
  
  // Process governing bodies count
  const governBodyCount = Array.isArray(governData) ? governData.length : 0;
  
  // Determine loading state for the stats boxes
  const isLoadingStats = isLoadingSchools || isLoadingDonors || isLoadingGovBodies;
  
  // Process activity data
  const recentActivity = useMemo(() => {
    const activities: ActivityItem[] = [];
    
    // Process schools
    if (schoolsActivityData?.schools && Array.isArray(schoolsActivityData.schools)) {
      schoolsActivityData.schools.forEach((school: any) => {
        if (school) {
          activities.push({
            id: String(school._id || school.schoolId || Math.random()),
            type: 'school',
            title: `New school registered: ${school.name || 'Unknown'}`,
            timeAgo: school.createdAt ? formatTimeAgo(new Date(school.createdAt)) : 'Recently',
            iconColor: 'blue'
          });
        }
      });
    }
    
    // Process donations
    if (donationsActivityData?.donations && Array.isArray(donationsActivityData.donations)) {
      donationsActivityData.donations.forEach((donation: any) => {
        if (donation) {
          activities.push({
            id: String(donation._id || donation.donationId || Math.random()),
            type: 'donation',
            title: `New ${(donation.donationType || '').toLowerCase()} donation received`,
            timeAgo: donation.createdAt ? formatTimeAgo(new Date(donation.createdAt)) : 'Recently',
            iconColor: 'green'
          });
        }
      });
    }
    
    // Process equipment requests
    if (equipmentActivityData?.equipmentRequests && Array.isArray(equipmentActivityData.equipmentRequests)) {
      equipmentActivityData.equipmentRequests.forEach((request: any) => {
        if (request) {
          activities.push({
            id: String(request._id || request.requestId || Math.random()),
            type: 'equipment',
            title: `New equipment request: ${request.eventName || 'Equipment request'}`,
            timeAgo: request.createdAt ? formatTimeAgo(new Date(request.createdAt)) : 'Recently',
            iconColor: 'purple'
          });
        }
      });
    }
    
    // Process achievements
    if (achievementActivityData?.achievements && Array.isArray(achievementActivityData.achievements)) {
      achievementActivityData.achievements.forEach((achievement: any) => {
        if (achievement) {
          activities.push({
            id: String(achievement._id || achievement.achievementId || Math.random()),
            type: 'achievement',
            title: `New achievement: ${achievement.title || 'Achievement recorded'}`,
            timeAgo: achievement.createdAt ? formatTimeAgo(new Date(achievement.createdAt)) : 'Recently',
            iconColor: 'amber'
          });
        }
      });
    }
    
    // Sort by most recent and take top 5
    return activities
      .sort((a, b) => getTimeAgoInMinutes(b.timeAgo) - getTimeAgoInMinutes(a.timeAgo))
      .slice(0, 5);
  }, [schoolsActivityData, donationsActivityData, equipmentActivityData, achievementActivityData]);
  
  // Determine if activity is loading
  const isLoadingActivity = !schoolsActivityData && !donationsActivityData && 
                          !equipmentActivityData && !achievementActivityData;
  
  // Memoize the stats to prevent unnecessary re-renders
  const dashboardStats = useMemo(() => {
    return {
      schoolCount,
      donorCount,
      governBodyCount
    };
  }, [schoolCount, donorCount, governBodyCount]);

  // Function to render the appropriate icon for activity items
  const renderActivityIcon = (type: string) => {
    switch(type) {
      case 'school':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        );
      case 'donation':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'equipment':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        );
      case 'achievement':
        return (
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h1>
      <p className="mb-6 text-gray-600">
        Welcome back, <span className="font-medium">{adminName}</span>. Here's what's happening today.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Schools</h2>
          {isLoadingStats ? (
            <p className="text-3xl font-bold animate-pulse">...</p>
          ) : (
            <p className="text-3xl font-bold">{dashboardStats.schoolCount}</p>
          )}
          <p className="text-sm mt-2">Total registered schools</p>
        </div>
        
        <div className="bg-gradient-to-r from-[#6e11b0] to-[#b019aa] text-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Donors</h2>
          {isLoadingStats ? (
            <p className="text-3xl font-bold animate-pulse">...</p>
          ) : (
            <p className="text-3xl font-bold">{dashboardStats.donorCount}</p>
          )}
          <p className="text-sm mt-2">Active donors</p>
        </div>
        
        <div className="bg-gradient-to-r from-[#b019aa] to-[#e91e63] text-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Governing Bodies</h2>
          {isLoadingStats ? (
            <p className="text-3xl font-bold animate-pulse">...</p>
          ) : (
            <p className="text-3xl font-bold">{dashboardStats.governBodyCount}</p>
          )}
          <p className="text-sm mt-2">Registered governing bodies</p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        {isLoadingActivity ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="flex items-start animate-pulse">
                <div className="bg-gray-200 p-2 rounded w-9 h-9"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="p-2 rounded" style={{
                    backgroundColor: 
                      activity.type === 'school' ? 'rgba(59, 130, 246, 0.1)' : 
                      activity.type === 'donation' ? 'rgba(16, 185, 129, 0.1)' :
                      activity.type === 'equipment' ? 'rgba(139, 92, 246, 0.1)' :
                      activity.type === 'achievement' ? 'rgba(245, 158, 11, 0.1)' :
                      'rgba(156, 163, 175, 0.1)'
                  }}>
                    {renderActivityIcon(activity.type)}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent activity found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;