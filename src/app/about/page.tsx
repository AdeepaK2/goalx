// src/app/about/page.tsx
'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">About GoalX</h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  We're on a mission to make sports equipment accessible to all schools through our innovative sharing platform.
                </p>
              </div>
              <div className="w-full md:w-1/2 relative">
                <div className="rounded-2xl overflow-hidden shadow-xl h-[400px] relative">
                  <Image 
                    src="/images/carousel-1.jpeg" 
                    alt="About GoalX" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#6e11b0]/10 rounded-full z-[-1]"></div>
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#1e0fbf]/10 rounded-full z-[-1]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="w-full py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 relative order-2 md:order-1">
                <div className="rounded-2xl overflow-hidden shadow-xl h-[400px] relative">
                  <Image 
                    src="/images/carousel-2.jpeg" 
                    alt="Our Story" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#1e0fbf]/10 rounded-full z-[-1]"></div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#6e11b0]/10 rounded-full z-[-1]"></div>
              </div>
              <div className="w-full md:w-1/2 order-1 md:order-2">
                <h2 className="text-3xl md:text-4xl font-bold text-[#1e0fbf] mb-6">Our Story</h2>
                
                <div className="space-y-6 text-gray-700">
                  <div className="bg-gradient-to-r from-[#1e0fbf]/5 to-white p-5 rounded-lg border-l-4 border-[#1e0fbf]">
                    <p className="text-lg leading-relaxed">
                      GoalX was founded with a simple observation: while some schools have surplus sports equipment gathering dust, others struggle to provide basic equipment for their students.
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-[#6e11b0]/10 rounded-full p-2 mr-4 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6e11b0]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed flex-1">
                      Our founder, a former physical education teacher, witnessed firsthand how limited access to sports equipment affected students' physical development and enjoyment of sports. This inspired the creation of a platform where schools could easily share resources.
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-[#1e0fbf]/10 rounded-full p-2 mr-4 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e0fbf]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-base leading-relaxed flex-1">
                      What began as a small local initiative has grown into a nationwide platform connecting hundreds of schools, donors, and regulators in a collaborative ecosystem that benefits thousands of students.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-[#6e11b0] mb-6">Our Mission</h2>
                <div className="space-y-5 text-gray-700">
                  <p className="text-lg leading-relaxed italic border-l-4 border-[#6e11b0] pl-4">
                    "We believe that every child deserves the opportunity to play, grow, and thrive through sports—regardless of their school's budget."
                  </p>
                  
                  <p className="leading-relaxed">
                    Our mission is to create an equitable sports environment across all schools by facilitating the sharing of quality equipment, reducing waste, and building a community of schools that support each other.
                  </p>
                  
                  <div className="bg-gradient-to-r from-[#6e11b0]/5 to-white p-5 rounded-lg">
                    <h3 className="font-semibold text-[#6e11b0] mb-3">Through our platform, we aim to:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6e11b0] mr-2 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Increase access to sports equipment for underserved schools</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6e11b0] mr-2 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Reduce waste by giving unused equipment a second life</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6e11b0] mr-2 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Build connections between schools, donors, and sports organizations</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6e11b0] mr-2 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Promote physical activity and sports participation among all students</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 relative">
                <div className="rounded-2xl overflow-hidden shadow-xl h-[400px] relative">
                  <Image 
                    src="/images/carousel-3.jpeg" 
                    alt="Our Mission" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#6e11b0]/10 rounded-full z-[-1]"></div>
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#1e0fbf]/10 rounded-full z-[-1]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="w-full py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Our Values</h2>
              <p className="text-lg text-gray-600">
                These core principles guide everything we do at GoalX.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Equity', icon: '⚖️', description: 'We believe all students deserve equal access to quality sports equipment.' },
                { title: 'Community', icon: '🤝', description: 'We foster connections between schools to create a supportive network.' },
                { title: 'Sustainability', icon: '🌱', description: 'We extend the lifecycle of sports equipment to reduce waste and environmental impact.' },
                { title: 'Innovation', icon: '💡', description: 'We continuously improve our platform to better serve our community\'s needs.' }
              ].map((value, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1e0fbf]/10 to-[#6e11b0]/10 flex items-center justify-center text-3xl mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Meet Our Team</h2>
              <p className="text-lg text-gray-600">
                We're a passionate group of educators, sports enthusiasts, and technology experts committed to making a difference in schools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Sarah Johnson', role: 'Founder & CEO', avatar: '👩‍💼', bio: 'Former PE teacher with 15 years of experience in education.' },
                { name: 'Michael Chen', role: 'CTO', avatar: '👨‍💻', bio: 'Tech expert with a passion for creating platforms that drive social impact.' },
                { name: 'David Rodriguez', role: 'Partnerships Director', avatar: '👨‍🤝‍👨', bio: 'Former sports equipment distributor with extensive industry connections.' }
              ].map((member, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#1e0fbf]/10 to-[#6e11b0]/10 p-8 text-center">
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-5xl mx-auto shadow-md">
                      {member.avatar}
                    </div>
                    <h3 className="mt-4 font-bold text-xl text-gray-800">{member.name}</h3>
                    <p className="text-[#1e0fbf] font-medium">{member.role}</p>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-[#1e0fbf] to-[#6e11b0]">
          <div className="max-w-7xl mx-auto px-2 md:px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Join Our Mission</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Whether you're a school in need of equipment, a donor with resources to share, or a regulator who wants to help, there's a place for you in our community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <button className="px-8 py-3 bg-white text-[#1e0fbf] font-medium rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-md">
                  Join Today
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-3 bg-transparent text-white font-medium border-2 border-white rounded-full hover:bg-white/10 transition-colors duration-300">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
