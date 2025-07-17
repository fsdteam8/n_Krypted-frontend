"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface PersonalInfoData {
  name: string
  email: string
  phoneNumber: string
  country?: string
  cityState?: string
  roadArea?: string
}

export default function PersonalInfoForm({ initialData }: { initialData: PersonalInfoData }) {
  const { data: session, update: updateSession } = useSession()
  const [formData, setFormData] = useState<PersonalInfoData>({
    name: initialData.name || "",
    email: initialData.email || "",
    phoneNumber: initialData.phoneNumber || "",
    country: initialData.country || "",
    cityState: initialData.cityState || "",
    roadArea: initialData.roadArea || ""
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user?.id) {
      toast.error('Authentication required')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session?.user as { accessToken?: string })?.accessToken || ''}`
        },
        body: JSON.stringify({
          userId: session.user.id,
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          ...(formData.country && { country: formData.country }),
          ...(formData.cityState && { cityState: formData.cityState }),
          ...(formData.roadArea && { roadArea: formData.roadArea }),
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Profil konnte nicht aktualisiert werden')
      }

      toast.success('Profil erfolgreich aktualisiert')
      
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          country: formData.country,
          cityState: formData.cityState,
          roadArea: formData.roadArea,
        }
      })
      
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Profil konnte nicht aktualisiert werden')
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        country: initialData.country || "",
        cityState: initialData.cityState || "",
        roadArea: initialData.roadArea || ""
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#FFFFFF]">Persönliche Informationen</h1>
        {!isEditing && (
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)} 
            className="text-sm bg-[#FFFFFF] text-[#212121] hover:bg-[#FFFFFF]/80"
            disabled={!session}
          >
            <Edit className="mr-2 h-4 w-4"/>
            Edit
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm text-[#FFFFFF]">
              Ihr Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              disabled={!isEditing || !session}
              className="bg-transparent border-[#E0E0E0] text-[#FFFFFF]"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm text-[#FFFFFF]">
              E-Mail-Adresse
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              disabled={!isEditing || !session}
              className="bg-transparent border-[#E0E0E0] text-[#FFFFFF]"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="block text-sm text-[#FFFFFF]">
              Telefon
            </label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleChange}
              disabled={!isEditing || !session}
              className="bg-transparent border-[#E0E0E0] text-[#FFFFFF]"
            />
          </div>

          {/* Country Field */}
          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm text-[#FFFFFF]">
              Country
            </label>
            <Input
              id="country"
              name="country"
              value={formData.country || ""}
              onChange={handleChange}
              disabled={!isEditing || !session}
              className="bg-transparent border-[#E0E0E0] text-[#FFFFFF]"
              placeholder="Geben Sie Ihr Land ein"
            />
          </div>

          {/* City/State Field */}
          <div className="space-y-2">
            <label htmlFor="cityState" className="block text-sm text-[#FFFFFF]">
              City/State
            </label>
            <Input
              id="cityState"
              name="cityState"
              value={formData.cityState || ""}
              onChange={handleChange}
              disabled={!isEditing || !session}
              className="bg-transparent border-[#E0E0E0] text-[#FFFFFF]"
              placeholder="Geben Sie Ihre Stadt/Ihr Bundesland ein"
            />
          </div>
        </div>

        {/* Road/Area Field */}
        <div className="space-y-2">
          <label htmlFor="roadArea" className="block text-sm text-[#FFFFFF]">
            Road/Area
          </label>
          <Input
            id="roadArea"
            name="roadArea"
            value={formData.roadArea || ""}
            onChange={handleChange}
            disabled={!isEditing || !session}
            className="bg-transparent border-[#E0E0E0] text-[#FFFFFF]"
            placeholder="Geben Sie Ihre Straße/Ihr Gebiet ein"
          />
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  name: initialData.name || "",
                  email: initialData.email || "",
                  phoneNumber: initialData.phoneNumber || "",
                  country: initialData.country || "",
                  cityState: initialData.cityState || "",
                  roadArea: initialData.roadArea || ""
                })
                setIsEditing(false)
              }}
              className="text-[#212121]"
              disabled={isLoading}
            >
              Stornieren
            </Button>
            <Button 
              type="submit" 
              className="bg-white text-[#212121] hover:bg-white/90"
              disabled={isLoading || !session}
            >
              {isLoading ? "Speichern..." : "Änderungen speichern"}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}