"use client";

import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactUsForm() {
  const [formData, setFormData] = useState({
    name: "", // Changed from fullName to match API
    email: "",
    phoneNumber: "", // Changed from phone to match API
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  console.log(submitStatus);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "message") {
      const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 300) return; // Prevent setting value if over 300 words
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({
        success: false,
        message: "Please fill in all required fields",
      });
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setSubmitStatus({
        success: false,
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            message: formData.message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit feedback");
      }

      // Reset form on successful submission
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        message: "",
      });

      setSubmitStatus({
        success: true,
        message: "Vielen Dank für Ihre Nachricht. Wir melden uns so schnell wie möglich bei Ihnen!",
      });

      // Log the full response for debugging
     
    } catch (error) {
      console.error("Feedback submission error:", error);
      setSubmitStatus({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      toast.success(
        "Vielen Dank für Ihre Nachricht. Wir melden uns so schnell wie möglich bei Ihnen!"
      );
    }
  };

  return (
    <div className="container py-24 lg:mt-24">
      <div>
        <h1 className="text-xl lg:text-4xl lg:text-[40px] font-bold mb-4 text-white text-center">
          Du hast Feedback oder eine Idee?
        </h1>
        <h1
          // className="font-benedict text-2xl sm:text-3xl md:text-4xl mb-6 md:mb-8 text-center text-white"
          className="heading-size font-normal font-benedict text-white leading-[120%] tracking-[0.04em] text-center 
                 [text-shadow:_0_0_1px_#fff,_0_0_15px_#fff,_0_0_15px_#fff]"
          style={{ fontFamily: "cursive" }}
        >
          Lass von dir hören!
        </h1>
      </div>

      <div>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white pb-2"
                >
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Geben Sie Ihren vollständigen Namen ein"
                  className="w-full p-3 bg-[#212121] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-white text-sm sm:text-base"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white pb-2"
                >
                  E-Mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Geben Sie Ihre E-Mail-Adresse ein"
                  className="w-full p-3 bg-[#212121] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-white text-sm sm:text-base"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-white pb-2"
                >
                  Mobilnummer
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Geben Sie Ihre Telefonnummer ein"
                  className="w-full p-3 bg-[#212121] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-white text-sm sm:text-base"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-white pb-2"
              >
                Nachricht *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Schreib eine Nachricht"
                className="w-full h-[200px] lg:h-[255px] p-3 bg-[#212121] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 text-white text-sm sm:text-base"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Status message */}
          {/* {submitStatus && (
            <div className={`text-center ${submitStatus.success ? 'text-green-400' : 'text-red-400'}`}>
              {submitStatus.message}
            </div>
          )} */}

          <div className="flex justify-center pt-8">
            <button
              type="submit"
              className="bg-white text-black px-4 sm:px-6 py-2 rounded-md hover:bg-white/90 transition-colors text-sm sm:text-base disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Einreichen..." : "Einreichen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
