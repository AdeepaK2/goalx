// components/Statistics.tsx
import React from 'react'

export default function Statistics() {
  const stats = [
    { label: 'Total Schools', value: 500 },
    { label: 'Total Regulators', value: 50 },
    { label: 'Total Donations', value: 1000 },
  ]

  return (
    <section className="w-full bg-[#1e0fbf] p-8 my-8">
      <div className="flex flex-col sm:flex-row justify-around gap-6 max-w-4xl mx-auto">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white text-[#1e0fbf] rounded-lg p-6 text-center flex-1">
            <h3 className="text-3xl font-bold mb-2">{value}</h3>
            <p className="text-lg">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
