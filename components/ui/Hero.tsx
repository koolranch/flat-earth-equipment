import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section
      className={cn(
        "relative flex h-[80vh] items-center justify-center bg-cover bg-center",
        "before:absolute before:inset-0 before:bg-black before:bg-opacity-50"
      )}
      style={{ backgroundImage: "url('/hero-bg.jpg')" }}
    >
      <div className="relative z-10 text-center text-white max-w-2xl px-4 space-y-6">
        <h1 className="text-5xl font-heading leading-tight">
          Flat Earth Equipment
        </h1>
        <p className="text-lg">
          OEM replacement parts & nationwide equipment rentals — fast quotes,
          same-day shipping across WY, MT, & NM.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild>
            <a href="/parts">Find Parts</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/rentals">Rent Equipment</a>
          </Button>
        </div>
      </div>
    </section>
  );
} 