// components/TopDonations.tsx
import React from 'react'

export default function TopDonations() {
  const donations = [
    { avatar: '🏀', name: 'Springfield High', summary: '50 basketballs donated' },
    { avatar: '⚽', name: 'Metro Sports Club', summary: '30 soccer balls donated' },
    { avatar: '🏓', name: 'City Recreation', summary: '10 table tennis sets donated' },
  ]

  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0d2240] mb-8">Top Donations</h2>
          
          <div className="space-y-4">
            {donations.map(({ avatar, name, summary }, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-[#f0f0f0] flex items-center justify-center text-3xl shrink-0">
                  {avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#1e0fbf]">{name}</h3>
                  <p className="text-gray-600">{summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
