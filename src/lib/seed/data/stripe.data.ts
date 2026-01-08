import { PlanType } from 'generated/client';

export const planSeedData = [
  {
    title: 'Gold Package',
    planType: PlanType.GOLD,
    description: 'Gold plan for boat owners',
    benefits: [
      'List in minutes!',
      'Fast, affordable, effective!',
      'Entry-Level Package Maximum Exposure!',
      'No social media drama - just real buyers!',
      '5 Pics and 500 word description!',
      'One month FREE plan opportunity with promo code!',
      'No overpay to sell your boat!',
    ],
    picLimit: 5,
    wordLimit: 500,
    price: 9.99,
  },
  {
    title: 'Platinum Package',
    planType: PlanType.PLATINUM,
    description: 'Platinum plan for boat owners',
    benefits: [
      'List in minutes!',
      'Fast, affordable, effective!',
      'More space, more visuals, more opportunity!',
      'No social media drama - just real buyers!',
      '10 Pics and 1000 word description!',
      '2 months FREE plan opportunity with promo code',
      'No overpay to sell your boat!',
    ],
    picLimit: 10,
    wordLimit: 1000,
    isBest: true,
    price: 15.99,
  },
  {
    title: 'Diamond Elite Brokerage',
    planType: PlanType.DIAMOND,
    description: 'Diamond plan for boat owners',
    benefits: [
      'Brokers & Pro Sales Agencies',
      'Fast, affordable, effective!',
      'Multiple listings included under one package!',
      'Showcase like a pro!',
      '75 Pics and 5000 word description!',
      '2 months FREE plan opportunity with promo code',
      'No overpay to sell your boat!',
    ],
    picLimit: 75,
    wordLimit: 5000,
    price: 29.99,
  },
];

export enum PromoCode {
  GOLD10 = 'GOLD10',
  PLAT20 = 'PLAT20',
  DIAM30 = 'DIAM30',
}

export const couponSeedData = [
  {
    code: PromoCode.GOLD10,
    freeDays: 30,
  },
  {
    code: PromoCode.PLAT20,
    freeDays: 60,
  },
  {
    code: PromoCode.DIAM30,
    freeDays: 60,
  },
];

export const freeCouponSeedData = [30, 60, 90, 120, 150, 180, 360].map(
  (days) => ({
    code: `FREE${days}`,
    freeDays: days,
  }),
);
