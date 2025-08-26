export default function Page(){
  // Keep simple: instruct where to check metrics in Vercel Analytics, and show helpful deep links.
  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Brand Analytics Helper</h1>
      
      <div className='bg-blue-50 rounded-lg p-4'>
        <h2 className='font-semibold mb-2'>Track these custom events in Vercel Analytics:</h2>
        <ul className='list-disc pl-6 text-sm space-y-1'>
          <li><code className='bg-white px-1 rounded'>serial_submit</code> — serial tool usage by brand</li>
          <li><code className='bg-white px-1 rounded'>fault_search</code> / <code className='bg-white px-1 rounded'>fault_search_error</code> — diagnostic searches</li>
          <li><code className='bg-white px-1 rounded'>svc_submission</code> — user tip submitted (with type and brand)</li>
          <li><code className='bg-white px-1 rounded'>cta_variant_view</code> / <code className='bg-white px-1 rounded'>cta_click</code> — CTA A/B test results</li>
          <li><code className='bg-white px-1 rounded'>svc_submission_rate_limited</code> — anti-spam triggers (server logs)</li>
        </ul>
      </div>
      
      <div className='bg-gray-50 rounded-lg p-4'>
        <h2 className='font-semibold mb-2'>Analytics Filters to Use:</h2>
        <div className='text-sm space-y-2'>
          <div><strong>By Brand:</strong> Filter by path prefix <code className='bg-white px-1 rounded'>/brand/{'{slug}'}</code></div>
          <div><strong>By Feature:</strong> Filter by event name and analyze conversion funnels</div>
          <div><strong>By Geography:</strong> Compare regional usage patterns</div>
          <div><strong>By Time:</strong> Track growth trends and peak usage periods</div>
        </div>
      </div>
      
      <div className='bg-green-50 rounded-lg p-4'>
        <h2 className='font-semibold mb-2'>Key Metrics to Monitor:</h2>
        <div className='grid md:grid-cols-2 gap-4 text-sm'>
          <div>
            <h3 className='font-medium mb-1'>User Engagement</h3>
            <ul className='list-disc pl-4 space-y-1'>
              <li>Serial lookup usage by brand</li>
              <li>Fault code search volume</li>
              <li>Community submission rate</li>
              <li>CTA click-through rates</li>
            </ul>
          </div>
          <div>
            <h3 className='font-medium mb-1'>Content Performance</h3>
            <ul className='list-disc pl-4 space-y-1'>
              <li>Brand hub traffic distribution</li>
              <li>Spanish vs English usage</li>
              <li>Guide vs fault tab preferences</li>
              <li>Community Notes engagement</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className='border rounded-lg p-4'>
        <h2 className='font-semibold mb-2'>Quick Links:</h2>
        <div className='space-y-2 text-sm'>
          <div>
            <strong>Vercel Analytics:</strong> 
            <span className='ml-2 text-blue-600'>Visit your Vercel dashboard → Analytics → Events</span>
          </div>
          <div>
            <strong>Admin Actions:</strong> 
            <a href='/admin/service' className='ml-2 text-blue-600 underline'>Review Submissions</a>
          </div>
          <div>
            <strong>Submission Test:</strong> 
            <span className='ml-2 text-blue-600'>Visit any brand hub to test the submission flow</span>
          </div>
        </div>
      </div>
      
      <p className='text-sm text-muted-foreground'>
        Use the Analytics dashboard filters by event name and path prefix (/brand/{'{slug}'}) to compare brands. 
        For deeper analytics, consider integrating with your preferred analytics platform.
      </p>
    </div>
  );
}
