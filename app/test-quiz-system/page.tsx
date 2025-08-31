import Link from 'next/link';

export default function TestQuizSystemPage() {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          Quiz System Test
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Testing the bilingual quiz content system with locale-aware API
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            Available Quizzes
          </h3>
          <div className="space-y-2">
            <Link 
              href="/quiz/pre-operation-inspection"
              className="block p-3 bg-white dark:bg-slate-800 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <div className="font-medium">Pre-Operation Inspection</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">5 questions • PPE, safety checks, data plate</div>
            </Link>
            
            <Link 
              href="/quiz/eight-point-inspection"
              className="block p-3 bg-white dark:bg-slate-800 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <div className="font-medium">8-Point Inspection</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">5 questions • Daily inspection checklist</div>
            </Link>
            
            <Link 
              href="/quiz/balance-load-handling"
              className="block p-3 bg-white dark:bg-slate-800 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <div className="font-medium">Balance & Load Handling</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">5 questions • Stability triangle, capacity</div>
            </Link>
            
            <Link 
              href="/quiz/hazard-hunt"
              className="block p-3 bg-white dark:bg-slate-800 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <div className="font-medium">Hazard Hunt</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">5 questions • Safety awareness, hazard identification</div>
            </Link>
            
            <Link 
              href="/quiz/shutdown-sequence"
              className="block p-3 bg-white dark:bg-slate-800 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <div className="font-medium">Shutdown Sequence</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">5 questions • Safe parking, proper shutdown</div>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
          <h3 className="font-medium text-green-900 dark:text-green-100 mb-3">
            API Endpoints
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <div className="font-medium text-green-800 dark:text-green-200">English Content:</div>
              <code className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded">/api/quiz/pre-operation-inspection.json</code>
            </div>
            <div>
              <div className="font-medium text-green-800 dark:text-green-200">Spanish Content:</div>
              <code className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded">/api/quiz/eight-point-inspection.json</code>
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                (Set locale=es cookie to test Spanish content)
              </div>
            </div>
            <div>
              <div className="font-medium text-green-800 dark:text-green-200">Content Structure:</div>
              <div className="text-xs text-green-700 dark:text-green-300">
                content/quiz/[slug].[locale].json
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700">
        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-3">
          Quiz System Features
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-800 dark:text-yellow-200">
          <div>
            <div className="font-medium mb-2">Content Management:</div>
            <ul className="space-y-1 text-xs">
              <li>• Bilingual JSON content (EN/ES)</li>
              <li>• Locale-aware API with English fallback</li>
              <li>• Backward compatibility with existing structure</li>
              <li>• Rich question metadata and explanations</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">User Experience:</div>
            <ul className="space-y-1 text-xs">
              <li>• DynamicQuiz component integration</li>
              <li>• Automatic locale detection from cookies</li>
              <li>• Pass/fail scoring with explanations</li>
              <li>• Mobile-responsive design</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-4 bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700">
        <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-3">
          Testing Instructions
        </h3>
        <div className="text-sm text-purple-800 dark:text-purple-200 space-y-2">
          <div>
            <div className="font-medium">1. Test English Content:</div>
            <div className="text-xs">Click any quiz link above with default locale</div>
          </div>
          <div>
            <div className="font-medium">2. Test Spanish Content:</div>
            <div className="text-xs">
              Set locale cookie to 'es' and test quiz links
              <br />
              <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded mt-1 inline-block">
                document.cookie = "locale=es; path=/"
              </code>
            </div>
          </div>
          <div>
            <div className="font-medium">3. Test API Directly:</div>
            <div className="text-xs">
              Visit API endpoints directly to see JSON responses
              <br />
              <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded mt-1 inline-block">
                /api/quiz/pre-operation-inspection.json
              </code>
            </div>
          </div>
          <div>
            <div className="font-medium">4. Test Fallback:</div>
            <div className="text-xs">
              Test with unsupported locale to verify English fallback
            </div>
          </div>
        </div>
      </section>

      <section className="text-center space-y-3">
        <div className="space-x-3">
          <Link 
            href="/training" 
            className="inline-flex rounded-2xl bg-[var(--brand-orange)] text-white px-4 py-2 shadow-lg hover:bg-orange-600 transition"
          >
            Back to Training Hub
          </Link>
          <Link 
            href="/test-demo-panel" 
            className="inline-flex rounded-2xl border border-slate-300 dark:border-slate-600 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Test Demo Panel
          </Link>
        </div>
        
        <div className="text-xs text-slate-500">
          Quiz routes: /quiz/[slug] | API: /api/quiz/[filename].json
        </div>
      </section>
    </main>
  );
}
