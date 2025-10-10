// app/layout.tsx
import { Poppins } from "next/font/google";
import "./globals.css";
import AppProvider from "@/Provider/AppProvider";
import LayoutShell from "./layout-shell";
import { SocketProvider } from "@/Provider/SocketProvider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import StripeProvider from "@/components/pyment/StripeProvider";
import ScrollToTop from "@/hooks/scrolltotop";

// Load Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Walk Throughz",
  description:
    "Entdecke, was deine Stadt wirklich ausmacht – mit Walk Throughz erlebst du sie neu: durch kurze, persönliche Einblicke direkt von den Menschen, die sie gestalten.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Walk Throughz",
    description:
      "Erlebe deine Stadt neu – durch authentische Einblicke von den Menschen, die sie gestalten. In kleinen Gruppen entdeckst du neue Perspektiven, spannende Themen und triffst Gleichgesinnte.",
    url: "https://walkthroughz.com",
    siteName: "Walk Throughz",
    images: [
      {
        url: "https://res.cloudinary.com/dftvlksve/image/upload/v1756129458/Image20250819174530_hjqear.jpg",
        width: 1200,
        height: 630,
        alt: "Walk Throughz Vorschau",
      },
    ],
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Walk Throughz",
    description:
      "Entdecke neue Perspektiven und erlebe deine Stadt neu – mit Walk Throughz.",
    images: [
      "https://res.cloudinary.com/dftvlksve/image/upload/v1756129458/Image20250819174530_hjqear.jpg",
    ],
    creator: "@walkthroughz",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  return (
    <html lang="en" className="hyphens-auto">
      <body
        className={`${poppins.variable} font-poppins antialiased bg-[#212121]`}
      >
        {/* PayPal SDK */}
        {paypalClientId && (
          <Script
            src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR&intent=capture&disable-funding=paylater,venmo`}
            data-sdk-integration-source="button-factory"
            strategy="afterInteractive"
          />
        )}

        <AppProvider>
          <SocketProvider>
            <Toaster position="top-right" />
            <ScrollToTop />
            <LayoutShell>
              <StripeProvider>{children}</StripeProvider>
            </LayoutShell>
          </SocketProvider>
        </AppProvider>
      </body>
    </html>
  );
}
