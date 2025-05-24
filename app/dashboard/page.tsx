import { redirect } from 'next/navigation'

export default function Dashboard() {
  // Temporarily redirect to simple dashboard while we fix the main one
  redirect('/dashboard-simple')
} 