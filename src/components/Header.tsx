// components/Header.tsx
import React from 'react'

export default function Header() {
  return (
    <header className="w-full bg-white p-4 flex flex-col sm:flex-row justify-between items-center">
      <div className="w-12 h-12 bg-[#1e0fbf] rounded-full mb-4 sm:mb-0"></div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="bg-[#6e11b0] text-white px-4 py-2 rounded">See Our Story</button>
        <button className="border border-[#1e0fbf] text-[#1e0fbf] px-4 py-2 rounded">Login</button>
      </div>
    </header>
  )
}
