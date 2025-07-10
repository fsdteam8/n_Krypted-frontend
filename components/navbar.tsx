"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile-nav";
import { BellRing, Menu, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSocketContext } from "@/Provider/SocketProvider";
import * as React from "react";
import Hideon from "@/Provider/Hideon";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Über uns", href: "/about-us" },
  { name: "Deals", href: "/deals" },

  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" },
  { name: "Kontakt", href: "/contact" },
];

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const isMobile = useMobile();
  const pathname = usePathname();
  const { status, data: sessionData } = useSession();
  const isLoggedIn = status === "authenticated";
  const token = sessionData?.user?.accessToken;
  const role = sessionData?.user?.role;

  const session = useSession();
  const userId = session?.data?.user?.id;

  const { notificationCount, setNotificationCount, isConnected } =
    useSocketContext();

  const markNotificationsAsRead = async () => {
    if (!token) return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all?userId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem("notificationCount");
      setNotificationCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const iconLinks = [
    { icon: BellRing, href: "/notifications", count: notificationCount },
    { icon: UserRound, href: "/profiles" },
  ];

  const getIconClasses = (href: string) => `
    relative border-2 rounded-full p-2 transition-colors
    ${
      pathname.startsWith(href)
        ? "border-[#E6C475]"
        : "border-[#D1D1D1] hover:border-[#E4C072] hover:bg-[#E4C072]"
    }
  `;
  const getIconColor = (href: string) =>
    pathname.startsWith(href) ? "text-[#E6C475]" : "text-white";
  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  const HIDDEN_ROUTES = [
    "/dashboard",
    "/login",
    "/sign-up",
    "/verify-otp",
    "/registration",
    "/reset-password",
    "/forgot-password",
  ];

  return (
    <Hideon routes={HIDDEN_ROUTES}>
      <header className="sticky top-0 z-50 w-full h-[100px] bg-[#212121] flex justify-center  flex-col">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <div>
            <Link href="/" className="">
              <div className="py-1">
                <div className="flex justify-center">
                  <Image
                    src="/assets/logo-icon.png"
                    alt="Logo"
                    width={1000}
                    height={1000}
                    className="h-[30px] w-[80px]"
                  />
                </div>
                <h1
                  className="text-[32px] font-normal font-benedict text-white leading-[120%]
                 [text-shadow:_0_0_1px_#fff,_0_0_15px_#fff,_0_0_15px_#fff] mt-[4px]"
                >
                  Walk Throughz
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          {!isMobile && (
            <nav className="hidden md:flex md:gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[16px] font-medium text-white transition-colors relative ${
                    isActive(link.href)
                      ? "text-[#E4C072] after:content-[''] after:absolute after:left-0 after:bottom-[-5px] after:w-full after:h-[2px] after:bg-[#FFFFFF]"
                      : "after:content-[''] after:absolute after:left-1/2 after:bottom-[-5px] after:w-0 after:h-[2px] after:bg-[#FFFFFF] hover:after:w-full hover:after:left-0"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {!isLoggedIn && (
              <Link href="/login" className="hidden md:block">
                <Button
                  variant="default"
                  className="px-6 hidden lg:block bg-white text-[#212121]"
                >
                  Login
                </Button>
              </Link>
            )}

            {role === "admin" && (
              <Link href="/dashboard">
                <Button
                  variant="default"
                  className="px-6 hidden lg:block bg-white text-[#212121]"
                >
                  Dashboard
                </Button>
              </Link>
            )}

            {isLoggedIn && role === "user" && (
              <div className="hidden md:flex items-center gap-2 sm:gap-4">
                {iconLinks.map(({ icon: Icon, href }) =>
                  href === "/notifications" ? (
                    <button
                      key={href}
                      onClick={async (e) => {
                        e.preventDefault();
                        await markNotificationsAsRead();
                        router.push(href);
                      }}
                      className={getIconClasses(href)}
                      title={`${
                        isConnected ? "Connected" : "Disconnected"
                      } - ${notificationCount} notifications`}
                    >
                      <Icon className={getIconColor(href)} size={20} />
                      {notificationCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      key={href}
                      href={href}
                      className={getIconClasses(href)}
                    >
                      <Icon className={getIconColor(href)} size={20} />
                    </Link>
                  )
                )}
              </div>
            )}

            {/* Mobile Nav */}
            {isMobile && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5 text-white" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[280px] sm:w-[300px] bg-[#f5f0e8]"
                >
                  <nav className="flex flex-col gap-4 pt-10">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`text-base font-medium transition-colors ${
                          isActive(link.href)
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}

                    {!isLoggedIn ? (
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className="text-base font-medium transition-colors text-muted-foreground hover:text-foreground"
                      >
                        Login
                      </Link>
                    ) : (
                      <>
                        {role === "admin" && (
                          <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className="text-base font-medium transition-colors text-muted-foreground hover:text-foreground"
                          >
                            Dashboard
                          </Link>
                        )}
                        {role === "user" && (
                          <>
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                await markNotificationsAsRead();
                                router.push("/notifications");
                                setOpen(false);
                              }}
                              className={`relative text-base font-medium transition-colors text-start ${
                                isActive("/notifications")
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Notifications {!isConnected && "(Offline)"}
                              {notificationCount > 0 && (
                                <span className="ml-2 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                                  {notificationCount}
                                </span>
                              )}
                            </button>
                            <Link
                              href="/profiles"
                              onClick={() => setOpen(false)}
                              className={`text-base font-medium transition-colors ${
                                isActive("/profiles")
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              My Account
                            </Link>
                          </>
                        )}
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>
    </Hideon>
  );
}
