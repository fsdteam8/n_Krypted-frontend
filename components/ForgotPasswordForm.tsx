"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setOpenDialog(true);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Reset konnte nicht gesendet werden");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        // match SignInForm styles: dark card bg, rounded, padding
        className="space-y-4 bg-[#373737] px-[24px] py-[32px] rounded-lg max-w-lg mx-auto"
      >
        <div className="text-center space-y-1">
          <h1 className="text-white text-[26px] lg:text-[32px] font-semibold leading-[120%]">
            Link anfordern
          </h1>
          <p className="text-[#BABABA] text-[14px] lg:text-[16px]">
            Gib deine E-Mail ein, um den Link zum Zurücksetzen deines Passworts
            zu erhalten.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            E-Mail
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Gib deine E-Mail ein"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-gray-200"
          disabled={isLoading}
        >
          {isLoading ? "Link wird verschickt..." : "Passwort zurücksetzen"}
        </Button>
      </form>

      {/* Success Dialog - matched to card styling */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg bg-[#373737] border border-gray-600 text-white rounded-xl shadow-xl">
          <DialogHeader className="flex flex-col items-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#212121] mb-4 border border-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-500"
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
            <DialogTitle className="text-xl font-semibold text-white">
              Überprüfe deine E-Mails
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              Wir haben einen Link zum Zurücksetzen des Passworts an{" "}
              <span className="font-semibold text-white">{email}</span>{" "}
              gesendet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={() => {
                setOpenDialog(false);
                router.push("/login");
              }}
              className="bg-white text-black hover:bg-gray-200"
            >
              Zum Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
