"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User, Lock, Calendar, Bell, LogOut } from "lucide-react";
import PersonalInfoForm from "@/components/personal-info-form";
import BookingHistoryTable from "@/components/booking-history-table";
import NotifyMeList from "@/components/notify-me-list";
import { PageHeader } from "@/Shared/PageHeader";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import ProfileChangepassword from "@/components/profileChangepassword";
import { DialogOverlay } from "@radix-ui/react-dialog";
import Link from "next/link";

interface UserData {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  cityState?: string;
  roadArea?: string;
  avatar?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("personal-info");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session, update } = useSession();

  const userId = session?.user?.id;
  const accessToken = session?.user?.accessToken;

  // Fetch user data
  const fetchUserData = async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/single-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await res.json();
      setUserData(data.data || data.user || data);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId, accessToken]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Bitte laden Sie ein JPEG-, PNG- oder WebP-Bild hoch");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Das Profilbild muss kleiner als 2 MB sein.");
      return;
    }

    try {
      setIsUploading(true);
      if (!userId || !accessToken) {
        throw new Error("Invalid user session");
      }

      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("userId", userId);

      // Upload avatar
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      // Handle response
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        throw new Error(text.includes("<html") ? "Server error" : text);
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Profile update failed");
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          avatar: data.avatarUrl || data.imageUrl || data.url,
        },
      });

      // Refresh user data
      await fetchUserData();

      toast.success("Profilbild erfolgreich aktualisiert.");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // const handleLogout = async () => {
  //   try {
  //     await signOut({ callbackUrl: "/" });
  //     toast.success("Ausloggen erfolgreich.");
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //     toast.error("Logout failed");
  //   } finally {
  //     setShowLogoutDialog(false);
  //   }
  // };

  const avatar = userData?.avatar || "";
  const name = userData?.name || "N/A";
  const email = userData?.email || "N/A";

  return (
    <div>
      <PageHeader title="Mein Profil" imge="/assets/profile1.jpg" />
      <div className="flex flex-col md:flex-row min-h-screen text-white container pt-[80px]">
        {/* Sidebar */}
        <div className="w-full md:w-80 p-6 flex flex-col items-center md:sticky md:top-0 md:h-screen">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-2 group">
              <div
                className="relative w-full h-full rounded-full overflow-hidden cursor-pointer"
                onClick={handleImageClick}
              >
                <Image
                  src={avatar || "/placeholder.png"} // fallback if no avatar
                  alt=""
                  fill
                  className="object-cover scale-[102%]"
                  priority
                />

                {!avatar && ( // 👈 show overlay only if no avatar
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:opacity-100 transition-opacity">
                    <div className="text-[12px] text-center">
                      Profilbild hier hochladen <div>(max. 2 MB)</div>
                    </div>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                disabled={isUploading}
              />
            </div>
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-sm text-gray-400">{email}</p>
          </div>

          {/* Navigation */}
          <nav className="w-full space-y-2">
            <button
              onClick={() => setActiveTab("personal-info")}
              className={`flex items-center w-full p-3 rounded-md ${
                activeTab === "personal-info"
                  ? "bg-zinc-800"
                  : "hover:bg-zinc-800"
              }`}
            >
              <User className="mr-3 h-5 w-5" />
              <span>Persönliche Informationen</span>
            </button>
            <button
              onClick={() => setActiveTab("change-password")}
              className={`flex items-center w-full p-3 rounded-md ${
                activeTab === "change-password"
                  ? "bg-zinc-800"
                  : "hover:bg-zinc-800"
              }`}
            >
              <Lock className="mr-3 h-5 w-5" />
              <span>Passwort ändern </span>
            </button>
            <button
              onClick={() => setActiveTab("booking-history")}
              className={`flex items-center w-full p-3 rounded-md ${
                activeTab === "booking-history"
                  ? "bg-zinc-800"
                  : "hover:bg-zinc-800"
              }`}
            >
              <Calendar className="mr-3 h-5 w-5" />
              <span>Buchungshistorie </span>
            </button>
            <button
              onClick={() => setActiveTab("notify-me")}
              className={`flex items-center w-full p-3 rounded-md ${
                activeTab === "notify-me" ? "bg-zinc-800" : "hover:bg-zinc-800"
              }`}
            >
              <Bell className="mr-3 h-5 w-5" />
              <span>Benachrichtigungsliste</span>
            </button>
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center w-full p-3 text-red-500 hover:bg-zinc-800 rounded-md mt-auto"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Log out</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-10 container">
          {activeTab === "personal-info" && userData && (
            <PersonalInfoForm
              initialData={{
                name: userData.name || "",
                email: userData.email || "",
                phoneNumber: userData.phoneNumber || "",
                country: userData.country || "",
                cityState: userData.cityState || "",
                roadArea: userData.roadArea || "",
              }}
            />
          )}
          {activeTab === "change-password" && <ProfileChangepassword />}
          {activeTab === "booking-history" && <BookingHistoryTable />}
          {activeTab === "notify-me" && <NotifyMeList />}
        </div>
      </div>

      {/* Logout Dialog */}

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-md bg-[#212121] text-white border-none z-50 focus:outline-none p-5 rounded-lg w-[500px] backdrop-blur-lg">
          <div className="flex flex-col items-center justify-center py-4">
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
                      className="h-[37px] w-[95px]"
                    />
                  </div>
                  <h1
                    className="text-[32px] logo-size font-normal font-benedict text-white leading-[120%]
                 [text-shadow:_0_0_1px_#fff,_0_0_15px_#fff,_0_0_15px_#fff] mt-[7px]"
                  >
                    Walk Throughz
                  </h1>
                </div>
              </Link>
            </div>
            <DialogTitle className="text-[16px] font-normal text-center">
              Möchtest du dich wirklich abmelden?
            </DialogTitle>
            <div className="flex gap-4 mt-6 w-full">
              <button
                onClick={() => {
                  localStorage.clear();
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex-1 bg-white text-black border border-black hover:bg-black hover:text-white transition-colors duration-200 p-2 rounded-lg text-[14px]"
              >
                Ja
              </button>

              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 bg-black text-white border border-white hover:bg-white hover:text-black transition-colors duration-200 p-2 rounded-lg text-[14px]"
              >
                Nein
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
