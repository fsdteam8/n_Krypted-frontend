"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { CustomOtpInput } from "./custom-otp-input"

export function VerifyEmailForm() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [canResend, setCanResend] = useState(true)
  const [resendTimer, setResendTimer] = useState(30)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = decodeURIComponent(searchParams.get("email") || "")
  const hasAutoVerified = useRef(false) // Prevent auto verify loop

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: async () => {
      const otpValue = otp.join("").toLowerCase()

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email,
          code: otpValue
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Überprüfung fehlgeschlagen")
      }

      return await response.json()
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message || "Überprüfung fehlgeschlagen")
        return
      }
      toast.success("E-Mail erfolgreich verifiziert!")
      router.push("/login")
    },
    onError: (error) => {
      console.error("Verification error:", error)
      toast.error(error.message || "Ungültiger Bestätigungscode")
    }
  })

  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationKey: ["resend-otp"],
    mutationFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error("Failed to resend verification code")
      }
      return await response.json()
    },
    onSuccess: () => {
      toast.success("New verification code sent!")
      setOtp(Array(6).fill(""))
      setCanResend(false)
      startResendTimer()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to resend code. Please try again.")
    }
  })

  const startResendTimer = () => {
    setResendTimer(30)
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 30
        }
        return prev - 1
      })
    }, 1000)
  }

  // Auto-trigger verify once all 6 digits are filled
  useEffect(() => {
    const joined = otp.join("")
    if (joined.length === 6 && !hasAutoVerified.current) {
      hasAutoVerified.current = true
      verifyOtp()
    } else if (joined.length < 6) {
      hasAutoVerified.current = false
    }
  }, [otp, verifyOtp])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits")
      return
    }
    verifyOtp()
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Verify Your Email</h2>
      <p className="text-center mb-6">
        Enter the 6-digit code sent to <span className="font-semibold">{email}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CustomOtpInput 
          value={otp}
          onChange={setOtp}
          disabled={isVerifying || isResending}
          numericOnly={false}
          className="justify-center"
          inputClassName="text-gray-900 border-gray-300 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isVerifying || isResending}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <div className="mt-6 flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="text-blue-600 hover:underline text-sm"
        >
          Back to Register
        </button>
        <button
          type="button"
          onClick={() => resendOtp()}
          disabled={!canResend || isResending}
          className="text-blue-600 hover:underline text-sm disabled:opacity-50"
        >
          {isResending ? "Sending..." : canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
        </button>
      </div>
    </div>
  )
}
