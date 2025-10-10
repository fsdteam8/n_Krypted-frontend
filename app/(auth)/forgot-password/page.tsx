import Image from "next/image";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { Suspense } from "react";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gray-900 lg:block">
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="absolute inset-0">
            <Image
              src="/assets/forgot-password.jpg"
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
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 className="mb-2 text-4xl font-bold">Passwort verlegt?</h2>
            <div className="max-w-md text-gray-300">
              Wir setzen dein Passwort sofort zurück,
              <div>damit du ruckzuck wieder in deinem Portal bist.</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-[#212121] lg:w-1/2">
        <div className="w-full max-w-lg space-y-8 p-8 text-white">
          <div className="text-center">
            <div>
              {/* <div className=" scale-[120%]">
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
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
