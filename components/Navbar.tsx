'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ImageWithFallback from './ImageWithFallback';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <ImageWithFallback
              src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets//flat-earth-logo-badge.webp"
              alt="Flat Earth Equipment Logo"
              width={160}
              height={48}
              className="h-10 sm:h-12 w-auto max-w-[160px]"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/parts" className="text-gray-600 hover:text-[#A0522D] transition-colors">
              Parts
            </Link>
            <Link href="/rentals" className="text-gray-600 hover:text-[#A0522D] transition-colors">
              Rentals
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-[#A0522D] transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-[#A0522D] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#A0522D] hover:bg-gray-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/parts"
                className="text-gray-600 hover:text-[#A0522D] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Parts
              </Link>
              <Link
                href="/rentals"
                className="text-gray-600 hover:text-[#A0522D] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Rentals
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-[#A0522D] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-[#A0522D] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 