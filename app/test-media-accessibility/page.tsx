import VideoPlayer from '@/components/VideoPlayer'

export default function TestMediaAccessibility() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          Media Accessibility Test
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Testing captions and transcript functionality
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Video with Captions & Transcript</h2>
        <VideoPlayer 
          src="https://example.com/sample-video.m3u8"
          slug="module-1-intro"
          poster="https://example.com/poster.jpg"
          showTranscript={true}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Video without Transcript</h2>
        <VideoPlayer 
          src="https://example.com/sample-video2.m3u8"
          slug="module-2-demo"
          showTranscript={false}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Video without Captions (no slug)</h2>
        <VideoPlayer 
          src="https://example.com/sample-video3.m3u8"
        />
      </section>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Accessibility Features:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Captions load automatically based on locale (EN/ES)</li>
          <li>• English fallback captions when locale-specific captions unavailable</li>
          <li>• Transcript accordion with locale-aware content</li>
          <li>• ARIA-expanded attributes for screen readers</li>
          <li>• crossOrigin="anonymous" for caption loading</li>
          <li>• Keyboard accessible controls</li>
        </ul>
      </div>
    </main>
  )
}
