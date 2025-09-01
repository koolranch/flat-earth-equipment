export default function SkipToContent() {
  return (
    <a 
      href="#content" 
      className="sr-only focus:not-sr-only fixed left-2 top-2 bg-white border px-3 py-2 rounded-2xl shadow z-[9999] focus:outline-none focus:ring-2 focus:ring-[#F76511] focus:ring-offset-2"
    >
      Skip to content
    </a>
  );
}
