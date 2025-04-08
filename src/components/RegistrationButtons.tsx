// components/RegistrationButtons.tsx
import React from 'react'

export default function RegistrationButtons() {
  const buttons = [
    { label: 'School', icon: '🏫' },
    { label: 'Donor', icon: '🎁' },
    { label: 'Regulator', icon: '📋' },
  ]

  return (
    <section className="w-full py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Register As</h2>
      <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-4xl mx-auto">
        {buttons.map(({ label, icon }) => (
          <button 
            key={label} 
            className="flex flex-col items-center bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow flex-1"
          >
            <div className="w-16 h-16 rounded-full bg-[#f0f0f0] flex items-center justify-center text-4xl mb-4">
              {icon}
            </div>
            <span className="text-lg font-medium">{label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
