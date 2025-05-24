export default function SafetyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-gray-900">
      <header className="border-b p-4">
        <h1 className="text-xl font-bold">Flat&nbsp;Earth Safety™</h1>
      </header>
      <main>{children}</main>
    </div>
  )
} 