"use client";
import React, { useEffect, useState } from "react";
import BlogsCard from "@/components/card/blogsCard";
import { Blog } from "./type";
import { PageHeader } from "@/Shared/PageHeader";

function Blogs() {
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
    <section>
      <PageHeader title="Our Latest Blogs" imge="/assets/Blogbanner.jpg" />
      <div className="container my-24">
        {loading ? (
          <p className="text-center text-white">Loading blogs...</p>
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
