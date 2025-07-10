"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SessionProvider } from "next-auth/react";
import { CategoriesAndSearchBar } from "@/components/categoriesAndSearchBer";
import { Suspense } from "react";
// import { CategoriesAndSearchBar } from "@/components/categoriesAndSearchBer";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hiddenPaths = [
    "/dashboard",
    "/seller-dashboard",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
    "/login",
    "/sign-up",
  ];

  const shouldHideLayout = hiddenPaths.some((path) =>
    pathname.startsWith(path)
  );

  return (
    <SessionProvider>
      {!shouldHideLayout && <Navbar />}
      <Suspense fallback={<div>Loading...</div>}>
        <CategoriesAndSearchBar />
      </Suspense>
      {children}
      {!shouldHideLayout && <Footer />}
    </SessionProvider>
  );
}
