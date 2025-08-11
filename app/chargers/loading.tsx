export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-80 rounded bg-neutral-200" />
        <div className="h-4 w-2/3 rounded bg-neutral-200" />
      </div>

      <div className="mb-6 rounded-2xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-10 rounded bg-neutral-200" />
          <div className="h-10 rounded bg-neutral-200" />
          <div className="h-10 rounded bg-neutral-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-white">
            <div className="aspect-[4/3] w-full rounded-t-2xl bg-neutral-200" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-2/3 rounded bg-neutral-200" />
              <div className="h-4 w-full rounded bg-neutral-200" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded-full bg-neutral-200" />
                <div className="h-6 w-12 rounded-full bg-neutral-200" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 rounded bg-neutral-200" />
                <div className="h-8 w-36 rounded bg-neutral-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


