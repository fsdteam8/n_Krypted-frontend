// import React from "react";

// const page = () => {
//   return <div>page</div>;
// };

// export default page;
import type { FC } from "react"
import Link from "next/link"

const PaymentSuccessPage: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md ">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
