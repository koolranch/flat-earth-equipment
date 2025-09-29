// Stub file for enrollment server requirement
import { redirect } from 'next/navigation';

export async function requireEnrollmentServer(options: { checkoutPath?: string } = {}) {
  // In a real implementation, this would check if user has enrollment
  // For now, we'll allow access to enable testing of the restored training tabs
  console.log('requireEnrollmentServer: Allowing access for testing purposes');
  return true;
}
