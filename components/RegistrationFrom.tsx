"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { registerUser } from "@/app/actions/auth"
import { toast } from "sonner"

export function RegisterForm() {
  const [name, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // In your RegisterForm component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein")
      return
    }

    setIsLoading(true)

    try {
      const result = await registerUser({
        name,
        email,
        password,
        phoneNumber,
      })

      if (result.success) {
        toast.success("Konto erfolgreich erstellt!")

        // Store email in sessionStorage before redirecting
        sessionStorage.setItem("registerEmail", email)

        // Redirect to verify-email with the email as a query parameter
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#373737] px-[24px] py-[32px] rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="username"
            placeholder="Enter your Username"
            value={name}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="pl-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a Password"
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
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm a Password"
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
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
        <label
          htmlFor="remember"
          className="text-sm font-medium leading-none text-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Remember me
        </label>
      </div>

      <Button type="submit" className="w-full bg-white text-gray-900 hover:bg-gray-200" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>

      <div className="text-center text-sm text-[#BABABA]">
        Already have an account?{" "}
        <Link href="/login" className="text-white hover:text-blue-400">
          Sign in
        </Link>
      </div>
    </form>
  )
}
