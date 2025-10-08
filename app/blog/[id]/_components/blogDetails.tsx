"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Blog } from "../../_components/type";
import { useParams } from "next/navigation";
import { Calendar, UserRound } from "lucide-react";

interface BlogDetailsProps {
  id?: string;
}

const BlogDetails: React.FC<BlogDetailsProps> = ({ id }) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const blogId = id || (params?.id as string);

  console.log(blogId);

  useEffect(() => {
    if (!blogId) {
      setError("No blog ID provided");
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${blogId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setBlog(data.blog);
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError(err instanceof Error ? err.message : "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-white">
        <p>Blogbeitrag wird geladen …</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="p-4">
        <p>Blog not found</p>
      </div>
    );
  }

  console.log(blog);

  return (
    <div className="py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-[18px] md:text-[24px] leading-[110%] font-bold text-white pb-4">
            {blog.title}
          </h1>
          <div className="flex  items-center space-x-4">
            <div className="mt-2 text-white  text-[16px] flex items-center gap-2">
              <div>
                <Calendar className="text-white w-[14px]" />
              </div>
              {new Date(blog.createdAt).toLocaleString("en-US", {
                timeZone: "Europe/Berlin",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <div className=" space-x-2  mt-2 text-white  text-[18px] flex items-center gap-">
            <UserRound className="text-white w-[14px]" />
            <span className="text-white text-[16px]">{blog?.authorName}</span>
          </div>
        </div>

        <div className="rounded-xl aspect-video overflow-hidden">
          <Image
            src={blog.image || "/default-image.jpg"}
            alt={blog.title || "Blog image"}
            width={3000}
            height={3000}
            className="w-full h-full object-cover object-center"
            priority
          />
        </div>

        <div className="text-white font-[16px] leading-[19.2px]">
          <>
            <style>{`
              .blogcontent img {
                display: block;
                margin-left: auto;
                margin-right: auto;
              }
            `}</style>

            <div
              className="list-item list-none !text-white blogcontent mt-10"
              dangerouslySetInnerHTML={{
                __html: (blog?.description ?? "Blog Description").replace(
                  /<img /g,
                  '<img style="max-height:700px;height:auto;width:auto;display:block;margin:auto;" '
                ),
              }}
            />
          </>

          {/* <div className="pt-[150px]">
            <BlogCommentsSection blogId={blogId} />
          </div> */}
        </div>
        {/* 
        <BlogComments blogId={blogId} /> */}
      </div>
    </div>
  );
};

export default BlogDetails;
