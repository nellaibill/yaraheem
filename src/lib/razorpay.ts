/**
 * Thin wrapper around Razorpay's Checkout.js widget. The script is only loaded when checkout
 * actually returns a razorpayKeyId (i.e. the backend has a real Razorpay gateway configured) —
 * dev/pilot runs without real credentials never load or touch this at all.
 */

interface RazorpaySuccessResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayCheckoutOptions {
  key: string
  order_id: string
  amount: number
  currency: string
  name: string
  description: string
  prefill?: { name?: string; contact?: string }
  theme?: { color?: string }
  handler: (response: RazorpaySuccessResponse) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayCheckoutInstance {
  open: () => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance
  }
}

let scriptLoadPromise: Promise<void> | null = null

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load the Razorpay checkout script.'))
    document.body.appendChild(script)
  })
  return scriptLoadPromise
}

export async function openRazorpayCheckout(options: {
  keyId: string
  razorpayOrderId: string
  amountInPaise: number
  customerName: string
  customerPhone: string
}): Promise<RazorpaySuccessResponse> {
  await loadRazorpayScript()

  if (!window.Razorpay) {
    throw new Error('Razorpay checkout script did not load correctly.')
  }

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: options.keyId,
      order_id: options.razorpayOrderId,
      amount: options.amountInPaise,
      currency: 'INR',
      name: 'Ya Raheem Catering Services',
      description: 'Order payment',
      prefill: { name: options.customerName, contact: options.customerPhone },
      theme: { color: '#7a1c2b' },
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) },
    })
    checkout.open()
  })
}
