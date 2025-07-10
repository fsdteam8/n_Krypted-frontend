import Image from "next/image"
import { VerifyEmailForm } from "@/components/VerifyEmailForm"
import { Suspense } from "react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gray-900 lg:block">
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="absolute inset-0">
            <Image
              src="/assets/auth.jpg"
              alt="Background"
              fill
              className="object-cover opacity-50"
              priority
            />
          </div>
          <div className="z-10 flex flex-col items-center justify-center text-center text-white">
            <div className="mb-4 rounded-full bg-gray-800/70 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
              >
                <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-7.5"></path>
                <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"></path>
              </svg>
            </div>
            <h2 className="mb-2 text-4xl font-bold">Verify your email</h2>
            <p className="max-w-md text-gray-300">Please enter the verification code sent to your email</p>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-[#212121] lg:w-1/2">
        <div className="w-full max-w-md space-y-8  p-8 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Verify OTP</h1>
            <p className="text-gray-400">
              An OTP has been sent to your email
              <br />
              Please verify it below
            </p>
          </div>
          <Suspense fallback={<div>Loading...</div>}><VerifyEmailForm /></Suspense>
        </div>
      </div>
    </div>
  )
}
