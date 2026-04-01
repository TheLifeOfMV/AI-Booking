import crypto from 'crypto';

const WOMPI_BASE_URL =
  process.env.WOMPI_ENV === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1';

export const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY ?? '';
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY ?? '';
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET ?? '';

if (!WOMPI_PRIVATE_KEY) {
  console.warn('WOMPI_PRIVATE_KEY is not set. Wompi operations will fail.');
}

export type PlanType = 'gratuito' | 'premium' | 'elite';

export const PLAN_AMOUNT_COP: Record<PlanType, number> = {
  gratuito: 0,
  premium: 10000000,
  elite: 15000000,
};

async function wompiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${WOMPI_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Wompi ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export interface WompiAcceptanceTokenResponse {
  data: { presigned_acceptance: { acceptance_token: string; permalink: string } };
}

export async function getAcceptanceToken(): Promise<string> {
  const data = await wompiRequest<WompiAcceptanceTokenResponse>(
    `/merchants/${WOMPI_PUBLIC_KEY}`,
    { method: 'GET' },
  );
  return data.data.presigned_acceptance.acceptance_token;
}

export interface WompiTransactionPayload {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  reference: string;
  payment_method?: { type: string; token?: string; installments?: number };
  payment_source_id?: number;
  redirect_url?: string;
  acceptance_token?: string;
  customer_data?: {
    phone_number?: string;
    full_name?: string;
    legal_id?: string;
    legal_id_type?: string;
  };
}

export interface WompiTransaction {
  id: string;
  status: string;
  reference: string;
  amount_in_cents: number;
  payment_source_id?: number;
  payment_method?: { type: string; token?: string };
}

export interface WompiTransactionResponse {
  data: WompiTransaction;
}

export async function createTransaction(
  payload: WompiTransactionPayload,
): Promise<WompiTransactionResponse> {
  return wompiRequest<WompiTransactionResponse>('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getTransaction(
  transactionId: string,
): Promise<WompiTransactionResponse> {
  return wompiRequest<WompiTransactionResponse>(
    `/transactions/${transactionId}`,
  );
}

export interface WompiTokenizePayload {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface WompiTokenResponse {
  data: { id: string; brand: string; last_four: string };
}

export async function tokenizeCard(
  payload: WompiTokenizePayload,
): Promise<WompiTokenResponse> {
  return wompiRequest<WompiTokenResponse>('/tokens/cards', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface WompiPaymentSourcePayload {
  type: string;
  token: string;
  customer_email: string;
  acceptance_token: string;
}

export interface WompiPaymentSource {
  id: number;
  type: string;
  token: { brand: string; last_four: string };
  status: string;
}

export interface WompiPaymentSourceResponse {
  data: WompiPaymentSource;
}

export async function createPaymentSource(
  payload: WompiPaymentSourcePayload,
): Promise<WompiPaymentSourceResponse> {
  return wompiRequest<WompiPaymentSourceResponse>('/payment_sources', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyWebhookSignature(
  timestamp: string,
  checksum: string,
  transactionId: string,
  status: string,
  amountInCents: number,
): boolean {
  const concatenated = `${transactionId}${status}${amountInCents}${timestamp}${WOMPI_EVENTS_SECRET}`;
  const hash = crypto.createHash('sha256').update(concatenated).digest('hex');
  return hash === checksum;
}

export function generateReference(
  doctorUserId: string,
  planType: string,
): string {
  const ts = Date.now();
  return `sub_${doctorUserId.slice(0, 8)}_${planType}_${ts}`;
}
