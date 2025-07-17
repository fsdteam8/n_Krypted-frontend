"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User, Lock, Calendar, Bell, LogOut, Edit } from "lucide-react";
import PersonalInfoForm from "@/components/personal-info-form";
import BookingHistoryTable from "@/components/booking-history-table";
import NotifyMeList from "@/components/notify-me-list";
import { PageHeader } from "@/Shared/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import ProfileChangepassword from "@/components/profileChangepassword";

interface UserData {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  cityState?: string;
  roadArea?: string;
  avatar?: string;
  // Add any other fields you expect from the API
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

  // Fetch user from the API using session user ID
  useEffect(() => {
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
        setUserData(data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      }
    };

    fetchUserData();
  }, [userId, accessToken]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Bitte laden Sie ein JPEG-, PNG- oder WebP-Bild hoch");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Die Bildgröße sollte weniger als 2 MB betragen");
      return;
    }

    try {
      setIsUploading(true);
      const accessToken = session?.user?.accessToken;
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error("Benutzersitzung ist ungültig – fehlende ID");
      }

      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("userId", userId); // Add user ID to the form data

      // First request - upload the avatar
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

      // Check response content type
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          text.includes("<html")
            ? "Server error"
            : `Unexpected response: ${text.slice(0, 100)}`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Profile update failed");
      }

      // Update session with new avatar
      await update({
        ...session,
        user: {
          ...session?.user,
          avatar: data.avatarUrl || data.imageUrl || data.url,
        },
      });

      // Second request - fetch updated user data
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/single-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch updated profile");
      }

      const userData = await userResponse.json();
      setUserData(userData.user || userData); // Adjust based on your API response structure

      toast.success("Profilbild erfolgreich aktualisiert");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during upload"
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
      toast.success("Erfolgreich abgemeldet");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Abmeldung fehlgeschlagen");
    } finally {
      setShowLogoutDialog(false);
    }
  };

  const avatar = userData?.avatar || "/assets/default-avatar.png";
  const name = userData?.name || "N/A";
  const email = userData?.email || "N/A";

  return (
    <div>
      <PageHeader title="My Profile" imge="/assets/herobg.png" />
      <div className="flex flex-col md:flex-row min-h-screen text-white container pt-[80px]">
        <div className="w-full md:w-80 p-6 flex flex-col items-center md:sticky md:top-0 md:h-screen">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-2 group">
              <div
                className="relative w-full h-full rounded-full overflow-hidden cursor-pointer"
                onClick={handleImageClick}
              >
                <Image
                  src={avatar}
                  alt="Profile"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="h-6 w-6 text-white" />
                </div>
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
              <span>Kennwort ändern</span>
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
              <span>Buchungsverlauf</span>
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
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <div className="text-center text-xl font-semibold">
                Walk Through
              </div>
            </div>
            <DialogTitle className="text-center">
              Möchten Sie sich wirklich abmelden?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-center gap-4 sm:justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="w-full sm:w-24 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
            >
              No
            </Button>
            <Button
              onClick={handleLogout}
              className="w-full sm:w-24 bg-zinc-800 hover:bg-zinc-700 text-white"
              disabled={isUploading}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
