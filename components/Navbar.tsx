'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
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
    <header className="sticky top-0 z-50 bg-[#F5F1EC] shadow-sm h-20">
      <div className="flex items-center justify-between max-w-6xl mx-auto px-4 h-full">
        <Link href="/" className="flex items-center">
          <img
            src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp"
            alt="Flat Earth Equipment logo"
            className="h-20 w-auto px-2"
            loading="lazy"
            onError={(e) => {
              console.error('Logo failed to load:', e);
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 h-full">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-lg font-semibold text-slate-800 ${
                pathname === item.href
                  ? "text-canyon-rust underline"
                  : "hover:text-canyon-rust"
              }`}
            >
              {item.label}
            </Link>
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

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pb-4">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${item.className} ${
                  pathname === item.href
                    ? "text-canyon-rust underline"
                    : "text-slate-800 hover:text-canyon-rust"
                }`}
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