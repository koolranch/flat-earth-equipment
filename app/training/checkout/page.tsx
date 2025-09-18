export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TrainingCheckout() {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-semibold">Get Access to Forklift Training</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in and purchase a seat, or redeem an invite from your employer.</p>
      {/* TODO: link to your Stripe checkout / seat claim flow */}
      <div className="mt-6 flex gap-3">
        <a href="/pricing" className="btn-primary">Purchase</a>
        <a href="/trainer/redeem" className="btn-secondary">Redeem Invite</a>
      </div>
    </div>
  );
}
