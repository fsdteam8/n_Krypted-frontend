"use client";

import { useEffect, useState } from "react";
import { Blog } from "@/app/blog/_components/type";
import BlogsCard from "./card/blogsCard";
import Link from "next/link";
import { Button } from "./ui/button";
import { MoveRight } from "lucide-react";

export function BlogsSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`);
        const data = await res.json();
        setBlogs(data.blogs);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="container lg:mt-24">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <div className="w-5 h-9 bg-white rounded" />
            <div>
              <h1
                className="text-[40px] font-normal font-benedict text-white leading-[120%] tracking-[0.04em] 
                 [text-shadow:_0_0_1px_#fff,_0_0_15px_#fff,_0_0_15px_#fff]"
              >
                Blog
              </h1>
            </div>
          </div>
          <p className="text-xl md:text-2xl lg:text-[30px] font-bold text-white mt-1 md:mt-2">
            Unsere aktuellen Blogs
          </p>
        </div>
        <Link href={"/blog"}>
          <Button className="bg-white text-black">
            Jetzt entdecken <MoveRight />
          </Button>
        </Link>
      </div>

      <div className="py-8">
        {loading ? (
          <p className="text-center">Loading blogs...</p>
        ) : (
          <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 md:grid-cols-3">
            {blogs?.slice(0, 6).map((blog: Blog) => (
              <BlogsCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
