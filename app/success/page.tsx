import type { FC } from "react";
import Link from "next/link";

const PaymentSuccessPage: FC = () => {
  return (
    <div className="h-[70vh] lg:h-[60vh] flex items-center justify-center bg-[#212121] ">
      <div className="max-w-md mx-auto p-6 rounded-lg shadow-md border-2 border-gray-300">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#212121] mb-4 border-2 border-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            Zahlung erfolgreich!
          </h1>
          <p className="text-gray-300 mb-6">
            Vielen Dank für Ihre Zahlung. Ihre Transaktion wurde erfolgreich
            abgeschlossen.
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-block bg-white text-gray-900 px-6 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
            >
              Zurück zu Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
