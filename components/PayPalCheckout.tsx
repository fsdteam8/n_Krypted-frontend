// src/components/PayPalCheckout.tsx
import { useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface PayPalCheckoutProps {
  amount: number;
  userId: string;
  bookingId: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line
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

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        },
        // eslint-disable-next-line
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                },
              },
            ],
            application_context: {
              shipping_preference: "NO_SHIPPING",
              billing_preference: "NO_BILLING",
            },
          });
        },

        // eslint-disable-next-line
        onApprove: async (data: any) => {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/paypal/capture-order`,
            {
              orderId: data.orderID,
              userId,
              bookingId,
            }
          );
          router.push("/success");
          console.log(res.data);
        },
        // eslint-disable-next-line
        onError: (err: any) => {
          console.error("PayPal Checkout Error:", err);
          alert("Something went wrong during the payment.");
        },
      })
      .render(paypalRef.current);
  }, [amount, userId, bookingId, router]);

  return <div ref={paypalRef}></div>;
};

export default PayPalCheckout;
