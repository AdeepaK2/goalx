'use client';

import React from 'react';

const sportsData = [
  { name: 'Football', players: 120, schools: 20, popularity: 'High' },
  { name: 'Netball', players: 80, schools: 15, popularity: 'Medium' },
  { name: 'Cricket', players: 50, schools: 10, popularity: 'Low' },
  { name: 'Volleyball', players: 95, schools: 18, popularity: 'Medium' },
  { name: 'Basketball', players: 60, schools: 12, popularity: 'Low' },
];

const getPopularityColor = (level: string) => {
  switch (level) {
    case 'High':
      return 'bg-green-100 text-green-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-red-100 text-red-800';
    default:
      return '';
  }
};

export default function SportsSummaryPage() {
  return (
    <div className="p-6 bg-white min-h-screen rounded-xl shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1E0FBF]">Sports Summary</h1>
        <button className="bg-[#1E0FBF] text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700">
          + Add Sport
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Sport</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Players</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Schools</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Popularity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sportsData.map((sport, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-900">{sport.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{sport.players}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{sport.schools}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPopularityColor(sport.popularity)}`}>
                    {sport.popularity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
