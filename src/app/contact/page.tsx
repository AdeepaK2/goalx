// src/app/contact/page.tsx
'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    // Reset submission status after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <>
      <Header />
      <main className="bg-white">
       

        {/* Contact Form Section */}
        <section className="w-full py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-[#1e0fbf] mb-6">Send Us a Message</h2>
                
                {isSubmitted ? (
                  <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-8">
                    <h3 className="text-xl font-semibold text-green-700 mb-2">Thank You!</h3>
                    <p className="text-green-600">
                      Your message has been sent successfully. We'll get back to you as soon as possible.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] outline-none transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e0fbf] focus:border-[#1e0fbf] outline-none transition-colors resize-none"
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-[#1e0fbf] to-[#6e11b0] text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-md"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
              
              <div className="w-full md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-[#6e11b0] mb-6">Contact Information</h2>
                
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-[#6e11b0]/5 to-white p-6 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-[#6e11b0]/10 rounded-full p-3 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6e11b0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Email Us</h3>
                        <p className="text-gray-600 mb-2">For general inquiries:</p>
                        <a href="mailto:info@goalx.org" className="text-[#1e0fbf] hover:underline">info@goalx.org</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#1e0fbf]/5 to-white p-6 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-[#1e0fbf]/10 rounded-full p-3 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1e0fbf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Call Us</h3>
                        <p className="text-gray-600 mb-2">Monday to Friday, 9am - 5pm EST</p>
                        <a href="tel:+15551234567" className="text-[#1e0fbf] hover:underline">+1 (555) 123-4567</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#6e11b0]/5 to-white p-6 rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-[#6e11b0]/10 rounded-full p-3 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6e11b0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Visit Us</h3>
                        <p className="text-gray-600 mb-2">Our headquarters:</p>
                        <address className="not-italic text-gray-700">
                          123 GoalX<br />
                          Sports Avenue<br />
                          Colombo 07, Sri Lanka<br />
                        </address>
                      </div>
                    </div>
                  </div>
                </div>
                
                
              </div>
            </div>
          </div>
        </section>

       

        {/* FAQ Section */}
        <section className="w-full py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-2 md:px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Find quick answers to common questions about contacting and working with GoalX.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                { 
                  question: 'How quickly will I receive a response?', 
                  answer: 'We aim to respond to all inquiries within 24-48 business hours. For urgent matters, please call our office directly.' 
                },
                { 
                  question: 'Can I schedule a virtual meeting?', 
                  answer: 'Yes! We offer virtual consultations via Zoom or Google Meet. Please email us to schedule a convenient time.' 
                },
                { 
                  question: 'How can my school join the platform?', 
                  answer: 'Schools can register through our website by clicking the "Join Today" button and following the registration process.' 
                },
                { 
                  question: 'Do you offer support for technical issues?', 
                  answer: 'Yes, our technical support team is available Monday-Friday from 9am-5pm EST. Contact support@goalx.org for assistance.' 
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
                  Join Today
                </button>
              </Link>
              <Link href="/about">
                <button className="px-8 py-3 bg-transparent text-white font-medium border-2 border-white rounded-full hover:bg-white/10 transition-colors duration-300">
                  Learn More
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