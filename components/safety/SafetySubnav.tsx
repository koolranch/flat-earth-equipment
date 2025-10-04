import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function cn(...c: (string | undefined | null | boolean)[]): string {
  return c.filter(Boolean).join(" ");
}

const items = [
  { href: "/training", label: "Certification" },
  { href: "/trainer", label: "Trainer" },
  { href: "/records", label: "Records" }
];

export default function SafetySubnav() {
  const pathname = usePathname() || "/";
  
  return (
    <nav
      className="safety-subnav sticky top-16 z-30 w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200"
      role="navigation"
      aria-label="Safety & Training sub navigation"
      data-testid="safety-subnav"
      style={{
        // expose height for layouts that offset content
        // tailwind h-14 ~= 56px
        ['--subnav-h' as any]: '56px'
      }}
    >
      {/* Decorative line/gradient must not trap clicks */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto max-w-7xl h-14 flex items-center gap-4 px-4 sm:px-6 lg:px-8">
        {items.map(it => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "text-sm font-medium hover:text-blue-700 transition-colors",
                active ? "text-blue-700 font-semibold" : "text-gray-700"
              )}
              aria-current={active ? "page" : undefined}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
