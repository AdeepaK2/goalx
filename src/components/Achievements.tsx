// components/Achievements.tsx
'use client'
import React, { useState } from 'react'
import Image from 'next/image'

export default function Achievements() {
  const [currentSlide, setCurrentSlide] = useState(0)
  // Using placeholder images - replace with actual image paths in your project
  const images = Array(5).fill('/placeholder.jpg')

  return (
    <section className="w-full relative py-8">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {images.map((src, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <div className="bg-gray-300 w-full h-64 md:h-80 flex items-center justify-center">
                {/* Replace with actual images when available */}
                <span className="text-2xl text-gray-600">Image {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-[#1e0fbf]' : 'bg-gray-300'}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </section>
  )
}
