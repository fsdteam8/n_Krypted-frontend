"use client";

import type React from "react";
import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Menu, Settings, LogOut, CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession, signOut } from "next-auth/react";
import "../../app/globals.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const user = session?.user;

  const handleSignOut = async () => {
    localStorage.clear();
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            size="icon"
            className="absolute top-3 left-3 z-50 bg-inherit"
          >
            <Menu className="h-6 w-6 text-white " />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[108px]">
          <AppSidebar isMobile />
        </SheetContent>
      </Sheet>

      <SidebarInset className="bg-gray-100 w-full flex flex-col h-screen">
        <header className="flex h-16 items-center justify-end lg:justify-between border-b bg-[#212121] py-12">
          {/* <div className="md:hidden w-6"></div> 
          <div className="hidden md:block"></div> */}
          {/* Logo */}
          <div className="ml-[-50px] hidden lg:block">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="text-center">
                <div className="flex justify-center">
                  <Image src="/assets/logoheader.png" alt="Logo" width={100} height={100} className="h-[30px] w-[80px]" />
                </div>
                <h1 className="font-benedict font-normal text-[25px] leading-[120%] tracking-[0] text-white drop-shadow-[0_0_5px_white]">
                  Walk Throughz
                </h1>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {user?.name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative h-8 w-8 rounded-full flex items-center justify-center bg-[#212121]"
                  >
                    <CircleUserRound  className="text-white w-[30px] h-[30px] !hover:text-black" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </div>
  );
}
