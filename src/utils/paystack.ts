import axios from 'axios';
import { env } from '../config/env';

const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function initializeTransaction(params: {
  email: string;
  amountInKobo: number;
  reference: string;
  callbackUrl: string;
}) {
  const response = await paystackClient.post('/transaction/initialize', {
    email: params.email,
    amount: params.amountInKobo,
    reference: params.reference,
    callback_url: params.callbackUrl,
  });
  return response.data.data; // contains authorization_url, access_code, reference
}

export async function verifyTransaction(reference: string) {
  const response = await paystackClient.get(`/transaction/verify/${reference}`);
  return response.data.data; // contains status, amount, customer, etc.
}