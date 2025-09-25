import Link from 'next/link';

export default function IntroPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Introduction</h1>
      <p className="mt-2 text-muted-foreground">Welcome! You'll complete short demos, flash cards, quick practice, and a brief quiz in each module. When you're ready, continue to Module 1.</p>
      <div className="mt-6">
        <Link href="/training/module/2?courseId=forklift" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Start Module 1</Link>
      </div>
    </div>
  );
}
