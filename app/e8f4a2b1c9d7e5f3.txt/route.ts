// IndexNow Key Verification Endpoint
// This key file must be accessible at the root of the domain for IndexNow to work

export async function GET() {
  return new Response('e8f4a2b1c9d7e5f3', {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
