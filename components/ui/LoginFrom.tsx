"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
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
      toast.error("Fehler bei der Anmeldung");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail-Adresse</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Gib deine E-Mail-Adresse ein"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Passwort</Label>
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
          <Link
            href="/forgot-password"
            className="text-sm text-blue-500 hover:text-blue-400"
          >
            Passwort vergessen?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-white text-gray-900 hover:bg-gray-200"
        disabled={isLoading}
      >
        {isLoading ? "Anmeldung erfolgt" : "Anmelden"}
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="h-px flex-1 bg-gray-600"></div>
        <div className="h-px flex-1 bg-gray-600"></div>
      </div>

      {/* <div className="grid gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialSignIn("apple")}
          className="flex items-center justify-center gap-2 border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
            <path d="M10 2c1 .5 2 2 2 5"></path>
          </svg>
          Continue With Apple
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialSignIn("google")}
          className="flex items-center justify-center gap-2 border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v12"></path>
            <path d="M6 12h12"></path>
          </svg>
          Continue With Google
        </Button>
      </div> */}

      <div className="text-center text-sm text-[#BABABA]">
        Du hast noch kein Konto?{" "}
        <Link href="/sign-up" className="text-white hover:text-blue-400">
          Jetzt registrieren
        </Link>
      </div>
    </form>
  );
}
