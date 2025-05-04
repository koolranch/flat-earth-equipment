import Link from "next/link";
export default function Hero() {
  return (
    <section className="flex flex-col items-center gap-6 py-16 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Flat Earth Equipment
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        OEM replacement parts & nationwide equipment rentals—fast quotes, same‑day shipping.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/parts" className="btn-primary">Find Parts</Link>
        <Link href="/rentals" className="btn-secondary">Rent Equipment</Link>
      </div>
    </section>
  );
} 