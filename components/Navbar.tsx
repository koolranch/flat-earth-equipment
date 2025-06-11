'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  className: string;
  dropdown?: {
    label: string;
    href: string;
    badge?: string;
  }[];
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trainingDropdownOpen, setTrainingDropdownOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { 
      label: "Parts", 
      href: "/parts",
      className: "font-medium transition-colors hover:text-canyon-rust"
    },
    { 
      label: "Brands", 
      href: "/brands",
      className: "font-medium transition-colors hover:text-canyon-rust"
    },
    { 
      label: "Rent Equipment", 
      href: "/rent-equipment",
      className: "text-slate-800 hover:text-canyon-rust font-semibold transition"
    },
    {
      label: "Training & Certification",
      href: "/training",
      className: "font-medium transition-colors hover:text-canyon-rust",
              dropdown: [
          { 
            label: "Forklift Operator Certification", 
            href: "/safety", 
            badge: "OSHA" 
          },
          { 
            label: "Safety Micro-Modules", 
            href: "/training/safety-modules" 
          },
          { 
            label: "Corporate Plans (20+)", 
            href: "/training/corporate" 
          }
        ]
    },
    { 
      label: "Locations", 
      href: "/locations",
      className: "font-medium transition-colors hover:text-canyon-rust"
    },
    { 
      label: "About", 
      href: "/about",
      className: "font-medium transition-colors hover:text-canyon-rust"
    },
    { 
      label: "Contact", 
      href: "/contact",
      className: "font-medium transition-colors hover:text-canyon-rust"
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F5F1EC] shadow-sm h-24">
      <div className="flex items-center justify-between max-w-6xl mx-auto px-4 h-full">
        <Link href="/" className="flex items-center" aria-label="Home">
          <img
            src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp"
            alt="Flat Earth Equipment logo"
            className="h-16 w-auto px-2 hover:opacity-80 transition hidden md:block"
            loading="lazy"
            onError={(e) => {
              console.error('Logo failed to load:', e);
            }}
          />
          <img
            src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp"
            alt="Flat Earth Equipment logo"
            className="h-14 w-auto px-2 hover:opacity-80 transition md:hidden"
            loading="lazy"
            onError={(e) => {
              console.error('Logo failed to load:', e);
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 h-full">
          {navItems.map((item) => (
            <div key={item.href} className="relative">
              {item.dropdown ? (
                <div
                  className="relative"
                  onMouseEnter={() => setTrainingDropdownOpen(true)}
                  onMouseLeave={() => setTrainingDropdownOpen(false)}
                >
                  <button
                    className={`px-3 py-2 flex items-center space-x-1 ${item.className} ${
                      pathname.startsWith(item.href)
                        ? 'text-canyon font-semibold'
                        : 'text-slate-700'
                    } hover:underline`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* Desktop Dropdown */}
                  {trainingDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white shadow-md rounded-2xl py-6 px-8 grid grid-cols-1 gap-4 w-[26rem] z-50">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.href}
                          href={dropdownItem.href}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-slate-700 hover:text-canyon-rust">
                            {dropdownItem.label}
                          </span>
                          {dropdownItem.badge && (
                            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                              {dropdownItem.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`px-3 py-2 ${item.className} ${
                    pathname.startsWith(item.href)
                      ? 'text-canyon font-semibold'
                      : 'text-slate-700'
                  } hover:underline`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-slate-800 hover:text-canyon-rust"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pb-4">
          <nav className="flex flex-col space-y-4">
            {/* Training & Certification First in Mobile */}
            <div className="py-2">
              <button
                onClick={() => setTrainingDropdownOpen(!trainingDropdownOpen)}
                className="flex items-center justify-between w-full text-left font-medium text-slate-700 hover:text-canyon-rust"
              >
                <span>Training & Certification</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${trainingDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Mobile Dropdown */}
              {trainingDropdownOpen && (
                <div className="mt-2 ml-4 space-y-2">
                  {navItems.find(item => item.dropdown)?.dropdown?.map((dropdownItem) => (
                    <Link
                      key={dropdownItem.href}
                      href={dropdownItem.href}
                      className="flex items-center justify-between py-2 text-sm text-slate-600 hover:text-canyon-rust"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{dropdownItem.label}</span>
                      {dropdownItem.badge && (
                        <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                          {dropdownItem.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Other Mobile Nav Items */}
            {navItems.filter(item => !item.dropdown).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 ${item.className} ${
                  pathname.startsWith(item.href)
                    ? 'text-canyon font-semibold'
                    : 'text-slate-700'
                } hover:underline`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
} 