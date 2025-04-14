'use client';

import { useTheme } from 'next-themes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect } from 'react';

// Define interface for chart data
interface ChartData {
  name: string; // Category name (e.g., "Team Sports")
  value: number; // Number of sports in this category
}

// Define interface for sport (based on your schema)
interface Sport {
  sportId: string;
  sportName: string;
  description: string;
  categories: string[];
}

// Define interface for API response
interface SportsResponse {
  sports: Sport[];
}

export default function ActivityChart() {
  const { theme } = useTheme();

  // State for chart data and loading
  const [data, setData] = useState<ChartData[]>([
    { name: 'Team Sports', value: 45 },
    { name: 'Individual Sports', value: 38 },
    { name: 'Water Sports', value: 32 },
    { name: 'Track Sports', value: 28 },
    { name: 'Racket Sports', value: 25 },
    { name: 'Net Sports', value: 22 },
  ]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch data on component mount
  useEffect(() => {
    async function fetchSportsData() {
      try {
        const response = await fetch('/api/sport', {
          headers: { Authorization: 'Bearer YOUR_API_KEY' }, // Include if needed
        });
        if (!response.ok) throw new Error('Failed to fetch sports data');
        const apiData: SportsResponse = await response.json();

        // Process categories: count sports per category
        const categoryCounts: { [key: string]: number } = {};

        apiData.sports.forEach((sport) => {
          sport.categories.forEach((category) => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });
        });

        // Transform to ChartData format
        const chartData: ChartData[] = Object.entries(categoryCounts).map(([name, value]) => ({
          name,
          value,
        }));

        // Sort by value (descending) for better visualization
        chartData.sort((a, b) => b.value - a.value);

        setData(chartData.length > 0 ? chartData : data); // Fallback to mock if empty
      } catch (error) {
        console.error('Error fetching sports data:', error);
        // Retain mock data on error
      } finally {
        setLoading(false);
      }
    }

    fetchSportsData();
  }, []); // Empty dependency array to run once on mount

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        Loading chart...
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke={theme === 'dark' ? '#fff' : '#000'} />
          <YAxis stroke={theme === 'dark' ? '#fff' : '#000'} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              border: 'none',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="value" fill="#0C48C2" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}