// components/RegistrationButtons.tsx
import React from 'react'
import Image from 'next/image'

export default function RegistrationButtons() {
  const buttons = [
    { label: 'School', icon: '🏫', description: 'Register your school to request equipment' },
    { label: 'Donor', icon: '🎁', description: 'Donate sports equipment to schools in need' },
    { label: 'Regulator', icon: '📋', description: 'Oversee and facilitate equipment sharing' },
  ]

  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 md:p-12 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0d2240] mb-8">Register As</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {buttons.map(({ label, icon, description }) => (
              <div key={label} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 text-center cursor-pointer">
                <div className="w-20 h-20 mx-auto bg-[#f0f0f0] rounded-full flex items-center justify-center text-4xl mb-4">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-[#1e0fbf] mb-2">{label}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
