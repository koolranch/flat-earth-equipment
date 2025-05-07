export default function Page() {
  return (
    <main className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold">✅ TEST DEPLOY SUCCESS</h1>
        <p className="mt-2 text-lg text-gray-700">
          This is your App Router homepage, deployed at {new Date().toUTCString()}.
        </p>
      </div>
    </main>
  );
} 