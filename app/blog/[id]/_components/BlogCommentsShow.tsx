"use client";

import { MoveLeft, MoveRight} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

// Updated types to match the API response structure
type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  country?: string;
};

type Comment = {
  _id: string;
  userId: User; // Now userId contains the full user object
  message: string;
  blogId: string;
  createdAt: string;
  __v: number;
};

type CommentsResponse = {
  success: boolean;
  comments: Comment[];
};

interface BlogCommentsSectionProps {
  blogId: string;
}

export function BlogCommentsSection({ blogId }: BlogCommentsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch comments data using TanStack Query
  const { data, isLoading, isError } = useQuery<CommentsResponse>({
    queryKey: ["comments", blogId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${blogId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      return response.json();
    },
  });

  const handlePrev = () => {
    if (!data?.comments?.length) return;
    setCurrentIndex(
      (prev) => (prev - 1 + data.comments.length) % data.comments.length
    );
  };

  const handleNext = () => {
    if (!data?.comments?.length) return;
    setCurrentIndex((prev) => (prev + 1) % data.comments.length);
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="container lg:mt-24 py-[50px]">
        <div className="text-gray-800">Loading comments...</div>
      </section>
    );
  }

  // Show error state
  if (isError || !data?.success) {
    return (
      <section className="container lg:mt-24 py-[50px]">
        <div className="text-gray-800">
          Failed to load comments. Please try again later.
        </div>
      </section>
    );
  }

  // If no comments data
  if (!data.comments || data.comments.length === 0) {
    return (
      <section className="container lg:mt-24 bg-white rounded-2xl py-6">
        <div className="text-black text-center">
          No comments available at the moment.
        </div>
      </section>
    );
  }

  const comment = data.comments[currentIndex];
  const user = comment.userId; // User data is now directly available in the comment

  // Format date to be more readable
  const formattedDate = new Date(comment.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <section className="container !mt-[-70px] py-4 bg-white rounded-2xl">
          <div className="relative mb-5 pl-6 py-8">
            {/* <Quote className="absolute left-0 top-0 h-5 w-5 text-gray-500" /> */}
            <p className="text-lg italic text-[#212121]">{comment.message}</p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-700 flex items-center justify-center">
                {user.avatar ? (
                  <Image
                    src={user.avatar || "/placeholder.svg"}
                    alt={`${user.name}'s avatar`}
                    className="h-full w-full object-cover"
                    width={100}
                    height={100}
                  />
                ) : (
                  <span className="text-white text-lg font-bold">
                    {user.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-gray-800 text-sm lg:text-lg font-medium">
                  {user.name || "Unknown User"}
                </h4>
                <p className="text-gray-600 text-sm">{formattedDate}</p>
              </div>
            </div>

            <div className=" flex gap-2">
              <button
                className="px-[35px] py-[15px] rounded-sm border flex items-center justify-center border-gray-300 bg-[#212121] hover:bg-white hover:text-black group"
                onClick={handlePrev}
              >
                <MoveLeft className="h-4 w-4 -rotate-45 text-white group-hover:text-black" />
                <span className="sr-only">Previous</span>
              </button>
              <button
                className="px-[35px] py-[15px] rounded-sm border flex items-center justify-center border-gray-300 bg-[#212121] hover:bg-white hover:text-black group"
                onClick={handleNext}
              >
                <MoveRight className="h-4 w-4 -rotate-45 text-white group-hover:text-black" />
                <span className="sr-only">Next</span>
              </button>
            </div>
          </div>
    </section>
  );
}
