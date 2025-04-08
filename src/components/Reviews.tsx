// components/Reviews.tsx
import React from 'react'

export default function Reviews() {
  const reviews = [
    { avatar: '👨‍🏫', name: 'John Smith', role: 'PE Teacher', text: 'This platform has been a game-changer for our school! We now have access to equipment we couldn\'t afford before.' },
    { avatar: '👩‍🏫', name: 'Sarah Johnson', role: 'School Principal', text: 'We\'ve been able to offer more sports thanks to the donations. Our students are more engaged than ever.' },
    { avatar: '🧑‍🏫', name: 'Alex Chen', role: 'Sports Coordinator', text: 'The process is smooth and the equipment quality is great. Highly recommend to all schools.' },
  ]

  return (
    <section className="w-full max-w-2xl mx-auto p-4 my-8">
      <h2 className="text-2xl font-bold mb-6">What People Say</h2>
      <div className="space-y-4">
        {reviews.map(({ avatar, name, role, text }, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-[#f0f0f0] rounded-full flex items-center justify-center text-2xl mr-3">
                {avatar}
              </div>
              <div>
                <h3 className="font-medium">{name}</h3>
                <p className="text-sm text-gray-600">{role}</p>
              </div>
            </div>
            <p className="text-gray-700">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
