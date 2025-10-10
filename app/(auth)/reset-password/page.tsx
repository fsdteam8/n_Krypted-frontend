import Image from "next/image";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { Suspense } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left side with image */}
      <div className="hidden w-1/2 lg:block relative">
        <Image
          src="/assets/new-pass.jpg"
          alt="Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <Link href="/">
            <div className="mb-6 rounded-full bg-black/70 p-4 border border-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-white"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </Link>
          <h2 className="mb-3 text-4xl font-bold text-white">Zurück im Grid</h2>
          <p className="max-w-md text-gray-300">
            Ein neues Passwort bringt dich zurück ins Grid – mitten rein, um
            wieder hinter die Kulissen unserer Stadtwelten zu treten.
          </p>
        </div>
      </div>

      {/* Right side with form */}
      <div className="flex w-full items-center justify-center bg-[#212121] lg:w-1/2 flex-col ">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-[#212121] p-8 shadow-lg ">
          <div className="text-center space-y-2">
            <h1 className="text-[26px] lg:text-[32px] font-semibold leading-[120%] text-white">
              Passwort zurücksetzen
            </h1>
            <p className="text-gray-300 text-[14px] lg:text-[16px]">
              Bitte leg dein neues Passwort fest.
            </p>
          </div>
          <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
