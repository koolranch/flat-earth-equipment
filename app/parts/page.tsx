import Link from "next/link";
import {
  TruckIcon,
  MoveHorizontalIcon,
  MoveIcon,
  DropletIcon,
  ZapIcon,
  Gamepad2Icon,
  BatteryChargingIcon,
  CircleIcon,
  LucideIcon,
} from "lucide-react";

export const metadata = {
  title: "Shop Parts by Category | Flat Earth Equipment",
  description:
    "Explore forklift, scissor lift, and construction equipment parts by category. Hydraulic, electrical, joystick controllers, and more — shipped nationwide.",
};

type CategoryIcon = 
  | "TruckIcon"
  | "MoveHorizontalIcon"
  | "MoveIcon"
  | "DropletIcon"
  | "ZapIcon"
  | "Gamepad2Icon"
  | "BatteryChargingIcon"
  | "CircleIcon";

interface Category {
  name: string;
  slug: string;
  icon: CategoryIcon;
}

const categories: Category[] = [
  { name: "Forklift Parts", slug: "forklift-parts", icon: "TruckIcon" },
  { name: "Scissor Lift Parts", slug: "scissor-lift-parts", icon: "MoveHorizontalIcon" },
  { name: "Telehandler Parts", slug: "telehandler-parts", icon: "MoveIcon" },
  { name: "Hydraulic Components", slug: "hydraulic", icon: "DropletIcon" },
  { name: "Electrical Systems", slug: "electrical", icon: "ZapIcon" },
  { name: "Controllers & Joysticks", slug: "controllers", icon: "Gamepad2Icon" },
  { name: "Chargers & Batteries", slug: "chargers", icon: "BatteryChargingIcon" },
  { name: "Brakes & Wheels", slug: "brakes-wheels", icon: "CircleIcon" },
];

const iconMap: Record<CategoryIcon, LucideIcon> = {
  TruckIcon,
  MoveHorizontalIcon,
  MoveIcon,
  DropletIcon,
  ZapIcon,
  Gamepad2Icon,
  BatteryChargingIcon,
  CircleIcon,
};

export default function PartsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
        Browse Parts by Category
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center justify-center text-center bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm hover:border-canyon-rust transition"
            >
              <Icon className="h-6 w-6 mb-2 text-canyon-rust" />
              <span className="text-sm font-medium text-slate-800">{cat.name}</span>
            </Link>
          );
        })}
      </div>

      <p className="mt-12 text-center text-slate-500 text-sm">
        Looking for something specific?{" "}
        <Link href="/contact" className="text-canyon-rust underline">
          Request a part quote here
        </Link>
        .
      </p>
    </main>
  );
} 