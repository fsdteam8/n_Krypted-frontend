"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      // ✅ Optional: wait a bit for session to be updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      const session = await getSession(); // ← you need to import this from 'next-auth/react'

      const role = session?.user?.role;

      toast.success("Anmeldung erfolgreich");

      if (role === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ein unbekannter Fehler ist aufgetreten");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSocialSignIn = async (provider: string) => {
  //   try {
  //     setIsLoading(true)
  //     await signIn(provider, { callbackUrl: "/dashboard" })
  //   } catch {
  //     toast.error("Login failed")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <form
      onSubmit={handleSubmit}
      // Applied styling from RegisterForm
      className="space-y-4 bg-[#373737] px-[24px] py-[32px] rounded-lg"
    >
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-white">
            Passwort
          </Label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Gib dein Passwort ein"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10 pr-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="flex justify-end">
          {/* Replaced Next.js Link with a standard anchor tag */}
          <a
            href="/forgot-password"
            className="text-white hover:text-blue-400 text-sm leading-none"
          >
            Passwort vergessen?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-white text-black hover:bg-gray-200"
        disabled={isLoading}
      >
        {isLoading ? "Anmeldung erfolgt..." : "Anmelden"}
      </Button>

      <div className="text-center text-sm text-[#BABABA]">
        Du hast noch kein Konto?{" "}
        {/* Replaced Next.js Link with a standard anchor tag */}
        <a href="/sign-up" className="text-white hover:text-blue-400">
          Jetzt registrieren
        </a>
      </div>
    </form>
  );
}
