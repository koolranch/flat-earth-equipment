// Stub file for checkout actions
'use server'

export async function createCheckoutSession(planId: string) {
  return {
    success: true,
    checkoutUrl: '/training/checkout/success',
  };
}

export async function createTrainingCheckoutSessionFromForm(formData: FormData) {
  const planId = formData.get('planId') as string;
  return createCheckoutSession(planId);
}

export async function processPayment(paymentData: any) {
  return {
    success: true,
    transactionId: 'stub-transaction',
  };
}
