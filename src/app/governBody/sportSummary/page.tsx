'use client';

import React, { useEffect, useState } from 'react';

interface Sport {
  sportId: string;
  sportName: string;
  description: string;
  categories: string[];
  players?: number;
  schools?: number;
}

export default function SportsSummaryPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchSports() {
      const res = await fetch('/api/sport');
      const data = await res.json();
      setSports(data.sports);
      setLoading(false);
    }
    fetchSports();
  }, []);

  const allCategories = Array.from(new Set(sports.flatMap((s) => s.categories))).sort();

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const filteredSports = sports.filter((sport) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      sport.categories.some((cat) => selectedCategories.includes(cat));

    const matchesSearch = sport.sportName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 bg-white min-h-screen rounded-xl shadow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E0FBF] mb-4">Sports Summary</h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search sport name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded-lg shadow text-sm w-full sm:w-60 focus:outline-none"
          />

          {/* Multi-select Category Filter */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1 rounded-full border text-sm transition ${
                  selectedCategories.includes(cat)
                    ? 'bg-[#1E0FBF] text-white border-[#1E0FBF]'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-[#1E0FBF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSports.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full">No sports found.</p>
          ) : (
            filteredSports.map((sport) => (
              <div
                key={sport.sportId}
                className="bg-white rounded-xl shadow p-5 border border-gray-100 hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-[#1E0FBF] mb-2">{sport.sportName}</h2>
                <p className="text-sm text-gray-700 mb-2">{sport.description}</p>
                <p className="text-sm text-gray-500">
                  <strong>Categories:</strong> {sport.categories?.join(', ')}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
