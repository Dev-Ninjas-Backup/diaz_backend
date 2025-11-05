export type StripePaymentMetadata = {
  userId: string;
  email: string;
  name: string;
  planId: string;
  planTitle: string;
  priceCents: number;
  stripeProductId: string;
  stripePriceId: string;
};
