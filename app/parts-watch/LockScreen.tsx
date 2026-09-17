export default function LockScreen({ error }: { error: boolean }) {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-canyon-rust">
            Internal
          </p>
          <h1 className="mt-2 text-xl font-semibold text-white">Sign in</h1>
          <p className="mt-2 text-sm text-slate-400">
            This page is for internal use only.
          </p>

          <form action="/parts-watch/login" method="post" className="mt-6 space-y-3">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base text-white placeholder:text-slate-500 focus:border-canyon-rust focus:outline-none focus:ring-2 focus:ring-canyon-rust/40"
              placeholder="Password"
            />
            {error && (
              <p role="alert" className="text-sm text-red-400">
                Wrong password.
              </p>
            )}
            <button
              type="submit"
              className="min-h-[44px] w-full rounded-lg bg-canyon-rust px-4 py-3 font-semibold text-white transition hover:bg-canyon-rust/90 focus:outline-none focus:ring-2 focus:ring-canyon-rust/50"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
