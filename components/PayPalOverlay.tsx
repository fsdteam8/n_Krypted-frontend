"use client";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import PayPalCheckout from "./PayPalCheckout";

type Props = {
  open: boolean;
  onClose: () => void;
  amount: number;
  userId: string;
  bookingId: string;
};

export default function PayPalOverlay({
  open,
  onClose,
  amount,
  userId,
  bookingId,
}: Props) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    setHost(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  if (!open || !host) return null;

  // Fullscreen overlay, centered with flex (no transforms), internal scroll allowed
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md max-h-[100dvh] overflow-y-auto rounded-lg bg-white p-4">
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded hover:bg-black/5"
          >
            <X className="h-5 w-5" />
          </button>

          {/* PayPal inside a simple scrollable box (no transforms/locks) */}
          <div className="paypal-container">
            <PayPalCheckout
              amount={amount}
              userId={userId}
              bookingId={bookingId}
            />
          </div>
        </div>
      </div>
    </div>,
    host
  );
}
