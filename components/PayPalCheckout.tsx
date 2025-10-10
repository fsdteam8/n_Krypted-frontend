// src/components/PayPalCheckout.tsx
import { useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// helpers/scroll.ts
export function unlockPageScroll() {
  const html = document.documentElement;
  const body = document.body;
  html.style.overflowY = "auto";
  body.style.overflowY = "auto";
}

interface PayPalCheckoutProps {
  amount: number;
  userId: string;
  bookingId: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal: any;
  }
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  userId,
  bookingId,
}) => {
  const paypalRef = useRef<HTMLDivElement | null>(null);
  const isRendered = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!window.paypal || !paypalRef.current || isRendered.current) return;
    isRendered.current = true;

    // Ensure page scroll isn’t locked by your app’s modal logic
    unlockPageScroll();

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createOrder: (_: any, actions: any) =>
          actions.order.create({
            purchase_units: [{ amount: { value: amount.toFixed(2) } }],
            application_context: {
              shipping_preference: "NO_SHIPPING",
              // (billing_preference isn't required for Smart Buttons card form)
            },
          }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onApprove: async (data: any) => {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/paypal/capture-order`,
            { orderId: data.orderID, userId, bookingId }
          );
          router.push("/success");
          console.log(res.data);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
          console.error("PayPal Checkout Error:", err);
          alert("Something went wrong during the payment.");
        },
      })
      .render(paypalRef.current);
  }, [amount, userId, bookingId, router]);

  return <div ref={paypalRef} className="paypal-container" />;
};

export default PayPalCheckout;
