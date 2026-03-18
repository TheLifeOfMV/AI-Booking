import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe operations will fail.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const STRIPE_PRICE_IDS: Record<string, string | null> = {
  gratuito: null,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || null,
  elite: process.env.STRIPE_ELITE_PRICE_ID || null,
};

export type PlanType = 'gratuito' | 'premium' | 'elite';
