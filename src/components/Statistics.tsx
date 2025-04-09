// components/Statistics.tsx
import React from 'react'

export default function Statistics() {
  const stats = [
    { label: 'Total Schools', value: 500 },
    { label: 'Total Regulators', value: 50 },
    { label: 'Total Donations', value: 1000 },
  ]

  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-br from-[#1e0fbf] to-[#6e11b0] rounded-2xl p-8 md:p-12 shadow-lg text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map(({ label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <h3 className="text-4xl md:text-5xl font-bold mb-2">{value}</h3>
                <p className="text-xl">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
