"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function cn(...c: (string | undefined | null | boolean)[]): string {
  return c.filter(Boolean).join(" ");
}

const items = [
  { href: "/training", label: "Training" },
  { href: "/safety", label: "Safety" },
  { href: "/trainer", label: "Trainer" },
  { href: "/records", label: "Records" }
];

export default function SafetySubnav() {
  const pathname = usePathname() || "/";
  
  return (
    <nav aria-label="Flat Earth Safety" className="w-full border-b bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap gap-1 py-2">
          {items.map(it => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <li key={it.href}>
                <Link 
                  href={it.href}
                  className={cn(
                    "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-slate-900 focus-visible:ring-[#F76511]",
                    active 
                      ? "bg-slate-800 text-white" 
                      : "text-slate-100 hover:bg-slate-800/70 hover:text-white"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
