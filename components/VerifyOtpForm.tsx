"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { verifyOTP, forgotPassword } from "@/app/actions/auth"
import { CustomOtpInput } from "./custom-otp-input"
import { toast } from "sonner"

export function VerifyOtpForm() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const otpString = otp.join("")
    if (otpString.length !== 6) {
      toast.error("Bitte geben Sie alle 6 Ziffern ein")
      return
    }

    setIsLoading(true)
    const email = sessionStorage.getItem("resetEmail")

    if (!email) {
      toast.error("E-Mail nicht gefunden. Bitte gehen Sie zurück zur Seite „Passwort vergessen“.")
      router.push("/forgot-password")
      return
    }

    try {
      const result = await verifyOTP(email, otpString)

      if (result.success) {
        toast.success("OTP erfolgreich verifiziert")

        // Store verification token if provided
        const token = (result.data as { token?: string })?.token
        if (token) {
          sessionStorage.setItem("resetToken", token)
        }

        router.push("/reset-password")
      } else {
        toast.error(result.message || "OTP konnte nicht verifiziert werden")
      }
    } catch {
      toast.error("OTP konnte nicht verifiziert werden")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    const email = sessionStorage.getItem("resetEmail")

    if (!email) {
      toast.error("Email not found. Please go back to the forgot password page.")
      return
    }

    try {
      const result = await forgotPassword(email)

      if (result.success) {
        toast.success("Bestätigungscode erfolgreich gesendet")
      } else {
        toast.error(result.message || "Der Bestätigungscode konnte nicht gesendet werden.")
      }
    } catch {
      toast.error("Der Bestätigungscode konnte nicht gesendet werden.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CustomOtpInput value={otp} onChange={setOtp} disabled={isLoading} />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleResendOtp}
          className="text-sm text-blue-500 hover:text-blue-400"
          disabled={isLoading}
        >
          Didn&apos;t Receive Code?
        </button>
        <button
          type="button"
          onClick={handleResendOtp}
          className="text-sm text-blue-500 hover:text-blue-400"
          disabled={isLoading}
        >
          RESEND CODE
        </button>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-white py-2 font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Verifying..." : "Verify"}
      </button>
    </form>
  )
}
