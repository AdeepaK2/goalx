// components/Footer.tsx
import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center max-w-6xl mx-auto">
        <div className="w-12 h-12 bg-[#1e0fbf] rounded-full mb-6 sm:mb-0"></div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-gray-300 p-4 rounded text-center min-w-[150px]">Donate Items</div>
          <div className="bg-gray-300 p-4 rounded text-center min-w-[150px]">Sports Info</div>
        </div>
      </div>
      <div className="text-center mt-6 text-sm text-gray-600">
        © 2025 School Sports Equipment Sharing Platform. All rights reserved.
      </div>
    </footer>
  )
}
