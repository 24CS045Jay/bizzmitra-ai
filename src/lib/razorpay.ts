/**
 * Real-Time Razorpay Payment Gateway Integration
 * Supports Indian Rupee (₹ INR) payments via UPI (Google Pay, PhonePe, Paytm),
 * Credit/Debit Cards (RuPay, Visa, Mastercard), Netbanking, and Wallets.
 */

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayCheckoutOptions {
  amountInRupees: number;
  planName: string;
  creditsGranted: number;
  customerName?: string | undefined;
  customerEmail?: string | undefined;
  customerPhone?: string | undefined;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onDismiss?: (() => void) | undefined;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

/**
 * Dynamically loads the official Razorpay Standard Checkout script.
 */
export async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Launches the real-time Razorpay checkout window for Indian Rupees (₹).
 */
export async function initiateRazorpayPayment(options: RazorpayCheckoutOptions): Promise<boolean> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    throw new Error("Unable to load Razorpay payment gateway SDK. Please check your internet connection.");
  }

  const keyId =
    (typeof import.meta !== "undefined" && (import.meta.env as Record<string, string | undefined>)["VITE_RAZORPAY_KEY_ID"]) ||
    "rzp_test_1DP5mmOlF5G5ag";

  const amountInPaise = Math.round(options.amountInRupees * 100);

  const razorpayOptions: Record<string, any> = {
    key: keyId,
    amount: amountInPaise,
    currency: "INR",
    name: "BizzMitra-AI",
    description: `${options.planName} Plan — ${options.creditsGranted.toLocaleString("en-IN")} Credits`,
    image: "https://bizzmitra.ai/favicon.ico",
    prefill: {
      name: options.customerName || "Enterprise Customer",
      email: options.customerEmail || "billing@bizzmitra.ai",
      contact: options.customerPhone || "9876543210",
    },
    notes: {
      platform: "BizzMitra-AI SaaS",
      tier: options.planName,
      credits: options.creditsGranted,
      timestamp: new Date().toISOString(),
    },
    theme: {
      color: "#059669", // Emerald primary accent
      backdrop_color: "rgba(15, 23, 42, 0.75)",
    },
    modal: {
      confirm_close: true,
      ondismiss: () => {
        options.onDismiss?.();
      },
    },
    handler: (response: RazorpayPaymentSuccessResponse) => {
      options.onSuccess(response);
    },
  };

  try {
    const rzp = new window.Razorpay(razorpayOptions);
    rzp.open();
    return true;
  } catch (err) {
    console.error("Failed to initialize Razorpay checkout:", err);
    throw err;
  }
}
