"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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
        toast.success("OTP erfolgreich gesendet");
        setEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("OTP konnte nicht gesendet werden");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6 bg-[#FFFFFF]/10 px-[24px] py-[32px] rounded-lg text-center">
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-white">
            Überprüfen Sie Ihre E-Mails
          </h3>
          <p className="text-gray-400">
            Wir haben einen Link zum Zurücksetzen des Passworts an {email}{" "}
            gesendet
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-[#FFFFFF]/10 px-[24px] py-[32px] rounded-lg"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-white text-gray-900 hover:bg-gray-200"
        disabled={isLoading}
      >
        {isLoading ? "Sending email..." : "Send email"}
      </Button>
    </form>
  );
}
