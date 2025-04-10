// components/Reviews.tsx
import React from 'react'

export default function Reviews() {
  const reviews = [
    { 
      avatar: '👨‍🏫', 
      name: 'John Smith', 
      role: 'PE Teacher', 
      school: 'Ladies College',
      text: 'This platform has been a game-changer for our school! We now have access to equipment we couldn\'t afford before. Our students are thrilled with the new opportunities.',
      rating: 5
    },
    { 
      avatar: '👩‍🏫', 
      name: 'Sarah Johnson', 
      role: 'School Principal', 
      school: 'Gampaha Central College',
      text: 'We\'ve been able to offer more sports thanks to the donations. Our students are more engaged than ever, and it\'s wonderful to see them trying new activities.',
      rating: 5
    },
    { 
      avatar: '🧑‍🏫', 
      name: 'Alex Chen', 
      role: 'Sports Coordinator', 
      school: 'Royal College',
      text: 'The process is smooth and the equipment quality is great. The platform makes it easy to find what we need and connect with donors. Highly recommend to all schools.',
      rating: 4
    },
  ]

  return (
    <section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What People Say</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from schools and donors who have experienced the benefits of our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map(({ avatar, name, role, school, text, rating }, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1e0fbf]/10 to-[#6e11b0]/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-md">
                    {avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{name}</h3>
                    <p className="text-sm text-gray-600">{role}</p>
                    <p className="text-xs text-gray-500">{school}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{text}"</p>
                <div className="border-t border-gray-100 pt-4 flex justify-end">
                  <span className="text-sm text-[#1e0fbf]">Verified User</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="px-6 py-3 bg-white text-[#1e0fbf] font-medium border-2 border-[#1e0fbf] rounded-full hover:bg-[#1e0fbf] hover:text-white transition-colors duration-300">
            View All Reviews
          </button>
        </div>
      </div>
    </section>
  )
}
