'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">How GoalX Works</h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  A simple process to borrow or donate sports equipment. Join our community of schools, donors, and regulators working together.
                </p>
              </div>
              <div className="w-full md:w-1/2 relative">
                <div className="rounded-2xl overflow-hidden shadow-xl h-[400px] relative">
                  <Image 
                    src="/images/how-it-works-illustration.svg" 
                    alt="GoalX Process" 
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

    {/* Process Flow Visualization - Alternating with Dotted Line */}
<section className="w-full py-16 md:py-24 bg-gradient-to-br from-white to-gray-50">
  <div className="max-w-7xl mx-auto px-2 md:px-4">
    <div className="text-center max-w-3xl mx-auto mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">The GoalX Process</h2>
      <p className="text-lg text-gray-600">
        See how equipment flows through our platform from donors to schools.
      </p>
    </div>
    
    <div className="relative py-12 max-w-3xl mx-auto" aria-label="GoalX Process Timeline">
      {/* Vertical dotted line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 border-l-4 border-[#1e0fbf] border-dashed transform -translate-x-1/2 z-0"></div>
      
      {/* Process steps */}
      <div className="relative z-10 space-y-24">
        {/* Step 1 - Left aligned */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="md:w-[calc(50%-24px)] text-right hidden md:block"></div>
          <div className="w-16 h-16 rounded-full bg-[#f0eeff] flex items-center justify-center text-2xl font-bold shadow-md border-4 border-white transition-transform hover:scale-110 duration-300 z-10">
            1
          </div>
          <div className="md:w-[calc(50%-24px)] text-center md:text-left">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Donor Lists Equipment</h3>
            <p className="text-gray-600">Donors register and list available sports equipment they want to share with schools.</p>
          </div>
        </div>
        
        {/* Step 2 - Right aligned */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="md:w-[calc(50%-24px)] text-right order-2 md:order-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">School Requests Item</h3>
            <p className="text-gray-600">Schools browse available equipment and submit requests for items they need.</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#f5eeff] flex items-center justify-center text-2xl font-bold shadow-md border-4 border-white transition-transform hover:scale-110 duration-300 z-10 order-1 md:order-2">
            2
          </div>
          <div className="md:w-[calc(50%-24px)] hidden md:block order-3"></div>
        </div>
        
        {/* Step 3 - Left aligned */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="md:w-[calc(50%-24px)] text-right hidden md:block"></div>
          <div className="w-16 h-16 rounded-full bg-[#f0eeff] flex items-center justify-center text-2xl font-bold shadow-md border-4 border-white transition-transform hover:scale-110 duration-300 z-10">
            3
          </div>
          <div className="md:w-[calc(50%-24px)] text-center md:text-left">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Regulator Approves</h3>
            <p className="text-gray-600">Regulators review and approve equipment requests to ensure fair distribution.</p>
          </div>
        </div>
        
        {/* Step 4 - Right aligned */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="md:w-[calc(50%-24px)] text-right order-2 md:order-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Equipment Delivered</h3>
            <p className="text-gray-600">Once approved, equipment is delivered to the requesting school.</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#efffef] flex items-center justify-center text-2xl font-bold shadow-md border-4 border-white transition-transform hover:scale-110 duration-300 z-10 order-1 md:order-2">
            4
          </div>
          <div className="md:w-[calc(50%-24px)] hidden md:block order-3"></div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#1e0fbf]/10 rounded-full z-[-1]"></div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#6e11b0]/10 rounded-full z-[-1]"></div>
    </div>
  </div>
</section>




        {/* FAQ Section */}
        <section className="w-full py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Find answers to common questions about how GoalX works.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                { 
                  question: 'Who can use GoalX?', 
                  answer: 'GoalX is designed for schools, sports organizations, and individual donors who want to share or request sports equipment.' 
                },
                { 
                  question: 'Is there a cost to use GoalX?', 
                  answer: 'GoalX is free for schools to use. Donors may choose to cover shipping costs for equipment they&apos;re sharing.' 
                },
                { 
                  question: 'How long can we borrow equipment?', 
                  answer: 'The borrowing period is typically determined by the donor and can range from a few weeks to an entire sports season.' 
                },
                { 
                  question: 'What role do regulators play?', 
                  answer: 'Regulators oversee the equipment sharing process, approve requests, and ensure that all transactions follow the platform&aposs guidelines and policies.' 
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-xl font-bold text-[#1e0fbf] mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-[#1e0fbf] to-[#6e11b0]">
          <div className="max-w-7xl mx-auto px-2 md:px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Join our community of schools, donors, and regulators working together to make sports accessible to all students.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <button className="px-8 py-3 bg-white text-[#1e0fbf] font-medium rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-md">
                  Create Account
                </button>
              </Link>
              <Link href="/login">
                <button className="px-8 py-3 bg-transparent text-white font-medium border-2 border-white rounded-full hover:bg-white/10 transition-colors duration-300">
                  Login
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
