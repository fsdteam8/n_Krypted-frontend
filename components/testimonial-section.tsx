"use client";
import { MoveLeft, MoveRight } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

// Define the feedback type based on your API response
type Feedback = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  isApproved: boolean; // Add isApproved field
};

type FeedbackResponse = {
  success: boolean;
  feedbacks: Feedback[];
};

export function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch feedback data using TanStack Query
  const { data, isLoading, isError } = useQuery<FeedbackResponse>({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/feedback`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }
      return response.json();
    },
  });

  // Filter feedbacks to only include those with isApproved: true
  const approvedFeedbacks =
    data?.feedbacks?.filter((feedback) => feedback.isApproved) || [];

  const handlePrev = () => {
    if (!approvedFeedbacks.length) return;
    setCurrentIndex(
      (prev) => (prev - 1 + approvedFeedbacks.length) % approvedFeedbacks.length
    );
  };

  const handleNext = () => {
    if (!approvedFeedbacks.length) return;
    setCurrentIndex((prev) => (prev + 1) % approvedFeedbacks.length);
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="container lg:mt-24 py-[50px]">
        <div className="text-white text-center">Feedback wird geladen ….</div>
      </section>
    );
  }

  // Show error state
  if (isError || !data?.success) {
    return (
      <section className="container lg:mt-24 py-[50px]">
        <div className="text-white text-center">
          Das Feedback konnte nicht geladen werden. Bitte versuchen Sie es
          später noch einmal.
        </div>
      </section>
    );
  }

  // If no approved feedback data
  if (!approvedFeedbacks.length) {
    return;
  }

  const feedback = approvedFeedbacks[currentIndex];

  return (
    <section className="container lg:mt-24 py-[50px]">
      <div className="grid gap-8 grid-cols-6">
        <div className="col-span-6 md:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-5 h-9 bg-white rounded" />
            <div className="flex items-center gap-2">
              <h1
                className="heading-size font-normal font-benedict text-white leading-[120%] tracking-[0.04em] 
                 [text-shadow:_0_0_1px_#fff,_0_0_15px_#fff,_0_0_15px_#fff]"
              >
                Testimonial
              </h1>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl lg:text-[26px] font-bold text-white mt-1 md:mt-2">
            Was sagt unsere Community?
          </h2>
        </div>

        <div className="col-span-6 md:col-span-4 lg:col-span-4">
          <div className="flex flex-col mb-5 pl-6 gap-4">
            <Image
              src="/assets/E.png"
              alt="quote"
              width={50}
              height={50}
              className="h-[25px] w-[35px] text-white"
            />
            <p className="text-white text-sm md:text-[17px] overflow-hidden">
              {feedback.message}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {feedback.name.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="text-white text-sm lg:text-lg font-medium">
                {feedback.name}
              </h4>
              <p className="text-white text-sm text-muted-foreground">
                Verifizierter Kunde
              </p>
            </div>

            <div className="ml-auto flex gap-2">
              <button
                className="px-[35px] py-[15px] rounded-sm border flex items-center justify-center border-white bg-[#212121] hover:bg-white hover:text-black group"
                onClick={handlePrev}
              >
                <MoveLeft className="h-4 w-4 -rotate-45 text-white group-hover:text-black" />
                <span className="sr-only">Previous</span>
              </button>
              <button
                className="px-[35px] py-[15px] rounded-sm border flex items-center justify-center border-white bg-[#212121] hover:bg-white hover:text-black group"
                onClick={handleNext}
              >
                <MoveRight className="h-4 w-4 -rotate-45 text-white group-hover:text-black" />
                <span className="sr-only">Next</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
