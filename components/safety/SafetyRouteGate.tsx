"use client";
import { usePathname } from "next/navigation";
import SafetySubnav from "@/components/safety/SafetySubnav";

// Show navigation only on main dashboard pages, NOT on individual training modules
const EXACT_PATHS = ["/training", "/trainer", "/records"];

export function SafetyRouteGate() {
  const pathname = usePathname() || "/";
  
  // Only show on exact dashboard pages, hide when in actual module content
  const isExactMatch = EXACT_PATHS.includes(pathname);
  const isTrainerSubpage = pathname.startsWith("/trainer/") && !pathname.includes("/training/");
  const isRecordsSubpage = pathname.startsWith("/records/");
  
  // Show on: /training, /trainer, /trainer/*, /records, /records/*
  // Hide on: /training/module-1, /training/forklift-operator/*, etc.
  const show = isExactMatch || isTrainerSubpage || isRecordsSubpage;
  
  return show ? <SafetySubnav /> : null;
}

export default SafetyRouteGate;
