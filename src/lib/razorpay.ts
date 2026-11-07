import 'server-only';
import Razorpay from 'razorpay';

/** Initialize only for payment requests, so missing credentials cannot crash a build. */
export function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
