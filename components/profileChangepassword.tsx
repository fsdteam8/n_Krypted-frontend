"use client"

import React, { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

function ProfileChangepassword() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { data: session } = useSession()
    const accessToken = session?.user?.accessToken
    const userId = session?.user?.id

    console.log(userId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!userId) {
            toast.error('User session is invalid - please log in again')
            return
        }

        setIsLoading(true)

        try {
            // Validate passwords match
            if (newPassword !== confirmPassword) {
                throw new Error("New passwords don't match")
            }

            // Validate password strength
            if (newPassword.length < 8) {
                throw new Error("Password must be at least 8 characters")
            }

            const response = await fetch('https://n-krypted-backend-0g0t.onrender.com/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    userId, // Include user ID in the request
                    currentPassword,
                    newPassword
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Passwort konnte nicht geändert werden')
            }

            if (!data.success) {
                throw new Error(data.message || 'Password change failed')
            }

            toast.success('Passwort erfolgreich geändert')
            // Reset form
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error) {
            console.error('Password change error:', error)
            
            // Handle specific error cases
            if (error instanceof Error) {
                if (error.message.includes("Benutzer nicht gefunden")) {
                    toast.error("Ihre Sitzung scheint ungültig zu sein. Bitte melden Sie sich ab und erneut an.")
                } else if (error.message.includes("current password")) {
                    toast.error("Das aktuell von Ihnen eingegebene Passwort ist falscht")
                } else {
                    toast.error(error.message || 'Passwort konnte nicht geändert werden')
                }
            } else {
                toast.error('Ein unerwarteter Fehler ist aufgetreten')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Aktuelles Passwort"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-3 text-gray-400"
                    >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Neues Passwort"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 bg-[#4b4b4b] border-gray-600 text-white placeholder:text-gray-400"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-gray-400"
                    >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Neues Passwort bestätigen"
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

            <Button 
                type="submit" 
                className="w-full bg-white text-gray-900 hover:bg-gray-200" 
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            >
                {isLoading ? "Kennwort ändern..." : "Kennwort ändern"}
            </Button>
        </form>
    )
}

export default ProfileChangepassword