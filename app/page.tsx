import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="p-6 md:p-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-900">Flat Earth Equipment</h1>
        <p className="mt-4 text-xl text-gray-600">Quality Golf Cart & Equipment Solutions</p>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Upgrade Your Golf Experience</h2>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Specializing in premium golf cart parts, accessories, and performance upgrades.
          Everything you need to enhance your ride on and off the course.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">
            Shop Now
          </button>
          <button className="bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-600 font-bold py-3 px-8 rounded-lg transition">
            View Catalog
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Premium Quality", 
                description: "All our products meet or exceed OEM specifications for lasting performance."
              },
              {
                title: "Expert Support", 
                description: "Our knowledgeable team can help you find exactly what you need for your cart."
              },
              {
                title: "Fast Shipping", 
                description: "Orders ship within 24 hours with tracking information provided instantly."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Flat Earth Equipment</h3>
              <p className="text-gray-300">Quality parts and accessories for golf carts and utility vehicles.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/shop" className="text-gray-300 hover:text-white">Shop All</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-gray-300">Email: info@flatearthequipment.com</p>
              <p className="text-gray-300">Phone: (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Flat Earth Equipment. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
} 