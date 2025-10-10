import Image from "next/image";
import { VerifyEmailForm } from "@/components/VerifyEmailForm";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gray-900 lg:block">
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="absolute inset-0">
            <Image
              src="/assets/OTP.jpg"
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
            <h2 className="mb-2 text-4xl font-bold">E-Mail bestätigen</h2>
            <div className="max-w-md text-gray-300">
              Wir haben dir soeben einen 6-stelligen Code an deine E-Mail
              gesendet. Gib den Code im Feld rechts ein.
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-[#212121] lg:w-1/2">
        <div className="w-full max-w-lg space-y-8  p-8 text-white">
          <div className="text-center">
            {/* <div className="py-1 scale-[125%]">
              <div className="flex justify-center">
                <Image
                  src="/assets/logo-icon.png"
                  alt="Logo"
                  width={1000}
                  height={1000}
                  className="h-[30px] w-[80px] lg:h-[37px] lg:w-[95px]"
                />
              </div>
              <h1
                className="text-[32px] logo-size font-normal font-benedict text-white leading-[120%]
                             [text-shadow:_0_0_1px_#fff,_0_0_15px_#fff,_0_0_15px_#fff] mt-[7px]"
              >
                Walk Throughz
              </h1>
            </div> */}
          </div>
          <Suspense fallback={<div>Laden...</div>}>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
