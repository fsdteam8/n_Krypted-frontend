"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { registerUser } from "@/app/actions/auth";
import { toast } from "sonner";

export function RegisterForm() {
  const [name, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // Added state for terms checkbox
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Sie müssen den Nutzungsbedingungen zustimmen");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        name,
        email,
        password,
        phoneNumber,
      });

      if (result.success) {
        toast.success("Konto erfolgreich erstellt!");
        sessionStorage.setItem("registerEmail", email);
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error(
        "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-[#373737] px-[24px] py-[32px] rounded-lg"
    >
      <div className="space-y-2">
        <Label htmlFor="username">Benutzername</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="username"
            placeholder="Gib deinen Benutzernamen ein"
            value={name}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="pl-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

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
        <Label htmlFor="phone">Telefonnummer</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="Gib deine Telefonnummer ein"
            value={phoneNumber}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Erstelle ein Passwort"
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Bestätige dein Passwort"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pl-10 pr-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none text-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Ich stimme den{" "}
            <Link href="/report" className="text-white hover:text-blue-400">
              Geschäftsbedingungen
            </Link>{" "}
          </label>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-white text-gray-900 hover:bg-gray-200"
        disabled={isLoading || !agreedToTerms} // Disable button if terms not agreed
      >
        {isLoading ? "Konto wird erstellt..." : "Registrieren"}
      </Button>

      <div className="text-center text-sm text-[#BABABA]">
        Hast du schon ein Konto?{" "}
        <Link href="/login" className="text-white hover:text-blue-400">
          Anmelden
        </Link>
      </div>
    </form>
  );
}