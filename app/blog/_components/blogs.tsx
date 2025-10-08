"use client";
import React from "react";
import BlogsCard from "@/components/card/blogsCard";
import { Blog } from "./type";
import { PageHeader } from "@/Shared/PageHeader";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useQuery } from "@tanstack/react-query";

// Fetch function for blogs
const fetchBlogs = async (): Promise<{ blogs: Blog[] }> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`);
  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }
  return res.json();
};

function Blogs() {
  const {
    data: blogsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const blogs = blogsData?.blogs || [];

  // Skeleton Loader Component
  const SkeletonBlogCard = () => (
    <div className="max-w-[370px]">
      <Skeleton height={222} width="100%" className="rounded-t-xl" />
      <div className="p-2">
        <div className="flex items-center justify-between mb-4">
          <Skeleton width={100} height={16} />
          <Skeleton width={80} height={16} />
        </div>
        <Skeleton width="80%" height={20} count={2} />
      </div>
    </div>
  );

  if (isError) {
    return (
      <section>
        <PageHeader title="Unsere Blogs" imge="/assets/Blogbanner.jpg" />
        <div className="container my-24 text-center">
          <div className="text-red-500">
            Error loading blogs: {error.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader title="Unsere Blogs" imge="/assets/Blogbanner.jpg" />

      <div className="container my-10">
        <h1 className="text-[25px] lg:text-[32px] font-bold mb-8 text-center text-white">
          Stadtgedanken & Durchblicke
        </h1>
        <div className="text-center text-gray-300 mb-12 text-base lg:text-[16px]">
          Unser Blog ist für alle, die Städte lieben, mit all ihren Ecken, Ideen
          und Begegnungen. Bei uns geht&apos;s um Themen, die das urbane Leben
          bewegen: Wie entwickeln sich Städte? Wie entdeckt man neue
          Lieblingsorte? Und was macht einen richtig guten Tag in der Stadt aus?
          Lies rein, lass dich treiben und finde neue Perspektiven für dein
          eigenes Stadterlebnis.
        </div>
      </div>
      <div className="container my-24">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Display 3 skeleton cards while loading */}
            {[...Array(3)].map((_, index) => (
              <SkeletonBlogCard key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {blogs.map((blog: Blog) => (
              <BlogsCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Blogs;
