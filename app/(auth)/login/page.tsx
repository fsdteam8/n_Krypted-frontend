import { SignInForm } from "@/components/ui/LoginFrom";
import Image from "next/image";
import { Suspense } from "react";

export default function SignInPage() {
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
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h2 className="mb-2 text-4xl font-bold">
              Schön, dass du wieder da bist
            </h2>
            <p className="max-w-md text-gray-300">
              Bereit für deinen nächsten Walk Through? Es warten neue Locations
              und überraschende Einblicke auf dich.
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-[#212121] lg:w-1/2">
        <div className="w-full max-w-md space-y-8 rounded-lg p-8 text-white">
          <div className="text-center">
            <h1 className="text-[26px] lg:text-[32px] font-semibold leading-[120%]">
              Willkommen zurück
            </h1>
            <p className="text-white text-[14px] lg:text-[16px] font-normal">
              Bitte gib deine Zugangsdaten ein, um fortzufahren.
            </p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
