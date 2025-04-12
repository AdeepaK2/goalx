// components/HeroSection.tsx
'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'


export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const images = [
    '/images/carousel-1.jpg',
    '/images/carousel-2.jpg',
    '/images/carousel-3.jpg',
    '/images/carousel-4.jpg',
    '/images/carousel-5.jpg',
    '/images/carousel-6.jpg'
  ]

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left side - Text content */}
          <div className="w-full md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
              Sharing <span className="text-[#1e0fbf]">Sports Equipment</span> Made Simple
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Connect schools, donors, and governing body to make sports accessible for all students.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="px-8 py-3 bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white font-medium rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-center"
              >
                Get Started
              </Link>

              <Link
                href="/about"
                className="px-8 py-3 bg-white text-[#1e0fbf] font-medium border-2 border-[#1e0fbf] rounded-full hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 text-center"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right side - Carousel */}
          <div className="w-full md:w-1/2 relative">
            <div className="overflow-hidden rounded-2xl shadow-xl h-[60vh] max-h-[500px] relative">
              <div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {images.map((src, index) => (
                  <div key={index} className="w-full h-full flex-shrink-0 relative">
                    <Image
                      src={src}
                      alt={`Sports equipment ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                ))}
              </div>

              {/* Carousel Navigation */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index
                        ? 'bg-[#1e0fbf] w-8'
                        : 'bg-white/70 hover:bg-white'
                      }`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#6e11b0]/10 rounded-full z-[-1]"></div>
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#1e0fbf]/10 rounded-full z-[-1]"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
