// components/Statistics.tsx
import React from 'react'

export default function Statistics() {
  const stats = [
    { 
      label: 'Total Schools', 
      value: 500,
      icon: '🏫',
      description: 'Schools actively participating'
    },
    { 
      label: 'Total Regulators', 
      value: 50,
      icon: '📋',
      description: 'Ensuring quality and fairness'
    },
    { 
      label: 'Total Donations', 
      value: 1000,
      icon: '🎁',
      description: 'Equipment items shared'
    },
  ]

  return (
    <section className="w-full py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e0fbf] to-[#6e11b0] opacity-90"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Impact</h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Together, we're making a difference in schools across the country.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map(({ label, value, icon, description }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20 hover:bg-white/20 transition-colors duration-300">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center text-3xl mb-4 text-white">
                {icon}
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-2 text-white">{value}+</h3>
              <p className="text-xl text-white mb-2">{label}</p>
              <p className="text-white/70 text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
