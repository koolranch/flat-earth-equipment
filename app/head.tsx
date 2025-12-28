export default function Head({ params }: { params?: { locale?: 'en' | 'es', slug?: string } }) {
  const url = 'https://flatearthequipment.com'
  const currentPath = params?.slug || ''
  const locale = params?.locale || 'en'
  
  return (
    <>
      <title>Flat Earth Equipment | OEM Parts & Equipment Rentals</title>
      <meta
        name="description"
        content="Your one-stop source for OEM replacement parts and nationwide equipment rentals—fast quotes, same-day shipping."
      />
      <meta property="og:title" content="Flat Earth Equipment | OEM Parts & Rentals" />
      <meta
        property="og:description"
        content="Search thousands of parts or rent equipment in your city. Fast shipping & expert support."
      />
      <meta property="og:image" content="/og-image.png" />
      <link rel="icon" href="/favicon.ico" />
      
      {/* hreflang for SEO */}
      <link
        rel="alternate"
        hrefLang="en"
        href={`${url}${currentPath.replace(/^\/es/, '')}`}
      />
      <link
        rel="alternate"
        hrefLang="es"
        href={`${url}/es${currentPath.replace(/^\/en/, '').replace(/^\/es/, '')}`}
      />
      
      {/* Tailwind CDN for immediate styling */}
      <link
        href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.7/dist/tailwind.min.css"
        rel="stylesheet"
      />
    </>
  );
} 