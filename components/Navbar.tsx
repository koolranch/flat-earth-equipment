'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import LocaleSwitch from './LocaleSwitch';
import Logo from './Logo';

interface NavItem {
  name: string;
  href: string;
  dropdown?: { name: string; href: string }[];
}

type Props = { locale: 'en' | 'es' }

export default function Navbar({ locale }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trainingDropdownOpen, setTrainingDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const pathname = usePathname();
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Minimal header on safety routes - less visual competition with hero CTA
  const minimal = pathname.startsWith('/safety');
  
  // On safety pages, only use inverse colors when scrolled past light top section
  const useInverse = minimal && scrolled;
  
  // Determine if this page should have auto-hide behavior
  const shouldAutoHide = 
    pathname.startsWith('/insights/') ||  // Blog posts
    pathname.startsWith('/blog/') ||       // Blog posts (if you use this)
    pathname.includes('/article/') ||      // Long-form content
    pathname.includes('/guide/');          // Guides
  
  // Critical pages where header should ALWAYS be visible
  const alwaysShow = 
    pathname === '/' ||                    // Homepage
    pathname.startsWith('/parts') ||       // Parts pages
    pathname.startsWith('/cart') ||        // Cart
    pathname.startsWith('/checkout') ||    // Checkout
    pathname.startsWith('/safety') ||      // Safety/training
    pathname.startsWith('/rent-equipment');// Rentals
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Scroll-based shadow (always active)
      setScrolled(currentScrollY > 10);
      
      // Auto-hide logic (only on reading pages)
      if (shouldAutoHide && !alwaysShow) {
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setHidden(true);
        } else if (currentScrollY < lastScrollY) {
          setHidden(false);
        }
      } else {
        // Always show on critical pages
        setHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, shouldAutoHide, alwaysShow]);

  const navItems: NavItem[] = [
    { name: 'Rent Equipment', href: '/rent-equipment' },
    { name: 'Parts', href: '/parts' },
    { name: 'Safety', href: '/safety' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Dynamic classes based on scroll state
  const navClasses = `
    sticky top-0 z-50 transition-all duration-300
    ${hidden ? '-translate-y-full' : 'translate-y-0'}
    ${minimal ? 'bg-transparent border-transparent backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'}
    ${scrolled && !minimal ? 'shadow-md' : 'shadow-sm'}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <Link 
              href="/" 
              className={`flex items-center py-2 px-3 -ml-3 rounded-lg transition-colors min-h-[44px] group ${useInverse ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
              aria-label="Flat Earth Equipment - Home"
            >
              {/* Desktop: monogram + full wordmark with fade-in animation */}
              <span className="hidden md:inline-block animate-in fade-in duration-500">
                <Logo showWordmark className="h-5" inverse={useInverse} />
              </span>
              {/* Mobile: larger monogram + full brand name with fade-in */}
              <span className="md:hidden flex items-center gap-2 animate-in fade-in duration-500">
                <Logo showWordmark={false} className="h-8" inverse={useInverse} />
                <span className={`text-sm font-bold transition-colors duration-300 ${useInverse ? 'text-white' : 'text-slate-900'}`}>
                  Flat Earth{' '}
                  <span className={useInverse ? 'text-orange-300' : 'text-[#F76511]'}>Equipment</span>
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Minimal on safety routes, full on others */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {(minimal ? [
              { name: 'Rent Equipment', href: '/rent-equipment' },
              { name: 'Safety', href: '/safety' },
              { name: 'Contact', href: '/contact' }
            ] : navItems).map((item) => (
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
            {!minimal && <LocaleSwitch />}
            {/* Full Menu button on minimal/safety pages */}
            {minimal && (
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
                <span className="hidden lg:inline">Menu</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className={`md:hidden flex items-center ${minimal ? 'hidden' : ''}`}>
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