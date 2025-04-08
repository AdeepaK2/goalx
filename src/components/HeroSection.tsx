// components/HeroSection.tsx
import React from 'react'
import Image from 'next/image'

export default function HeroSection() {
  return (
    
    <section className="w-full bg-white py-12 md:py-16 ">
      <span className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-[#1e0fbf] to-[#6e11b0]"></span>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 md:p-12 shadow-lg">
          {/* Left side - Text content */}
          <div className="w-full md:w-1/2 space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d2240] leading-tight">
              Embark on Your Journey to Share Sports Equipment with Confidence
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mt-4">
              Affordable, Expert Platform for Schools to Borrow and Share Sports Equipment.
            </p>
            
            <div className="pt-6">
              <button className="bg-[#1e0fbf] hover:bg-[#160c8c] text-white px-8 py-3 rounded-md text-lg font-medium transition-colors duration-300">
                Get Started
              </button>
            </div>
          </div>
          
          {/* Right side - Logo/Image */}
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-square">
              <Image 
                src="/images/carousel-1.jpeg" 
                alt="Sports Equipment Sharing" 
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
