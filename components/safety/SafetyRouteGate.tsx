"use client";
import { usePathname } from "next/navigation";
import SafetySubnav from "@/components/safety/SafetySubnav";

// Only show navigation on training dashboard/tools pages, NOT on marketing landing page
const SAFETY_PATHS = ["/training", "/trainer", "/records"];

export function SafetyRouteGate() {
  const pathname = usePathname() || "/";
  const show = SAFETY_PATHS.some(path => pathname === path || pathname.startsWith(path + "/"));
  
  return show ? <SafetySubnav /> : null;
}

export default SafetyRouteGate;
