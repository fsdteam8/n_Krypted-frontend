import Image from "next/image";
import { VerifyOtpForm } from "@/components/VerifyOtpForm";

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gray-900 lg:block">
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="absolute inset-0">
            <Image
              src="/assets/OTP-Attachment.jpg"
              alt="Background"
              fill
              className="object-cover object-right-top opacity-50"
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
            <h2 className="mb-2 text-4xl font-bold">Passwort verlegt? </h2>
            <p className="max-w-md text-gray-300">
              Wir setzen dein Passwort sofort zurück, damit du ruckzuck wieder
              in deinem Portal bist.
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-[#121212] lg:w-1/2">
        <div className="w-full max-w-md space-y-8  p-8 text-white">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Verify OTP</h1>
            <p className="text-gray-400">
              Bitte gib den Bestätigungscode ein, den wir dir per E-Mail
              gesendet haben.
              
            </p>
            <p>Wir haben dir einen 6-stelligen Code an xxxx geschickt. Trage ihn
              hier ein, um deine E-Mail zu verifizieren.</p>
          </div>
          <VerifyOtpForm />
        </div>
      </div>
    </div>
  );
}
