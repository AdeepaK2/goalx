'use client';
import { BarChart3, School, Package, Trophy, LucideIcon } from 'lucide-react';
import StatsCard from '@/components/governBody/dashboard/StatsCard';
import ActivityChart from '@/components/governBody/dashboard/ActivityChart';
import { useState, useEffect } from 'react';

// Define interface for stat object
interface Stat {
  title: string;
  value: string;
  icon: LucideIcon;
}

// Define interfaces for API responses (adjust based on your API)
interface SchoolsResponse {
  count?: number;
  schools?: Array<{ id: string; name: string }>;
}

interface SportsResponse {
  count?: number;
  sports?: Array<{ id: string; name: string }>;
}

export default function Dashboard() {
  // Initialize stats with mock values
  const [stats, setStats] = useState<Stat[]>([
    { title: 'Total Schools', value: '150', icon: School },
    { title: 'Equipment Requests', value: '45', icon: Package },
    { title: 'Achievements', value: '289', icon: Trophy },
    { title: 'Active Sports', value: '12', icon: BarChart3 },
  ]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Total Schools
        const schoolsResponse = await fetch('/api/school', {
          headers: { Authorization: 'Bearer YOUR_API_KEY' }, // Include if needed
        });
        if (!schoolsResponse.ok) throw new Error('Failed to fetch schools');
        const schoolsData: SchoolsResponse = await schoolsResponse.json();
        const totalSchools = schoolsData.count ?? schoolsData.schools?.length ?? 150;

        // Fetch Active Sports
        const sportsResponse = await fetch('/api/sport', {
          headers: { Authorization: 'Bearer YOUR_API_KEY' },
        });
        if (!sportsResponse.ok) throw new Error('Failed to fetch active sports');
        const sportsData: SportsResponse = await sportsResponse.json();
        const activeSports = sportsData.count ?? sportsData.sports?.length ?? 12;

        // Update stats with real values
        setStats((prevStats) =>
          prevStats.map((stat) => {
            if (stat.title === 'Total Schools') {
              return { ...stat, value: totalSchools.toString() };
            }
            if (stat.title === 'Active Sports') {
              return { ...stat, value: activeSports.toString() };
            }
            return stat; // Keep Equipment Requests and Achievements unchanged
          })
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        // Retain mock values on error
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // Empty dependency array to run once on mount

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Sports Activity</h2>
        <ActivityChart />
      </div>
    </div>
  );
}