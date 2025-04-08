// components/TopDonations.tsx
import React from 'react'

export default function TopDonations() {
  const donations = [
    { avatar: '🏀', summary: '50 basketballs donated by Springfield High' },
    { avatar: '⚽', summary: '30 soccer balls donated by Metro Sports Club' },
    { avatar: '🏓', summary: '10 table tennis sets donated by City Recreation Center' },
    { avatar: '🏐', summary: '25 volleyballs donated by Westside Academy' },
  ]

  return (
    <section className="w-full max-w-2xl mx-auto p-4 my-8">
      <h2 className="text-2xl font-bold mb-6">Top Donations</h2>
      <div className="space-y-4">
        {donations.map(({ avatar, summary }, index) => (
          <div key={index} className="flex items-center bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#f0f0f0] rounded-full flex items-center justify-center text-2xl mr-4">
              {avatar}
            </div>
            <p>{summary}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
