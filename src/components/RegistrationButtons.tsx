'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function RegistrationButtons() {
  const router = useRouter()

  const buttons = [
    { label: 'School', icon: '🏫', description: 'Register your school to request sports equipment', color: 'from-blue-500/10 to-blue-600/5' },
    { label: 'Donor', icon: '🎁', description: 'Donate equipment to schools in need', color: 'from-purple-500/10 to-purple-600/5' },
    { label: 'Governing Body', icon: '📋', description: 'Oversee and facilitate equipment sharing', color: 'from-indigo-500/10 to-indigo-600/5' },
  ]

  const handleRegisterClick = (label: string) => {
    const lowerCaseLabel = label.toLowerCase()
    router.push(`/register`)
  }

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Register As</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join our platform in the role that suits you best and be part of our mission to make sports accessible to all students.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {buttons.map(({ label, icon, description, color }) => (
            <div key={label} className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-2 cursor-pointer overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none`}></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-4xl mb-6 shadow-md group-hover:shadow-lg transition-shadow">
                  {icon}
                </div>
                <h3 className="text-2xl font-bold text-[#1e0fbf] mb-3">{label}</h3>
                <p className="text-gray-700">{description}</p>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => handleRegisterClick(label)}
                    className="px-5 py-2 bg-white text-[#1e0fbf] font-medium border-2 border-[#1e0fbf] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
