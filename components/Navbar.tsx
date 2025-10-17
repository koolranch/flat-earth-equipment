'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import LocaleSwitch from './LocaleSwitch';

interface NavItem {
  name: string;
  href: string;
  dropdown?: { name: string; href: string }[];
}

type Props = { locale: 'en' | 'es' }

export default function Navbar({ locale }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trainingDropdownOpen, setTrainingDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Minimal header on safety routes - less visual competition with hero CTA
  const minimal = pathname.startsWith('/safety');

  const navItems: NavItem[] = [
    { name: 'Rent Equipment', href: '/rent-equipment' },
    { name: 'Parts', href: '/parts' },
    { name: 'Safety', href: '/safety' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className={`bg-white border-b border-gray-200 ${minimal ? 'bg-transparent border-transparent' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <Image
                src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge1.webp"
                alt="Flat Earth Equipment"
                width={40}
                height={40}
                className="mr-2"
                priority
              />
              <span className="text-xl font-bold text-canyon-rust">Flat Earth Equipment</span>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on safety routes for cleaner hero */}
          <div className={`hidden md:flex md:items-center md:space-x-8 ${minimal ? 'md:hidden' : ''}`}>
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div
                    className="flex items-center space-x-1 cursor-pointer"
                    onMouseEnter={() => setTrainingDropdownOpen(true)}
                    onMouseLeave={() => setTrainingDropdownOpen(false)}
                  >
                    <span className="text-gray-600 hover:text-gray-900">{item.name}</span>
                    <ChevronDown className="w-4 h-4" />
                    {trainingDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`text-gray-600 hover:text-gray-900 ${
                      pathname === item.href ? 'text-canyon-rust font-semibold' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            <Link href="/cart" className="relative text-gray-600 hover:text-gray-900" aria-label={`Shopping cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}>
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-canyon-rust text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {/* Language Toggle */}
            <LocaleSwitch />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <div className="space-y-1">
                    <div className="text-gray-600 px-3 py-2 font-medium">{item.name}</div>
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block pl-6 pr-3 py-2 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 text-base ${
                      pathname === item.href
                        ? 'text-canyon-rust font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            <Link
              href="/cart"
              className="block px-3 py-2 text-base text-gray-600 hover:text-gray-900"
            >
              Cart ({itemCount})
            </Link>
            {/* Language Toggle for Mobile */}
            <div className="px-3 py-2">
              <LocaleSwitch variant="mobile" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 