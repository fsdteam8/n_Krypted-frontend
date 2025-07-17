import { Poppins } from "next/font/google";
import "./globals.css";
import AppProvider from "@/Provider/AppProvider";
import LayoutShell from "./layout-shell";
import { SocketProvider } from "@/Provider/SocketProvider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script"; // Import Script
import StripeProvider from "@/components/pyment/StripeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Walk Throughz",
  icons: {
    icon: "/assets/fav.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-poppins antialiased bg-[#212121]`}
      >
        {/* PayPal Script */}
        <Script
          src="https://www.paypal.com/sdk/js?client-id=AQVRQXDgaNdjkF0O9tzO5tCpNx6v9Cfg-Sy3Uo2apdzthiszyzuVpyR_DXbeYKWezuqxEiA2z9cvZnWC&currency=USD&intent=capture&disable-funding=paylater,venmo"
          data-sdk-integration-source="button-factory"
          strategy="afterInteractive"
        />

        <AppProvider>
          <SocketProvider>
            <Toaster position="top-right" />
            <LayoutShell>
              <StripeProvider>
              {children}
              </StripeProvider>
              </LayoutShell>
          </SocketProvider>
        </AppProvider>
      </body>
    </html>
  );
}
