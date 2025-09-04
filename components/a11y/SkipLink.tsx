'use client';

export default function SkipLink(){
  return (
    <a 
      href="#main" 
      className="sr-only focus:not-sr-only fixed left-2 top-2 z-50 bg-white text-black border rounded-md px-3 py-2 shadow-lg transition-all"
    >
      Skip to content
    </a>
  );
}