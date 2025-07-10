"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Gavel,
  Users,
  User,
  FileText,
  Settings,
  LogOut,
  House,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  // SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";
// import { useSession } from "next-auth/react";
import LogOutModal from "@/Shared/LogOutModal";
import { signOut } from "next-auth/react";

interface AppSidebarProps {
  isMobile?: boolean;
}

export function AppSidebar({ }: AppSidebarProps) {
  const pathname = usePathname();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  // const session = useSession();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };


  const isActive = (path: string) => pathname === path;

  return (
    <>
      <Sidebar className="border-r-0 w-[108px]" collapsible="none">
        <SidebarContent className="p-4 bg-[#212121]">
          <SidebarMenu className="space-y-2 pt-[100px]">
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/dashboard")}
                  className="group py-8 flex justify-center hover:bg-[#ffffff] data-[active=true]:bg-[#ffffff]"
                >
                  <Link href="/dashboard" className="flex flex-col items-center">
                    <LayoutDashboard className={`h-5 w-5 ${isActive("/dashboard") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`} />
                    <span className={`text-[12px] font-medium ${isActive("/dashboard") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`}>
                      Dashboard
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/dashboard/categories")}
                  className="group py-8 flex justify-center hover:bg-[#ffffff] data-[active=true]:bg-[#ffffff]"
                >
                  <Link href="/dashboard/categories" className="flex flex-col items-center">
                    <Layers className={`h-5 w-5 ${isActive("/dashboard/categories") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`} />
                    <span className={`text-[12px] font-medium ${isActive("/dashboard/categories") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`}>
                      Categories
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/dashboard/deals")}
                  className="group py-8 flex justify-center hover:bg-[#ffffff] data-[active=true]:bg-[#ffffff]"
                >
                  <Link href="/dashboard/deals" className="flex flex-col items-center">

                    <Gavel className={`h-5 w-5 ${isActive("/dashboard/deals") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`} />
                    <span className={`text-[12px] font-medium ${isActive("/dashboard/deals") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`}>

                      Deals
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/dashboard/bidders")}
                  className="group py-8 flex justify-center hover:bg-[#ffffff] data-[active=true]:bg-[#ffffff]"
                >
                  <Link href="/dashboard/booking" className="flex flex-col items-center">
                    <Users className={`h-5 w-5 ${isActive("/dashboard/bidders") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`} />
                    <span className={`text-[12px] font-medium ${isActive("/dashboard/bidders") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`}>
                      Booking
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/dashboard/blogs")}
                  className="group py-8 flex justify-center hover:bg-[#ffffff] data-[active=true]:bg-[#ffffff]"
                >
                  <Link href="/dashboard/blogs" className="flex flex-col items-center">
                    <FileText className={`h-5 w-5 ${isActive("/dashboard/blogs") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`} />
                    <span className={`text-[12px] font-medium ${isActive("/dashboard/blogs") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`}>
                      Blogs
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/dashboard/seller")}
                  className="group py-8 flex justify-center hover:bg-[#ffffff] data-[active=true]:bg-[#ffffff]"
                >
                  <Link href="/dashboard/notify" className="flex flex-col items-center">
                    <User className={`h-5 w-5 ${isActive("/dashboard/seller") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`} />
                    <span className={`text-[12px] font-medium ${isActive("/dashboard/seller") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`}>
                      Notify Me
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/dashboard/settings")}
                  className="group py-8 flex justify-center hover:bg-[#ffffff] data-[active=true]:bg-[#ffffff]"
                >
                  <Link href="/dashboard/settings" className="flex flex-col items-center">
                    <Settings className={`h-5 w-5 ${pathname.startsWith("/dashboard/settings") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`} />
                    <span className={`text-[12px] font-medium ${pathname.startsWith("/dashboard/settings") ? "text-[#212121]" : "text-[#ffffff] group-hover:text-[#212121]"}`}>
                      Settings
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div
                  className="group py-8 flex justify-center"
                >
                  <Link href="/" className="flex flex-col items-center">
                    <House className="h-5 w-5 text-[#ffffff]"/>
                    <span className={`text-[12px] font-medium text-[#ffffff] group-hover:text-[#212121]"}`}>
                      Home
                    </span>
                  </Link>
                </div>
              </SidebarMenuItem>
            </>
          </SidebarMenu>
        </SidebarContent>

        <div className="mt-auto p-4 bg-[#212121] border-t border-[#5c5343]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setIsLogoutDialogOpen(true)}
                className="group py-8 flex justify-center hover:bg-[#ffffff]"
              >
                <div className="flex flex-col items-center">
                  <LogOut className="h-5 w-5 text-[#ffffff] group-hover:text-[#212121]" />
                  <span className="text-[12px] font-medium text-[#ffffff] group-hover:text-[#212121]">Logout</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </Sidebar>

      <LogOutModal isLogoutDialogOpen={isLogoutDialogOpen} setIsLogoutDialogOpen={setIsLogoutDialogOpen} onConfirmLogout={handleLogout} />
    </>
  );
}
