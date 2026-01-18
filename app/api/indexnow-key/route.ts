// IndexNow Key Verification Endpoint
// Served at /e8f4a2b1c9d7e5f3.txt via rewrite in next.config.js

export async function GET() {
  return new Response('e8f4a2b1c9d7e5f3', {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    },
  });
}
