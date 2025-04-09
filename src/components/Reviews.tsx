// components/Reviews.tsx
import React from 'react'

export default function Reviews() {
  const reviews = [
    { avatar: '👨‍🏫', name: 'John Smith', role: 'PE Teacher', text: 'This platform has been a game-changer for our school! We now have access to equipment we couldn\'t afford before.' },
    { avatar: '👩‍🏫', name: 'Sarah Johnson', role: 'School Principal', text: 'We\'ve been able to offer more sports thanks to the donations. Our students are more engaged than ever.' },
    { avatar: '🧑‍🏫', name: 'Alex Chen', role: 'Sports Coordinator', text: 'The process is smooth and the equipment quality is great. Highly recommend to all schools.' },
  ]

  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0d2240] mb-8">What People Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(({ avatar, name, role, text }, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center text-2xl">
                    {avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1e0fbf]">{name}</h3>
                    <p className="text-sm text-gray-600">{role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
