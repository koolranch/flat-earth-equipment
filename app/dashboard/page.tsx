// app/dashboard/page.tsx
import { redirect } from "next/navigation";
export default function LegacyDashboard() {
  redirect("/dashboard-simple");
}