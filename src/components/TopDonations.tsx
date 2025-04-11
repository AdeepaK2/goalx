// components/TopDonations.tsx
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function TopDonations() {
  const donations = [
    {
      avatar: '🏀',
      name: 'Mr. Pasan Perera',
      summary: '50 basketballs donated',
      date: '2 weeks ago',
      value: 'LKR2,500,000',
      recipient: 'Gampaha Central College'
    },
    {
      avatar: '⚽',
      name: 'Metro Sports Club',
      summary: '30 soccer balls donated',
      date: '1 month ago',
      value: 'LKR 1,500,000',
      recipient: 'Lyceyum Middle School'
    },
    {
      avatar: '🏓',
      name: 'City Recreation Center',
      summary: '10 table tennis sets donated',
      date: '2 months ago',
      value: 'LKR 800,000',
      recipient: 'Royal Colllege'
    },
    {
      avatar: '🏐',
      name: 'Westside Academy',
      summary: '25 volleyballs donated',
      date: '3 months ago',
      value: 'LKR 1,250,000',
      recipient: 'St. Joseph\'s College'
    },
  ]

  return (
    <section className="w-full py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Top Donations</h2>
            <p className="text-lg text-gray-600">Recent generous contributions from our community.</p>
          </div>
          <button className="mt-4 md:mt-0 px-5 py-2 bg-white text-[#1e0fbf] font-medium border-2 border-[#1e0fbf] rounded-full hover:bg-[#1e0fbf] hover:text-white transition-colors duration-300 shadow-sm">
            View All
          </button>
        </div>

        <div className="space-y-6">
          {donations.map(({ avatar, name, summary, date, value, recipient }, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1e0fbf]/10 to-[#6e11b0]/10 flex items-center justify-center text-3xl shrink-0 shadow-sm">
                {avatar}
              </div>

              <div className="flex-grow">
                <h3 className="font-bold text-lg text-gray-800">{name}</h3>
                <p className="text-gray-600">{summary}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {date}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[#1e0fbf] font-semibold">{value}</span>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-500 mr-1">To:</span>
                  <span className="text-gray-700">{recipient}</span>
                </div>
                <button className="mt-3 px-4 py-1 text-xs bg-[#1e0fbf]/10 text-[#1e0fbf] rounded-full hover:bg-[#1e0fbf]/20 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-600 mb-6">Want to make a difference? Donate your unused sports equipment today!</p>
          <Link
            href="/register"
            className="px-8 py-3 bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white font-medium rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-center inline-block"
          >
            Make a Donation
          </Link>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="absolute -bottom-16 right-8 w-24 h-24 bg-[#1e0fbf]/5 rounded-full z-[-1]"></div>
        <div className="absolute -bottom-8 right-20 w-12 h-12 bg-[#6e11b0]/5 rounded-full z-[-1]"></div>
      </div>
    </section>
  )
}
