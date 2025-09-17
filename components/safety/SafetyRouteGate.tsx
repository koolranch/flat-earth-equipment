"use client";
import { usePathname } from "next/navigation";
import SafetySubnav from "@/components/safety/SafetySubnav";

const SAFETY_PATHS = ["/training", "/safety", "/trainer", "/records"];

export function SafetyRouteGate() {
  const pathname = usePathname() || "/";
  const show = SAFETY_PATHS.some(path => pathname === path || pathname.startsWith(path + "/"));
  
  return show ? <SafetySubnav /> : null;
}

export default SafetyRouteGate;
