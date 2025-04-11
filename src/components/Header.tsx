'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/contact', label: 'Contact' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-12 h-12 overflow-hidden rounded-full shadow-md">
              <div className="w-full h-full flex items-center justify-center">
                <img src="/logo.png" alt="logo" />
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">
              Goal<span className="text-[#1e0fbf]">X</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-gray-700 hover:text-[#1e0fbf] font-medium transition-colors duration-300 ${
                  isActive(item.href) ? 'underline underline-offset-4 decoration-[#1e0fbf]' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="px-5 py-2 text-[#1e0fbf] font-medium border-2 border-[#1e0fbf] rounded-full hover:bg-[#1e0fbf] hover:text-white transition-colors duration-300"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white font-medium rounded-full hover:from-[#160c8c] hover:to-[#5a0e91] transition-colors duration-300 shadow-md"
            >
              Create Account
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-[#1e0fbf] focus:outline-none transition-colors duration-300"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#1e0fbf] hover:bg-gray-50 rounded-md transition-colors duration-300 ${
                  isActive(item.href) ? 'underline underline-offset-4 decoration-[#1e0fbf]' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-4 pb-3 border-t border-gray-200">
              <Link
                href="/login"
                className="block w-full text-center px-5 py-2 text-[#1e0fbf] font-medium border-2 border-[#1e0fbf] rounded-full hover:bg-[#1e0fbf] hover:text-white transition-colors duration-300 mb-2"
              >
                Login
              </Link>
              <Link href="/register" className="block">
                <button className="w-full px-5 py-2 bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white font-medium rounded-full hover:from-[#160c8c] hover:to-[#5a0e91] transition-colors duration-300">
                  Create Account
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
