import { headers } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Seat Claimed — Start Training',
  robots: { index: false, follow: false },
};

const APP_STORE_URL = 'https://apps.apple.com/app/id6759796469';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.flateartheequipment.forkliftcertified';

export default function ClaimSuccessPage() {
  const host = headers().get('host')?.toLowerCase() || '';
  const isGfc = host.startsWith('app.getforkliftcertified.com');

  if (!isGfc) {
    // FEE-origin operators train in the browser (existing behavior), with the
    // mobile app offered as a secondary option.
    return (
      <main className="container mx-auto p-4 max-w-2xl py-10">
        <div className="rounded-2xl border p-8 bg-white text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Your seat is claimed</h1>
          <p className="text-slate-600 mb-6">
            You're enrolled and ready to start your forklift operator training.
          </p>
          <Link
            href="/training"
            className="inline-block rounded-2xl bg-[#F76511] text-white px-8 py-3 font-medium hover:bg-[#E55A0C] transition-colors"
          >
            Start Training
          </Link>
          <p className="mt-6 text-sm text-slate-500">
            Prefer your phone? Get the Forklift Certified app on the{' '}
            <a href={APP_STORE_URL} className="underline">App Store</a> or{' '}
            <a href={PLAY_STORE_URL} className="underline">Google Play</a> and sign in with the
            same email and password.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-2xl py-10">
      <div className="rounded-2xl border p-8 bg-white">
        <header className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Your seat is claimed</h1>
          <p className="text-slate-600">
            Your account is ready and you're enrolled. Here's how to start training.
          </p>
        </header>

        <ol className="space-y-5 mb-8">
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F76511] text-white text-sm font-bold">
              1
            </span>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Get the Forklift Certified app</p>
              <p className="text-sm text-slate-600 mb-3">
                Train anywhere — most operators finish in under 30 minutes on a phone.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={APP_STORE_URL}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  App Store
                </a>
                <a
                  href={PLAY_STORE_URL}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" />
                  </svg>
                  Google Play
                </a>
              </div>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F76511] text-white text-sm font-bold">
              2
            </span>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Sign in with your new account</p>
              <p className="text-sm text-slate-600">
                Use the email address your invite was sent to and the password you just created.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F76511] text-white text-sm font-bold">
              3
            </span>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Complete your certification</p>
              <p className="text-sm text-slate-600">
                Interactive lessons, quick quizzes, and a final exam — in English or Spanish. Pass
                and get a QR-verifiable certificate valid for 3 years.
              </p>
            </div>
          </li>
        </ol>

        <div className="border-t pt-6 text-center">
          <p className="text-sm text-slate-600 mb-3">Prefer a computer?</p>
          <Link
            href="/training"
            className="inline-block rounded-2xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Continue in Browser
          </Link>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-500">
        <p>
          Questions? Email{' '}
          <a href="mailto:support@getforkliftcertified.com" className="underline">
            support@getforkliftcertified.com
          </a>
        </p>
      </footer>
    </main>
  );
}
