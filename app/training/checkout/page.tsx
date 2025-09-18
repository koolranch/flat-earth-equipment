import { createTrainingCheckoutSession } from './actions';
import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TrainingCheckout() {
  noStore();
  
  async function handlePurchase() {
    'use server';
    const { url } = await createTrainingCheckoutSession();
    redirect(url);
  }

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-semibold">Get Access to Forklift Training</h1>
      <p className="mt-2 text-sm text-muted-foreground">Purchase a seat or redeem an invite from your employer.</p>
      <div className="mt-6 flex gap-3">
        <form action={handlePurchase}>
          <button type="submit" className="btn-primary" data-testid="purchase-training">
            Purchase Training ($59)
          </button>
        </form>
        <a href="/claim" className="btn-secondary">Redeem Invite</a>
      </div>
    </div>
  );
}
