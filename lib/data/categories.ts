import {
  TruckIcon,
  MoveHorizontalIcon,
  MoveIcon,
  DropletIcon,
  CircleIcon,
  BatteryChargingIcon,
  LucideIcon,
} from "lucide-react";

export interface Category {
  name: string;
  slug: string;
  icon: string;
  intro: string;
  relatedSlugs: string[];
  supportedBrandSlugs?: string[];
}

export const categories: Category[] = [
  {
    name: "Forklift Parts",
    slug: "forklift-parts",
    icon: "TruckIcon",
    intro: "We stock controllers, seats, hydraulics, electrical, and drive components for most major forklift brands — shipped fast and fit-tested.",
    relatedSlugs: ["battery-chargers", "controllers", "seats"],
    supportedBrandSlugs: ["toyota", "hyster", "doosan", "crown", "genie"]
  },
  {
    name: "Skid Steer Parts",
    slug: "skid-steer-parts",
    icon: "MoveHorizontalIcon",
    intro: "From undercarriage kits to filters and hydraulic hoses, our skid steer parts are built to handle the toughest work sites.",
    relatedSlugs: ["hydraulics", "filters", "rollers-tracks"]
  },
  {
    name: "Telehandler Parts",
    slug: "telehandler-parts",
    icon: "MoveIcon",
    intro: "Hydraulic systems, control modules, and cab electronics for reliable telehandler performance on any terrain.",
    relatedSlugs: ["controllers", "electrical"],
    supportedBrandSlugs: ["genie", "jlg", "hyster"]
  },
  {
    name: "Mini Excavator Parts",
    slug: "mini-excavator-parts",
    icon: "DropletIcon",
    intro: "Explore rollers, track systems, hydraulic pumps, and electrical components for mini excavators.",
    relatedSlugs: ["rollers-tracks", "hydraulics"]
  },
  {
    name: "Buggy Parts",
    slug: "buggy-parts",
    icon: "CircleIcon",
    intro: "Need tracks or roller assemblies for Toro Dingos or buggies? We've got fitment-specific parts ready to ship.",
    relatedSlugs: ["rollers-tracks"]
  },
  {
    name: "Battery Chargers",
    slug: "battery-chargers",
    icon: "BatteryChargingIcon",
    intro: "Chargers, modules, and accessories for forklifts, aerial lifts, and industrial fleets — reliable power, fast delivery.",
    relatedSlugs: ["electrical", "controllers"],
    supportedBrandSlugs: ["enersys", "curtis", "raymond"]
  }
];

// Icon mapping for components to use
export const iconMap: Record<string, LucideIcon> = {
  TruckIcon,
  MoveHorizontalIcon,
  MoveIcon,
  DropletIcon,
  CircleIcon,
  BatteryChargingIcon,
}; 