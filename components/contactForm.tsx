"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

export default function ContactForm() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        message: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<{
        success: boolean
        message: string
    } | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basic validation
        if (!formData.fullName || !formData.email || !formData.message) {
            setSubmitStatus({
                success: false,
                message: "Please fill in all required fields"
            })
            return
        }

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setSubmitStatus({
                success: false,
                message: "Please enter a valid email address"
            })
            return
        }

        setIsSubmitting(true)
        setSubmitStatus(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.fullName, // Maps to API's 'name' field
                    email: formData.email,
                    phoneNumber: formData.phone, // Maps to API's 'phoneNumber' field
                    message: formData.message
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit feedback')
            }

            // Reset form on successful submission
            setFormData({
                fullName: "",
                email: "",
                phone: "",
                message: ""
            })

            setSubmitStatus({
                success: true,
                message: "Vielen Dank für Ihre Nachricht! Wir melden uns in Kürze bei Ihnen."
            })

            console.log("API Response:", data)
        } catch (error) {
            console.error("Submission error:", error)
            setSubmitStatus({
                success: false,
                message: error instanceof Error ? error.message : "Something went wrong. Please try again."
            })
        } finally {
            setIsSubmitting(false)
            toast.success(submitStatus?.message || "Vielen Dank für Ihre Nachricht! Wir melden uns in Kürze bei Ihnen.")
        }
    }

    return (
        <div className="">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-white pb-2">
                        Name *
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full p-3 bg-[#212121] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-white text-sm sm:text-base"
                        disabled={isSubmitting}
                        required
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white pb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your Email Address"
                            className="w-full p-3 bg-[#212121] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-white text-sm sm:text-base"
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-white pb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your Phone Number"
                            className="w-full p-3 bg-[#212121] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-white text-sm sm:text-base"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-white pb-2">
                        Message *
                    </label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Enter your message"
                        className="w-full h-[150px] sm:h-[189px] lg:h-[189px] p-3 pb-8 bg-[#212121] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-white text-sm sm:text-base"
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        className="bg-white text-black px-4 sm:px-6 py-2 rounded-md hover:bg-white/90 transition-colors text-sm sm:text-base disabled:opacity-70"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    )
}