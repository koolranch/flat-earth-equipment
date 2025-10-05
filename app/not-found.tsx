import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Flat Earth Equipment',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Large 404 */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
            404
          </h1>
          <h2 className="text-3xl font-bold text-slate-900">
            Page Not Found
          </h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist.
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border-2 border-orange-200 p-8 shadow-lg">
          <h3 className="text-xl font-semibold mb-6 text-slate-900">
            Looking for something specific?
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/safety"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl hover:shadow-md transition-all"
            >
              <span className="text-2xl">🎓</span>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Safety Training</div>
                <div className="text-sm text-slate-600">Get certified online</div>
              </div>
            </Link>
            
            <Link
              href="/parts"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-md transition-all"
            >
              <span className="text-2xl">🔧</span>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Parts Catalog</div>
                <div className="text-sm text-slate-600">Find equipment parts</div>
              </div>
            </Link>
            
            <Link
              href="/rentals"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl hover:shadow-md transition-all"
            >
              <span className="text-2xl">🚜</span>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Rent Equipment</div>
                <div className="text-sm text-slate-600">Browse rentals</div>
              </div>
            </Link>
            
            <Link
              href="/contact"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl hover:shadow-md transition-all"
            >
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <div className="font-semibold text-slate-900">Contact Us</div>
                <div className="text-sm text-slate-600">Get help</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F76511] to-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all"
          >
            ← Back to Homepage
          </Link>
          <p className="text-sm text-slate-500">
            Or try searching from the navigation menu above
          </p>
        </div>
      </div>
    </main>
  );
}

