"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CustomOtpInput } from "./custom-otp-input";

export function VerifyEmailForm() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(30);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = decodeURIComponent(searchParams.get("email") || "");
  const hasAutoVerified = useRef(false); // Prevent auto verify loop

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: async () => {
      const otpValue = otp.join("").toLowerCase();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            code: otpValue,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Überprüfung fehlgeschlagen");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message || "Überprüfung fehlgeschlagen");
        return;
      }
      toast.success("E-Mail erfolgreich verifiziert!");
      router.push("/login");
    },
    onError: () => {
      toast.error("Ungültiger Bestätigungscode");
    },
  });

  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationKey: ["resend-otp"],
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Der Bestätigungscode konnte nicht erneut gesendet werden."
        );
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Neuer Bestätigungscode gesendet!");
      setOtp(Array(6).fill(""));
      setCanResend(false);
      startResendTimer();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(
        error.message ||
          "Der Code konnte nicht erneut gesendet werden. Bitte versuche es erneut."
      );
    },
  });

  const startResendTimer = () => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Auto-trigger verify once all 6 digits are filled
  useEffect(() => {
    const joined = otp.join("");
    if (joined.length === 6 && !hasAutoVerified.current) {
      hasAutoVerified.current = true;
      verifyOtp();
    } else if (joined.length < 6) {
      hasAutoVerified.current = false;
    }
  }, [otp, verifyOtp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Bitte gib alle 6 Ziffern ein");
      return;
    }
    verifyOtp();
  };

  return (
    <div className="max-w-xl mx-auto bg-[#373737] px-[16px] py-[32px] rounded-lg shadow-md">
      <h2 className="text-white text-[26px] lg:text-[32px] font-semibold leading-[120%] text-center mb-2">
        Code eingeben
      </h2>
      <p className="text-[#BABABA] text-center mb-6">
        Gib den 6-stelligen Code ein, den wir an{" "}
        <span className="font-semibold text-white">{email}</span> verschickt
        haben.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CustomOtpInput
          value={otp}
          onChange={setOtp}
          disabled={isVerifying || isResending}
          numericOnly={false}
          className="justify-center gap-2"
          inputClassName="h-12 w-12 text-center text-white bg-[#4b4b4b] border border-gray-600 rounded-md focus:outline-none focus:ring-0 focus:border-gray-400 placeholder:text-gray-400"
        />

        <button
          type="submit"
          disabled={isVerifying || isResending}
          className="w-full py-3 bg-white text-black rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors font-medium"
        >
          {isVerifying ? "Wird verifiziert..." : "E-Mail bestätigen"}
        </button>
      </form>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => resendOtp()}
          disabled={!canResend || isResending}
          className="text-white hover:text-blue-400 text-sm disabled:opacity-50"
        >
          {isResending
            ? "Wird gesendet..."
            : canResend
            ? "Code erneut anfordern"
            : `Wird gesendet in ${resendTimer} Sekunden`}
        </button>
      </div>
    </div>
  );
}
